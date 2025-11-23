import { useState } from 'react';
import {
  ExperimentScenario,
  ExperimentResult,
  AllocatorStrategy,
  TransmitterStrategy,
} from '../../../types';
import { api } from '../../../services/api';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { ExperimentFormState } from '../utils/mappers';

/**
 * 実験シナリオの生成と実行のためのHook
 */
export const useScenarioExecution = (
  notify: (type: 'success' | 'error', title: string, message: string) => void,
  onRegisterResult: (result: ExperimentResult) => void
) => {
  const [scenarios, setScenarios] = useState<ExperimentScenario[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecutionRunning, setIsExecutionRunning] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);

  useWebSocket<{
    executionId: string;
    scenarioId?: number;
    status?: string;
    log?: string;
    type?: string;
  }>('/ws/experiment/progress', msg => {
    if (msg.executionId !== executionId) return;

    if (msg.type === 'ALL_COMPLETE') {
      setIsExecutionRunning(false);
      // [修正] 全完了通知は、ここでは不要なので削除
      return;
    }

    setScenarios(prev =>
      prev.map(s => {
        if (s.id === msg.scenarioId) {
          const nextLogs = msg.log ? [...s.logs, msg.log] : s.logs;

          // [修正] RUNNING ステータスに遷移したときに通知を出す
          if (msg.status === 'RUNNING' && s.status !== 'RUNNING') {
            notify('success', '実行開始', `シナリオ #${s.id} の実行を開始しました。`);
          }

          return {
            ...s,
            status: (msg.status as any) || s.status,
            logs: nextLogs,
            failReason: msg.status === 'FAIL' ? msg.log : s.failReason,
          };
        }
        return s;
      })
    );
  });

  const generateScenarios = async (params: ExperimentFormState & { users: any; setIsOpen: any }) => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 500));

    const newScenarios: ExperimentScenario[] = [];
    let idCounter = 1;
    const cleanName = params.projectName.replace(/[^a-zA-Z0-9_]/g, '') || 'Exp';

    const getRange = (p: { mode: string; fixed?: number; range?: any }) => {
      if (p.mode === 'fixed') return [p.fixed!];
      const res = [];
      const start = Number(p.range.start);
      const end = Number(p.range.end);
      const step = Number(p.range.step);

      if (step <= 0 || start > end) return [start];
      for (let i = start; i <= end; i += step) {
        res.push(i);
      }
      return res;
    };

    const dataSizes = getRange(params.dataSizeParams);
    const chunkSizes = getRange(params.chunkSizeParams);
    const allocators = Array.from(params.selectedAllocators);
    const transmitters = Array.from(params.selectedTransmitters);

    // --- Chain Selection Logic ---
    // 固定モードでもRangeモードでも、まずは選択されたチェーンのリストを取得してソートする
    const sortedSelectedChains = Array.from(params.selectedChains).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    // 使用する「チェーン数」の配列を決定
    let chainCounts: number[] = [];
    if (params.chainMode === 'range') {
      // Rangeモード: Step設定に基づいて台数配列を作る (例: 1, 2, 3...)
      // ただし、選択されているチェーン数を超えないようにクランプする
      const { start, end, step } = params.chainRangeParams;
      const maxCount = sortedSelectedChains.length;

      if (step > 0) {
        for (let i = start; i <= end; i += step) {
          if (i > 0 && i <= maxCount) {
            chainCounts.push(i);
          }
        }
      }
      if (chainCounts.length === 0) chainCounts = [1]; // Fallback
    } else {
      // Fixedモード: 選択されたチェーン全てを使用する (1パターンのみ)
      chainCounts = [sortedSelectedChains.length];
    }

    // Cartesian Product Generation
    for (const ds of dataSizes) {
      for (const cs of chunkSizes) {
        for (const cCount of chainCounts) {
          for (const alloc of allocators) {
            for (const trans of transmitters) {

              // 台数(cCount)に応じて、選択リストの先頭から切り出す
              // 例: selected=[1,2,4], cCount=2 => [1,2]
              const targets = sortedSelectedChains.slice(0, cCount);

              if (targets.length === 0) continue;

              newScenarios.push({
                id: idCounter++,
                uniqueId: `${cleanName}_${Date.now()}_${idCounter}`,
                dataSize: ds,
                chunkSize: cs,
                allocator: alloc,
                transmitter: trans,
                chains: targets.length,
                targetChains: targets, // 具体的なチェーンIDリストを保存
                budgetLimit: 1000,
                cost: parseFloat(
                  (ds * 0.5 + (alloc === AllocatorStrategy.AVAILABLE ? 5 : 0)).toFixed(2)
                ),
                status: 'READY',
                failReason: null,
                progress: 0,
                logs: [],
              });
            }
          }
        }
      }
    }

    setScenarios(newScenarios);
    params.setIsOpen(true);
    setIsGenerating(false);
    notify(
      'success',
      'シナリオ生成完了',
      `${newScenarios.length} 件のシナリオが生成されました。`
    );
  };

  const executeScenarios = async (projectName: string) => {
    setIsExecutionRunning(true);
    notify('success', 'ジョブをキューに追加しました', 'シナリオが実行キューに送信されました。');

    const readyScenarios = scenarios.filter(s => s.status === 'READY');
    const res = await api.experiment.run(readyScenarios);
    setExecutionId(res.executionId);
  };

  const reprocessCondition = (id: number) => {
    setScenarios(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'READY', failReason: null } : s))
    );
  };

  const handleRecalculateAll = () => {
    setScenarios(prev =>
      prev.map(s => (s.status === 'FAIL' ? { ...s, status: 'READY', failReason: null } : s))
    );
  };

  return {
    scenarios,
    isGenerating,
    isExecutionRunning,
    generateScenarios,
    executeScenarios,
    reprocessCondition,
    handleRecalculateAll,
  };
};
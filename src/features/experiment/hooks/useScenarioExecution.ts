// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/features/experiment/hooks/useScenarioExecution.ts

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
  notify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void,
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
      return;
    }

    setScenarios(prev =>
      prev.map(s => {
        if (s.id === msg.scenarioId) {
          const nextLogs = msg.log ? [...s.logs, msg.log] : s.logs;

          // ステータス遷移時の通知ロジック
          // 非同期で通知してレンダリングサイクルとの競合を防ぐ
          if (msg.status && msg.status !== s.status) {
            setTimeout(() => {
              if (msg.status === 'RUNNING' && s.status !== 'RUNNING') {
                notify('info', '実行開始', `シナリオ #${s.id} の実行を開始しました。`);
              } else if (msg.status === 'COMPLETE' && s.status !== 'COMPLETE') {
                notify('success', '実行完了', `シナリオ #${s.id} が正常に完了しました。`);
              } else if (msg.status === 'FAIL' && s.status !== 'FAIL') {
                notify('error', '実行失敗', `シナリオ #${s.id} が失敗しました: ${msg.log || '不明なエラー'}`);
              }
            }, 0);
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
    const sortedSelectedChains = Array.from(params.selectedChains).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    let chainCounts: number[] = [];
    if (params.chainMode === 'range') {
      const { start, end, step } = params.chainRangeParams;
      const maxCount = sortedSelectedChains.length;

      if (step > 0) {
        for (let i = start; i <= end; i += step) {
          if (i > 0 && i <= maxCount) {
            chainCounts.push(i);
          }
        }
      }
      if (chainCounts.length === 0) chainCounts = [1];
    } else {
      chainCounts = [sortedSelectedChains.length];
    }

    // Cartesian Product Generation
    for (const ds of dataSizes) {
      for (const cs of chunkSizes) {
        for (const cCount of chainCounts) {
          for (const alloc of allocators) {
            for (const trans of transmitters) {
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
                targetChains: targets,
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
    notify('info', 'ジョブをキューに追加しました', 'シナリオが実行キューに送信されました。');

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
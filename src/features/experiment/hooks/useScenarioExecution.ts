// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/features/experiment/hooks/useScenarioExecution.ts

import { useState, useRef } from 'react';
import {
  ExperimentScenario,
  ExperimentResult,
  AllocatorStrategy,
  TransmitterStrategy,
  ExecutionResultDetails,
} from '../../../types';
import { api } from '../../../services/api';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { ExperimentFormState } from '../utils/mappers';

/**
 * 実験シナリオの生成、試算、実行を管理するHook
 */
export const useScenarioExecution = (
  notify: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void,
  onRegisterResult: (result: ExperimentResult) => void,
  onBalanceUpdate?: () => void
) => {
  const [scenarios, setScenarios] = useState<ExperimentScenario[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecutionRunning, setIsExecutionRunning] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);

  // 試算中断用のRef
  const abortEstimationRef = useRef(false);

  // WebSocketによる進捗更新
  useWebSocket<{
    executionId: string;
    scenarioId?: number;
    status?: string;
    log?: string;
    type?: string;
    resultDetails?: ExecutionResultDetails;
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

          // ステータス遷移時の通知処理
          if (msg.status && msg.status !== s.status) {
            // 完了時（成功/失敗）に詳細な通知を出す
            if (
              (msg.status === 'COMPLETE' || msg.status === 'FAIL') &&
              msg.resultDetails
            ) {
              const { userName, actualCost, refund, currentBalance } = msg.resultDetails;
              const statusText = msg.status === 'COMPLETE' ? '完了' : '失敗';
              const type = msg.status === 'COMPLETE' ? 'success' : 'error';

              setTimeout(
                () =>
                  notify(
                    type,
                    `シナリオ #${s.id} 実行${statusText}`,
                    `[${userName}] 消費: ${actualCost.toFixed(2)} TKN (返還: ${refund.toFixed(2)} TKN)\n残高: ${currentBalance.toFixed(2)} TKN`
                  ),
                0
              );

              // 残高情報の更新をトリガー
              if (onBalanceUpdate) {
                onBalanceUpdate();
              }

            } else if (msg.status === 'FAIL' && !msg.resultDetails) {
              setTimeout(
                () =>
                  notify(
                    'error',
                    '実行エラー',
                    `シナリオ #${s.id} が失敗しました: ${msg.log || ''}`
                  ),
                0
              );
            }
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

  /**
   * 順次コスト試算を実行する関数
   */
  const runEstimationSequence = async (
    targetScenarios: ExperimentScenario[],
    initialUsers: any[]
  ) => {
    abortEstimationRef.current = false;

    const userBalances: { [key: string]: number } = {};
    initialUsers.forEach(u => {
      userBalances[u.id] = u.balance;
    });

    const updateStatus = (id: number, status: string, cost = 0, reason: string | null = null) => {
      setScenarios(prev =>
        prev.map(s => (s.id === id ? { ...s, status: status as any, cost, failReason: reason } : s))
      );
    };

    for (const scenario of targetScenarios) {
      if (abortEstimationRef.current) break;

      updateStatus(scenario.id, 'CALCULATING');

      try {
        const res = await api.experiment.estimate(scenario as any);
        const estimatedCost = res.cost;
        const currentBalance = userBalances[scenario.userId] || 0;

        if (currentBalance < estimatedCost) {
          updateStatus(
            scenario.id,
            'FAIL',
            estimatedCost,
            `資金不足 (残高: ${currentBalance.toFixed(2)} < 必要: ${estimatedCost.toFixed(2)})`
          );
          abortEstimationRef.current = true;
          notify('error', '試算中断', `シナリオ #${scenario.id} で資金不足が発生しました。`);
          break;
        } else {
          userBalances[scenario.userId] -= estimatedCost;
          updateStatus(scenario.id, 'READY', estimatedCost);
        }
      } catch (e) {
        updateStatus(scenario.id, 'FAIL', 0, '試算APIエラー');
        abortEstimationRef.current = true;
        break;
      }
    }
  };

  /**
   * シナリオ生成 & 初回試算開始
   */
  const generateScenarios = async (params: ExperimentFormState & { users: any; setIsOpen: any }) => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 300));

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
                userId: params.selectedUserId,
                dataSize: ds,
                chunkSize: cs,
                allocator: alloc,
                transmitter: trans,
                chains: targets.length,
                targetChains: targets,
                budgetLimit: 1000,
                cost: 0,
                status: 'PENDING',
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
      'info',
      'シナリオ生成',
      `${newScenarios.length} 件のシナリオを生成しました。コスト試算を開始します。`
    );

    runEstimationSequence(newScenarios, params.users);
  };

  const executeScenarios = async (projectName: string) => {
    setIsExecutionRunning(true);
    notify('info', '実行開始', 'シナリオを順次実行します。');

    const readyScenarios = scenarios.filter(s => s.status === 'READY');
    const res = await api.experiment.run(readyScenarios);
    setExecutionId(res.executionId);
  };

  const handleRecalculateAll = async (users: any[]) => {
    const resetScenarios = scenarios.map(s => ({
      ...s,
      status: 'PENDING' as const,
      failReason: null,
      logs: [],
      cost: 0,
    }));
    setScenarios(resetScenarios);
    notify('info', '再試算開始', '全てのシナリオのコストを再計算します。');
    await runEstimationSequence(resetScenarios, users);
  };

  const reprocessCondition = (id: number) => {
    setScenarios(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'PENDING', failReason: null } : s))
    );
  };

  // --- 削除系ロジック ---

  const removeScenario = (id: number) => {
    if (isExecutionRunning) {
      notify('warning', '操作不可', '実行中はシナリオを削除できません。');
      return;
    }
    const target = scenarios.find(s => s.id === id);
    if (target && (target.status === 'CALCULATING' || target.status === 'PENDING')) {
      notify('warning', '操作不可', 'コスト試算中はシナリオを削除できません。');
      return;
    }
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  const clearAllScenarios = () => {
    if (isExecutionRunning) {
      notify('warning', '操作不可', '実行中はシナリオを削除できません。');
      return;
    }
    // 試算中が含まれている場合は全削除不可
    const isEstimating = scenarios.some(s => s.status === 'CALCULATING' || s.status === 'PENDING');
    if (isEstimating) {
      notify('warning', '操作不可', 'コスト試算中はシナリオを削除できません。');
      return;
    }

    setScenarios([]);
    notify('info', 'キュー削除', 'すべてのシナリオを削除しました。');
  };

  return {
    scenarios,
    isGenerating,
    isExecutionRunning,
    generateScenarios,
    executeScenarios,
    handleRecalculateAll,
    reprocessCondition,
    removeScenario,
    clearAllScenarios,
  };
};
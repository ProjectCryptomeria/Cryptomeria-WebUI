import { StoreSlice } from '@/shared/store/types';
import { api } from '@/shared/api';
import { ExperimentScenario, AllocatorStrategy, TransmitterStrategy, ExecutionResultDetails, ScenarioStatus } from '@/entities/scenario';
import { UserAccount } from '@/entities/account';
import { ExecutionState, GenerateScenariosParams, ValueParam } from './types';

export const createExecutionSlice: StoreSlice<{
  execution: ExecutionState;
}> = (set, get) => ({
  execution: {
    scenarios: [],
    isGenerating: false,
    isExecutionRunning: false,
    executionId: null,

    updateScenario: (id: string, updates: Partial<ExperimentScenario> & { log?: string; resultDetails?: ExecutionResultDetails }, isComplete = false) => {
      // スライスをまたぐアクション呼び出し
      const { addToast, registerResult, updateUserBalance } = get();

      set(state => ({
        execution: {
          ...state.execution,
          scenarios: state.execution.scenarios.map(s => {
            if (s.uniqueId === id) {
              const newStatus = updates.status || s.status;
              const newLog = updates.log ? [...s.logs, updates.log] : s.logs;

              // 実行完了時: 結果を登録し、通知を出す
              if (isComplete && (newStatus === 'COMPLETE' || newStatus === 'FAIL')) {
                const details = updates.resultDetails;
                let toastTitle = '';
                let toastMessage = '';

                if (details) {
                  const actualCost = details.actualCost.toFixed(2);
                  const refund = details.refund.toFixed(2);
                  const currentBalance = details.currentBalance.toFixed(2);
                  const userName = details.userName || 'Unknown User';

                  if (newStatus === 'COMPLETE') {
                    toastTitle = `シナリオ #${s.id} 結果 (${s.uniqueId.substring(0, 8)}...)`;
                    toastMessage = `アカウント: ${userName} | 費用: ${actualCost} TKN (返金: ${refund} TKN) | 残高: ${currentBalance} TKN`;
                    // ライブラリに結果を登録
                    if (details.result) {
                      registerResult(details.result);
                    }
                  } else {
                    toastTitle = `シナリオ #${s.id} エラー (${s.uniqueId.substring(0, 8)}...)`;
                    toastMessage = `アカウント: ${userName} | 費用: ${actualCost} TKN (返金: ${refund} TKN) | 残高: ${currentBalance} TKN`;
                  }

                  // 他のスライスのアクションを呼び出し
                  updateUserBalance(details.userId, details.currentBalance);
                } else {
                  toastTitle = newStatus === 'COMPLETE' ? '実行完了' : '実行失敗';
                  toastMessage = `シナリオ #${s.id} が${toastTitle}しました。`;
                }

                addToast(newStatus === 'COMPLETE' ? 'success' : 'error', toastTitle, toastMessage);

                return {
                  ...s,
                  status: newStatus,
                  logs: newLog,
                  failReason: updates.failReason || s.failReason,
                  cost: updates.resultDetails?.actualCost || s.cost,
                } as ExperimentScenario;
              }

              return {
                ...s,
                ...updates,
                logs: newLog,
                status: newStatus,
              } as ExperimentScenario;
            }
            return s;
          }),
        },
      }));
    },

    updateExecutionStatus: (running, executionId = null) => {
      set(state => ({
        execution: {
          ...state.execution,
          isExecutionRunning: running,
          executionId: executionId,
        },
      }));
    },

    generateScenarios: async (params: GenerateScenariosParams) => {
      const { addToast } = get();
      set(state => ({ execution: { ...state.execution, isGenerating: true } }));

      // Simulate delay
      await new Promise(r => setTimeout(r, 300));

      const newScenarios: ExperimentScenario[] = [];
      let idCounter = 1;
      const cleanName = params.projectName.replace(/[^a-zA-Z0-9_]/g, '') || 'Exp';

      const getRange = (p: ValueParam): (string | number)[] => {
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
      const allocators = Array.from(params.selectedAllocators) as AllocatorStrategy[];
      const transmitters = Array.from(params.selectedTransmitters) as TransmitterStrategy[];

      const sortedSelectedChains = Array.from(params.selectedChains as Set<string>).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );

      let chainCounts: number[] = [];
      if (params.chainMode === 'range') {
        const { start, end, step } = params.chainRangeParams;
        const maxCount = sortedSelectedChains.length;
        if (Number(step) > 0) {
          for (let i = Number(start); i <= Number(end); i += Number(step)) {
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
                  dataSize: ds as number,
                  chunkSize: cs as number,
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

      set(state => ({
        execution: {
          ...state.execution,
          scenarios: newScenarios,
          isGenerating: false,
        },
      }));

      params.setIsOpen(true);
      addToast(
        'info',
        'シナリオ生成',
        `${newScenarios.length} 件のシナリオを生成しました。コスト試算を開始します。`
      );

      const { users } = get();
      await get().execution.recalculateAll(users);
    },

    executeScenarios: async projectName => {
      const { addToast, execution } = get();
      get().execution.updateExecutionStatus(true);
      addToast('info', '実行開始', 'シナリオを順次実行します。');

      const readyScenarios = execution.scenarios.filter(s => s.status === 'READY');
      try {
        const res = await api.experiment.run(readyScenarios);
        get().execution.updateExecutionStatus(true, res.executionId);
      } catch {
        addToast('error', '実行エラー', 'シナリオの実行開始に失敗しました。');
        get().execution.updateExecutionStatus(false);
      }
    },

    recalculateAll: async (users: UserAccount[]) => {
      const { addToast } = get();

      const userBalances: { [key: string]: number } = {};
      users.forEach((u: UserAccount) => {
        userBalances[u.id] = u.balance;
      });

      const updateStatus = (id: number, status: string, cost = 0, reason: string | null = null) => {
        set(state => ({
          execution: {
            ...state.execution,
            scenarios: state.execution.scenarios.map(s =>
              s.id === id ? { ...s, status: status as ScenarioStatus, cost, failReason: reason } : s
            ),
          },
        }));
      };

      const { execution } = get();
      const targetScenarios = execution.scenarios.filter(
        s => s.status === 'PENDING' || s.status === 'FAIL'
      );

      if (targetScenarios.length === 0) return;

      let abort = false;

      for (const scenario of targetScenarios) {
        if (abort) break;
        updateStatus(scenario.id, 'CALCULATING');

        try {
          // api.experiment.estimate の引数と戻り値は API層の定義に依存するため as any を残す
          const res = await api.experiment.estimate(scenario as any);
          const estimatedCost = res.cost;
          const currentBalance = userBalances[scenario.userId] || 0;

          if (currentBalance < estimatedCost) {
            updateStatus(
              scenario.id,
              'FAIL',
              estimatedCost,
              `資金不足(残高: ${currentBalance.toFixed(2)} < 必要: ${estimatedCost.toFixed(2)})`
            );
            abort = true;
            addToast('error', '試算中断', `シナリオ #${scenario.id} で資金不足が発生しました。`);
            break;
          } else {
            userBalances[scenario.userId] -= estimatedCost;
            updateStatus(scenario.id, 'READY', estimatedCost);
          }
        } catch {
          updateStatus(scenario.id, 'FAIL', 0, '試算APIエラー');
          abort = true;
          break;
        }
      }
    },

    reprocessCondition: id => {
      set(state => ({
        execution: {
          ...state.execution,
          scenarios: state.execution.scenarios.map(s =>
            s.id === id ? { ...s, status: 'PENDING', failReason: null } : s
          ),
        },
      }));
    },

    removeScenario: id => {
      const { addToast, execution } = get();
      if (execution.isExecutionRunning) {
        addToast('warning', '操作不可', '実行中はシナリオを削除できません。');
        return;
      }
      const target = execution.scenarios.find(s => s.id === id);
      if (target && (target.status === 'CALCULATING' || target.status === 'PENDING')) {
        addToast('warning', '操作不可', 'コスト試算中はシナリオを削除できません。');
        return;
      }
      set(state => ({
        execution: {
          ...state.execution,
          scenarios: state.execution.scenarios.filter(s => s.id !== id),
        },
      }));
    },

    clearAllScenarios: () => {
      const { addToast, execution } = get();
      if (execution.isExecutionRunning) {
        addToast('warning', '操作不可', '実行中はシナリオを削除できません。');
        return;
      }
      const isEstimating = execution.scenarios.some(
        s => s.status === 'CALCULATING' || s.status === 'PENDING'
      );
      if (isEstimating) {
        addToast('warning', '操作不可', 'コスト試算中はシナリオを削除できません。');
        return;
      }

      set(state => ({
        execution: {
          ...state.execution,
          scenarios: [],
        },
      }));
      addToast('info', 'キュー削除', 'すべてのシナリオを削除しました。');
    },
  },
});
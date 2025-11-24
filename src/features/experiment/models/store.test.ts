// src/features/experiment/model/store.test.ts
// FSD Layer: Features - ユースケースロジック（Zustand Store Slice）の統合ユニットテスト

import { create } from 'zustand';
import { createExecutionSlice } from '@/features/experiment/models/store';
import { ExecutionSlice, GlobalState } from '@/shared/store/types';
import { act } from '@testing-library/react';
import { vi } from 'vitest';

// createExecutionSliceが依存するメソッドを含むGlobalStateの最小モック
type TestStore = ExecutionSlice &
  Pick<GlobalState, 'addToast' | 'registerResult' | 'updateUserBalance'>;

const useTestStore = create<TestStore>()((set, get) => ({
  ...createExecutionSlice(set, get as any, {} as any),
  addToast: vi.fn(),
  registerResult: vi.fn(),
  updateUserBalance: vi.fn(),
}));

describe('Features/Experiment: Execution Store Slice (FSD Layer: Features)', () => {
  beforeEach(() => {
    useTestStore.setState(
      {
        execution: {
          scenarios: [],
          isGenerating: false,
          isExecutionRunning: false,
          executionId: null,
          // Mock functions need to be preserved or re-mocked if overwritten by setState(..., true)
          // But here we are only testing 'execution' state mostly.
          // The methods are part of the store definition, not state, so they persist.
          updateScenario: useTestStore.getState().execution.updateScenario,
          updateExecutionStatus: useTestStore.getState().execution.updateExecutionStatus,
          generateScenarios: useTestStore.getState().execution.generateScenarios,
          executeScenarios: useTestStore.getState().execution.executeScenarios,
          recalculateAll: useTestStore.getState().execution.recalculateAll,
          reprocessCondition: useTestStore.getState().execution.reprocessCondition,
          removeScenario: useTestStore.getState().execution.removeScenario,
          clearAllScenarios: useTestStore.getState().execution.clearAllScenarios,
        },
      },
      true
    );
    vi.clearAllMocks();
  });

  it('should update execution status correctly', () => {
    const { updateExecutionStatus } = useTestStore.getState().execution;

    act(() => {
      updateExecutionStatus(true, 'exec-123');
    });

    const state = useTestStore.getState().execution;
    expect(state.isExecutionRunning).toBe(true);
    expect(state.executionId).toBe('exec-123');
  });

  it('should correctly update scenario status', () => {
    const { updateScenario } = useTestStore.getState().execution;
    const uniqueId = 's-1';

    // 1. シナリオを準備 (直接Stateをセット)
    useTestStore.setState(state => ({
      execution: {
        ...state.execution,
        scenarios: [
          {
            id: 1,
            uniqueId,
            userId: 'user1',
            dataSize: 100,
            chunkSize: 10,
            allocator: 'RoundRobin',
            transmitter: 'OneByOne',
            chains: 1,
            targetChains: ['chain1'],
            budgetLimit: 1000,
            cost: 0,
            status: 'PENDING',
            failReason: null,
            progress: 0,
            logs: [],
          },
        ],
      },
    }));

    // 2. ステータスをRUNNINGに更新
    act(() => {
      updateScenario(uniqueId, { status: 'RUNNING' });
    });

    expect(useTestStore.getState().execution.scenarios[0].status).toBe('RUNNING');
  });
});

import { useState } from 'react';
import {
  ExperimentScenario,
  ExperimentResult,
  AllocatorStrategy,
  TransmitterStrategy,
} from '../../../types';
import { api } from '../../../services/api';
import { useWebSocket } from '../../../hooks/useWebSocket';

/**
 * 実験シナリオの生成と実行のためのHook
 * パラメータ範囲からシナリオを生成し、実行を管理します
 */
export const useScenarioExecution = (
  notify: (type: 'success' | 'error', title: string, message: string) => void,
  onRegisterResult: (result: ExperimentResult) => void
) => {
  const [scenarios, setScenarios] = useState<ExperimentScenario[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecutionRunning, setIsExecutionRunning] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);

  // WebSocket for Experiment Progress
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
      notify('success', 'All Scenarios Processed', 'Batch execution finished.');
      return;
    }

    setScenarios(prev =>
      prev.map(s => {
        if (s.id === msg.scenarioId) {
          const nextLogs = msg.log ? [...s.logs, msg.log] : s.logs;
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

  const generateScenarios = async (params: any) => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 500)); // Sim generation delay

    const newScenarios: ExperimentScenario[] = [];
    let idCounter = 1;
    const cleanName = params.projectName.replace(/[^a-zA-Z0-9_]/g, '') || 'Exp';

    // Helper to generate range array
    const getRange = (p: any) => {
      if (p.mode === 'fixed') return [p.fixed];
      const res = [];
      const start = Number(p.range.start);
      const end = Number(p.range.end);
      const step = Number(p.range.step);

      if (step <= 0 || start > end) return [start]; // Fallback
      for (let i = start; i <= end; i += step) {
        res.push(i);
      }
      return res;
    };

    const dataSizes = getRange(params.dataSizeParams);
    const chunkSizes = getRange(params.chunkSizeParams);
    const allocators = Array.from(params.selectedAllocators as Set<AllocatorStrategy>);
    const transmitters = Array.from(params.selectedTransmitters as Set<TransmitterStrategy>);

    // Cartesian Product Generation
    // DataSize x ChunkSize x Allocators x Transmitters
    for (const ds of dataSizes) {
      for (const cs of chunkSizes) {
        for (const alloc of allocators) {
          for (const trans of transmitters) {
            newScenarios.push({
              id: idCounter++,
              uniqueId: `${cleanName}_${Date.now()}_${idCounter}`,
              dataSize: ds,
              chunkSize: cs,
              allocator: alloc,
              transmitter: trans,
              chains: params.selectedChains.size || 1,
              targetChains: Array.from(params.selectedChains),
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

    setScenarios(newScenarios);
    params.setIsOpen(true);
    setIsGenerating(false);
    notify(
      'success',
      'Scenarios Generated',
      `${newScenarios.length} scenarios created based on parameter ranges.`
    );
  };

  const executeScenarios = async (projectName: string) => {
    setIsExecutionRunning(true);
    notify('success', 'Job Queued', 'Scenarios sent to execution queue.');

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

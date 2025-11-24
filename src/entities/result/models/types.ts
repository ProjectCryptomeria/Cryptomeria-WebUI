// entities/result - 実験結果関連の型とモデル

import type { SortDirection } from '@/shared/types';

export interface ExperimentResult {
  id: string;
  scenarioName: string;
  executedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'ABORTED';
  dataSizeMB: number;
  chunkSizeKB: number;
  totalTxCount: number;
  allocator: string;
  transmitter: string;
  targetChainCount: number;
  usedChains: string[];
  uploadTimeMs: number;
  downloadTimeMs: number;
  throughputBps: number;
  // Economic Metrics
  gasUsed?: number; // 消費ガス量 (Gas)
  baseFee?: number; // 実行時のBaseFee (TKN/Gas)
  actualFee?: number; // 実際にかかったコスト (TKN)
  logs?: string[];
}

export interface SortConfig {
  key: keyof ExperimentResult;
  direction: SortDirection;
}

export interface FilterCondition {
  key: keyof ExperimentResult;
  value: string;
  label: string;
}
// entities/preset - プリセット関連の型とモデル

import type {
  ExperimentConfig,
  AllocatorStrategy,
  TransmitterStrategy,
} from '../../scenario/model/types';

export interface ExperimentPreset {
  id: string;
  name: string;
  config: ExperimentConfig;
  generatorState?: {
    projectName: string;
    accountValue: string;
    dataSize: { mode: 'fixed' | 'range'; fixed: number; start: number; end: number; step: number };
    chunkSize: { mode: 'fixed' | 'range'; fixed: number; start: number; end: number; step: number };
    chainSelection?: {
      mode: 'fixed' | 'range';
      range: { start: number; end: number; step: number };
      selected: string[];
    };
    allocators: AllocatorStrategy[];
    transmitters: TransmitterStrategy[];
    selectedChains: string[]; // 後方互換のために残す
    uploadType: 'Virtual' | 'Real';
  };
  lastModified: string;
}

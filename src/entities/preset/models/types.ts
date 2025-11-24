// entities/preset - プリセット関連の型とモデル

import type {
  ExperimentConfig,
  AllocatorStrategy,
  TransmitterStrategy,
} from '../../scenario/models/types';

/**
 * 固定値/範囲指定の設定ブロック
 */
export interface ValueRangeConfig {
  mode: 'fixed' | 'range';
  fixed: number;
  start: number;
  end: number;
  step: number;
}

/**
 * チェーン選択の範囲指定設定
 */
export interface ChainSelectionRange {
  start: number;
  end: number;
  step: number;
}

/**
 * シナリオジェネレータの状態設定 (Presetに保存されるデータ)
 */
export interface GeneratorStateConfig {
  projectName: string;
  accountValue: string;
  dataSize: ValueRangeConfig;
  chunkSize: ValueRangeConfig;
  chainSelection?: {
    mode: 'fixed' | 'range';
    range: ChainSelectionRange;
    selected: string[];
  };
  allocators: AllocatorStrategy[];
  transmitters: TransmitterStrategy[];
  selectedChains: string[]; // 後方互換のために残す
  uploadType: 'Virtual' | 'Real';
}

export interface ExperimentPreset {
  id: string;
  name: string;
  config: ExperimentConfig;
  generatorState?: GeneratorStateConfig; // インライン定義をGeneratorStateConfigに変更
  lastModified: string;
}
// entities/scenario - シナリオ関連の型とモデル

export enum AllocatorStrategy {
  STATIC = 'Static',
  ROUND_ROBIN = 'RoundRobin',
  RANDOM = 'Random',
  AVAILABLE = 'Available',
  HASH = 'Hash',
}

export enum TransmitterStrategy {
  ONE_BY_ONE = 'OneByOne',
  MULTI_BURST = 'MultiBurst',
}

export interface RealFileConfig {
  fileCount: number;
  totalSizeMB: number;
  structure: any; // Tree
}

export interface ExperimentConfig {
  allocator: AllocatorStrategy;
  transmitter: TransmitterStrategy;
  targetChains: string[];
  uploadType: 'Virtual' | 'Real';
  projectName: string;
  virtualConfig?: {
    sizeMB: number;
    chunkSizeKB: number;
    files: number;
  };
  realConfig?: RealFileConfig;
  userId?: string;
  shouldFail?: boolean;
}

// ステータス定義: 試算待機(PENDING), 試算中(CALCULATING) を明確化
export type ScenarioStatus =
  | 'PENDING' // 試算待機 (灰色)
  | 'CALCULATING' // 試算中 (黄色)
  | 'READY' // 実行待機 (青/緑) - 試算完了
  | 'RUNNING' // 実行中 (黄色アニメーション)
  | 'COMPLETE' // 完了 (緑)
  | 'FAIL'; // 失敗 (赤)

export interface ExperimentScenario {
  id: number;
  uniqueId: string;
  userId: string; // 実行アカウントIDを追加
  dataSize: number;
  chunkSize: number;
  allocator: AllocatorStrategy;
  transmitter: TransmitterStrategy;
  chains: number;
  targetChains: string[];
  budgetLimit: number;
  cost: number; // 試算コスト
  status: ScenarioStatus;
  failReason: string | null;
  progress: number;
  logs: string[];
}

// 追加: 実行結果通知用の詳細データ型
export interface ExecutionResultDetails {
  userId: string;
  userName?: string;
  actualCost: number;
  refund: number;
  currentBalance: number;
}

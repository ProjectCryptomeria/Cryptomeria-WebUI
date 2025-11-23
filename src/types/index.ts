// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/types/index.ts

/**
 * RaidChain WebUI Type Definitions
 *
 * アプリケーション全体で使用される型定義ファイルです。
 * 各機能レイヤー（監視、デプロイ、経済、実験、ライブラリ）ごとのデータモデルを定義しています。
 */

// --- Layer Identifiers ---
export enum AppLayer {
  MONITORING = 'monitoring', // リアルタイム監視画面
  DEPLOYMENT = 'deployment', // インフラ管理・デプロイ画面
  ECONOMY = 'economy', // アカウント・トークン管理画面
  PRESET = 'preset', // 実験プリセット管理画面 (旧 Scenario)
  EXPERIMENT = 'experiment', // 実験設定・実行画面
  LIBRARY = 'library', // 過去の実験結果アーカイブ画面
}

// --- Monitoring Types (監視レイヤー用) ---
export interface NodeStatus {
  id: string; // ノードの一意なID (例: datachain-0)
  type: 'control' | 'meta' | 'data'; // ノードの役割
  status: 'active' | 'inactive' | 'error'; // 稼働状態
  height: number; // 最新ブロック高
  txCount: number; // 処理済みトランザクション数
  latency: number; // 応答遅延 (ms)
}

export interface MempoolInfo {
  name: string;
  txs: number;
}

export interface MonitoringUpdate {
  nodes: NodeStatus[];
  mempool: MempoolInfo[];
  deployedCount: number;
  currentBaseFee: number; // Base Feeの現在の値
  baseFeeChangeRatio: number; // 前回の値からの変動率 (%)
  nextBaseFee: number; // 次のブロックの予測値
  averageBaseFee: number; // 直近10ブロックの平均値
}

export interface PacketEvent {
  id: string;
  from: string;
  to: string;
  type: 'ibc_transfer' | 'meta_sync';
  timestamp: number;
}

// --- Deployment Types (デプロイレイヤー用) ---
export interface BuildStatus {
  isBuilding: boolean;
  logs: string[];
  progress: number;
}

// --- Economy Types (経済レイヤー用) ---
export interface UserAccount {
  id: string;
  address: string; // ウォレットアドレス (raid1...)
  balance: number; // トークン残高
  role: 'admin' | 'client'; // 権限ロール
  name?: string; // 表示名
}

export interface SystemAccount {
  id: string;
  name: string; // アカウント名 (例: "Millionaire", "Relayer-0")
  address: string;
  balance: number;
  type: 'faucet_source' | 'relayer'; // アカウントの種類
}

// --- Experiment Types (実験レイヤー用) ---
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

// --- Library Types (ライブラリレイヤー用) ---
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
  logs?: string[];
}

export type SortDirection = 'asc' | 'desc';
export interface SortConfig {
  key: keyof ExperimentResult;
  direction: SortDirection;
}

export interface FilterCondition {
  key: keyof ExperimentResult;
  value: string;
  label: string;
}

// --- Notifications ---
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface NotificationItem extends Toast {
  timestamp: number;
  read: boolean;
}

// --- Global State (Zustand) ---
export interface GlobalState {
  // Monitoring / Deployment
  deployedNodeCount: number;
  isDockerBuilt: boolean;
  baseFeeInfo: {
    current: number;
    change: number;
    next: number;
    average: number;
  } | null;
  setDeployedNodeCount: (count: number) => void;
  setIsDockerBuilt: (built: boolean) => void;
  setBaseFeeInfo: (info: GlobalState['baseFeeInfo']) => void;

  // Notifications
  toasts: Toast[];
  notifications: NotificationItem[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (isOpen: boolean) => void;
  addToast: (type: Toast['type'], title: string, message: string) => void;
  clearNotifications: () => void;

  // Economy
  users: UserAccount[];
  systemAccounts: SystemAccount[];
  refreshEconomy: () => Promise<void>;
  createUser: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  faucet: (targetId: string) => Promise<void>;

  // Library / Presets
  results: ExperimentResult[];
  presets: ExperimentPreset[];
  loadData: () => Promise<void>;
  savePreset: (name: string, config: ExperimentConfig, generatorState?: any) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
  registerResult: (result: ExperimentResult) => void;

  // Experiment Execution
  execution: {
    scenarios: ExperimentScenario[];
    isGenerating: boolean;
    isExecutionRunning: boolean;
    executionId: string | null;
    generateScenarios: (params: any) => Promise<void>;
    executeScenarios: (projectName: string) => Promise<void>;
    recalculateAll: (users: any[]) => Promise<void>;
    reprocessCondition: (id: number) => void;
    removeScenario: (id: number) => void;
    clearAllScenarios: () => void;
  };
}
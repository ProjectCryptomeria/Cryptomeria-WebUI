
// --- Layer Identifiers ---
export enum AppLayer {
  MONITORING = 'monitoring',
  DEPLOYMENT = 'deployment',
  ECONOMY = 'economy',
  PRESET = 'preset',
  EXPERIMENT = 'experiment',
  LIBRARY = 'library',
}

// --- Monitoring Types ---
export interface NodeStatus {
  id: string;
  type: 'control' | 'meta' | 'data';
  status: 'active' | 'inactive' | 'error';
  height: number;
  txCount: number;
  latency: number;
}

export interface MempoolInfo {
  name: string;
  txs: number;
}

export interface MonitoringUpdate {
  nodes: NodeStatus[];
  mempool: MempoolInfo[];
  deployedCount: number;
}

export interface PacketEvent {
  id: string;
  from: string;
  to: string;
  type: 'ibc_transfer' | 'meta_sync';
  timestamp: number;
}

// --- Deployment Types ---
export interface BuildStatus {
  isBuilding: boolean;
  logs: string[];
  progress: number;
}

// --- Economy Types ---
export interface UserAccount {
  id: string;
  address: string;
  balance: number;
  role: 'admin' | 'client';
  name?: string;
}

export interface SystemAccount {
  id: string;
  name: string;
  address: string;
  balance: number;
  type: 'faucet_source' | 'relayer';
}

// --- Experiment Types ---
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
  structure: any;
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

export type ScenarioStatus = 'PENDING' | 'CALCULATING' | 'READY' | 'RUNNING' | 'COMPLETE' | 'FAIL';

export interface ExperimentScenario {
    id: number;
    uniqueId: string;
    dataSize: number;
    chunkSize: number;
    allocator: AllocatorStrategy;
    transmitter: TransmitterStrategy;
    chains: number;
    targetChains: string[];
    budgetLimit: number;
    cost: number;
    status: ScenarioStatus;
    failReason: string | null;
    progress: number;
    logs: string[];
}

export interface ExperimentPreset {
  id: string;
  name: string;
  config: ExperimentConfig;
  generatorState?: {
      projectName: string;
      accountValue: string;
      dataSize: { mode: 'fixed' | 'range', fixed: number, start: number, end: number, step: number };
      chunkSize: { mode: 'fixed' | 'range', fixed: number, start: number, end: number, step: number };
      allocators: AllocatorStrategy[];
      transmitters: TransmitterStrategy[];
      selectedChains: string[];
      uploadType: 'Virtual' | 'Real';
  };
  lastModified: string;
}

// --- Library Types ---
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
  type: 'success' | 'error';
  title: string;
  message: string;
}

export interface NotificationItem extends Toast {
  timestamp: number;
  read: boolean;
}
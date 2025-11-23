// entities/node - ノード関連の型とモデル

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

// デプロイ関連
export interface BuildStatus {
  isBuilding: boolean;
  logs: string[];
  progress: number;
}

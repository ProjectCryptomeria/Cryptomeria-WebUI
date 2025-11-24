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
  minGasPrice: number; // ネットワークの最低ガス価格 (静的)
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

// [NEW] リアルタイムブロックフィード用イベント
export interface BlockEvent {
  /** チェーンID (例: 'datachain-0', 'control-chain') */
  chainName: string;

  /** チェーンの種別 */
  type: 'control' | 'meta' | 'data';

  /** ブロックの高さ */
  height: number;

  /** ブロック生成時刻 (ISO 8601形式の文字列) */
  timestamp: string;

  /** ブロックハッシュのショートバージョン */
  hash: string;

  /** ブロックに含まれるトランザクション数 */
  txCount: number;

  /** ブロックを提案したバリデータの情報 */
  proposer: {
    address: string; // バリデータアドレス
    label: string;   // 表示用のラベル (例: 'Validator-0')
  };
}
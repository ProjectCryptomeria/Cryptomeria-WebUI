// shared/types - 共通の型とEnumの定義

// --- Layer Identifiers ---
export enum AppLayer {
  MONITORING = 'monitoring', // リアルタイム監視画面
  DEPLOYMENT = 'deployment', // インフラ管理・デプロイ画面
  ECONOMY = 'economy', // アカウント・資金管理画面
  PRESET = 'preset', // 実験プリセット管理画面 (旧 Scenario)
  EXPERIMENT = 'experiment', // 実験設定・実行画面
  LIBRARY = 'library', // 過去の実験結果アーカイブ画面
}

// --- ソート・フィルター関連 ---
export type SortDirection = 'asc' | 'desc';

// Library用の型定義
export interface FilterCondition {
  key: string;
  value: string;
  label: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// --- 通知関連 ---
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

// GlobalState型をエクスポート
export * from './global-state';

// entities/account - アカウント関連の型とモデル

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

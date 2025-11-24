import { StoreSlice } from '@/shared/store/types';
import { api } from '@/shared/api';
import { SystemAccount, UserAccount } from './types';

export const createEconomySlice: StoreSlice<{
  users: UserAccount[];
  systemAccounts: SystemAccount[];
  refreshEconomy: () => Promise<void>;
  createUser: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  faucet: (targetId: string) => Promise<void>;
  updateUserBalance: (userId: string, newBalance: number) => void;
}> = (set, get) => ({
  users: [],
  systemAccounts: [],

  refreshEconomy: async () => {
    try {
      const res = await api.economy.getUsers();
      set({ users: res.users, systemAccounts: res.system });
    } catch (e) {
      console.error('Failed to refresh economy', e);
    }
  },

  createUser: async () => {
    try {
      await api.economy.createUser();
      await get().refreshEconomy();
      get().addToast('success', 'アカウント作成完了', '新規ユーザーアカウントを作成しました。');
    } catch {
      get().addToast('error', '作成エラー', 'アカウント作成に失敗しました。');
    }
  },

  deleteUser: async id => {
    try {
      await api.economy.deleteUser(id);
      await get().refreshEconomy();
      get().addToast('success', '削除完了', 'ユーザーアカウントを削除しました。');
    } catch {
      get().addToast('error', '削除エラー', 'アカウント削除に失敗しました。');
    }
  },

  faucet: async targetId => {
    try {
      const res = await api.economy.faucet(targetId, 1000);
      await get().refreshEconomy();
      get().addToast(
        'success',
        'TKN 送金成功 (Faucet)',
        `${res.targetName} へ 1000 TKN を送金しました。`
      );
    } catch {
      get().addToast('error', 'Faucet 失敗', '資金供給に失敗しました (プール残高不足の可能性)');
    }
  },

  updateUserBalance: (userId, newBalance) => {
    set(state => ({
      users: state.users.map(u => (u.id === userId ? { ...u, balance: newBalance } : u)),
    }));
  },
});

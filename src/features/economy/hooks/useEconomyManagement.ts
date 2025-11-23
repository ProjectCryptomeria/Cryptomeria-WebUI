import { useState, useEffect } from 'react';
import { UserAccount, SystemAccount } from '../../../types';
import { api } from '../../../services/api';

/**
 * ユーザーアカウントとシステムアカウントの管理Hook
 * Economy Layerでアカウントの作成、削除、Faucet機能を提供します
 */
export const useEconomyManagement = (
  deployedNodeCount: number,
  addToast: (type: 'success' | 'error', title: string, message: string) => void
) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [systemAccounts, setSystemAccounts] = useState<SystemAccount[]>([]);

  const refresh = async () => {
    const res = await api.economy.getUsers();
    setUsers(res.users);
    setSystemAccounts(res.system);
  };

  useEffect(() => {
    refresh();
  }, [deployedNodeCount]); // Refresh when infra changes (relayers might change)

  const handleCreateUser = async () => {
    await api.economy.createUser();
    refresh();
    // 修正: 日本語化
    addToast('success', 'アカウント作成完了', '新規ユーザーアカウントを作成しました。');
  };

  const handleDeleteUser = async (id: string) => {
    await api.economy.deleteUser(id);
    refresh();
    // 修正: 日本語化
    addToast('success', '削除完了', 'ユーザーアカウントを削除しました。');
  };

  const handleFaucet = async (targetId: string) => {
    try {
      const res = await api.economy.faucet(targetId, 1000);
      refresh();
      // 修正: 日本語化
      addToast('success', 'TKN 送金成功 (Faucet)', `${res.targetName} へ 1000 TKN を送金しました。`);
    } catch (e) {
      // 修正: 日本語化
      addToast('error', 'Faucet 失敗', '資金供給に失敗しました (プール残高不足の可能性)');
    }
  };

  return { users, systemAccounts, handleCreateUser, handleDeleteUser, handleFaucet };
};
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
    addToast('success', 'Created', 'New user account generated.');
  };

  const handleDeleteUser = async (id: string) => {
    await api.economy.deleteUser(id);
    refresh();
    addToast('success', 'Deleted', 'User account removed.');
  };

  const handleFaucet = async (targetId: string) => {
    try {
      const res = await api.economy.faucet(targetId, 1000);
      refresh();
      addToast('success', 'Faucet', `Sent 1000 TKN to ${res.targetName}`);
    } catch (e) {
      addToast('error', 'Failed', 'Faucet transaction failed (Pool empty?)');
    }
  };

  return { users, systemAccounts, handleCreateUser, handleDeleteUser, handleFaucet };
};

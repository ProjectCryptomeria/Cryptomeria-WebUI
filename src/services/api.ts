import { ExperimentConfig, ExperimentScenario } from '../types';

/**
 * API Client
 * 
 * すべてのバックエンドAPIへのリクエストを管理します。
 * 実際のAPIとの統合時は、MSWを無効化するだけで切り替え可能です。
 */
export const api = {
  deployment: {
    build: async () => {
      const response = await fetch('/api/deployment/build', { method: 'POST' });
      if (!response.ok) throw new Error('Build failed');
      return response.json();
    },
    scale: async (replicaCount: number) => {
      const response = await fetch('/api/deployment/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replicaCount })
      });
      if (!response.ok) throw new Error('Scale failed');
      return response.json();
    },
    reset: async () => {
      const response = await fetch('/api/deployment/reset', { method: 'DELETE' });
      if (!response.ok) throw new Error('Reset failed');
      return response.json();
    }
  },
  economy: {
    getUsers: async () => {
      const response = await fetch('/api/economy/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    createUser: async () => {
      const response = await fetch('/api/economy/user', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    deleteUser: async (id: string) => {
      const response = await fetch(`/api/economy/user/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    faucet: async (targetId: string, amount?: number) => {
      const response = await fetch('/api/economy/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, amount })
      });
      if (!response.ok) throw new Error('Faucet failed');
      return response.json();
    }
  },
  experiment: {
    estimate: async (config: ExperimentConfig) => {
      const response = await fetch('/api/experiment/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Estimate failed');
      return response.json();
    },
    run: async (scenarios: ExperimentScenario[]) => {
      const response = await fetch('/api/experiment/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios })
      });
      if (!response.ok) throw new Error('Experiment run failed');
      return response.json();
    }
  },
  library: {
    getResults: async () => {
      const response = await fetch('/api/library/results');
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    },
    deleteResult: async (id: string) => {
      const response = await fetch(`/api/library/results/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete result');
      return response.json();
    }
  }
};
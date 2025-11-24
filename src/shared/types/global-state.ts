// shared/types - GlobalState型定義
// グローバルストアの型定義

import type { Toast, NotificationItem } from './index';
import type { UserAccount, SystemAccount } from '../../entities/account';
import type { ExperimentResult } from '../../entities/result';
import type { ExperimentPreset, GeneratorStateConfig } from '../../entities/preset';
import type { GenerateScenariosParams } from '../../features/experiment/models/types';
import type {
  ExperimentScenario,
  ExperimentConfig,
  ExecutionResultDetails,
} from '../../entities/scenario';

export interface GlobalState {
  // Monitoring / Deployment
  deployedNodeCount: number;
  isDockerBuilt: boolean;
  minGasPrice: number | null; // 静的なMin Gas Price
  setDeployedNodeCount: (count: number) => void;
  setIsDockerBuilt: (built: boolean) => void;
  setMinGasPrice: (price: number) => void; // アクション名変更

  // Notifications
  toasts: Toast[];
  notifications: NotificationItem[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (isOpen: boolean) => void;
  addToast: (type: Toast['type'], title: string, message: string) => void;
  clearNotifications: () => void;
  removeToast: (id: string) => void;

  // Economy
  users: UserAccount[];
  systemAccounts: SystemAccount[];
  refreshEconomy: () => Promise<void>;
  createUser: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  faucet: (targetId: string) => Promise<void>;
  updateUserBalance: (userId: string, newBalance: number) => void;

  // Library / Presets
  results: ExperimentResult[];
  presets: ExperimentPreset[];
  loadData: () => Promise<void>;
  savePreset: (name: string, config: ExperimentConfig, generatorState?: GeneratorStateConfig) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
  registerResult: (result: ExperimentResult) => void;

  // Experiment Execution
  execution: {
    scenarios: ExperimentScenario[];
    isGenerating: boolean;
    isExecutionRunning: boolean;
    executionId: string | null;
    generateScenarios: (params: GenerateScenariosParams) => Promise<void>;
    executeScenarios: (projectName: string) => Promise<void>;
    recalculateAll: (users: UserAccount[]) => Promise<void>;
    reprocessCondition: (id: number) => void;
    removeScenario: (id: number) => void;
    clearAllScenarios: () => void;
    updateScenario: (
      id: string,
      updates: Partial<ExperimentScenario> & {
        log?: string;
        resultDetails?: ExecutionResultDetails;
      },
      isComplete?: boolean
    ) => void;
    updateExecutionStatus: (running: boolean, executionId?: string | null) => void;
  };
}
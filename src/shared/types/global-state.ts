// shared/types - GlobalState型定義
// グローバルストアの型定義

import type { Toast, NotificationItem } from './index';
import type { UserAccount, SystemAccount } from '../../entities/account';
import type { ExperimentResult } from '../../entities/result';
import type { ExperimentPreset, GeneratorStateConfig } from '../../entities/preset'; // GeneratorStateConfig を追加
import type { GenerateScenariosParams } from '../../features/experiment/models/types'; // GenerateScenariosParamsをインポート
import type {
  ExperimentScenario,
  ExperimentConfig,
  ExecutionResultDetails,
} from '../../entities/scenario';

export interface GlobalState {
  // Monitoring / Deployment
  deployedNodeCount: number;
  isDockerBuilt: boolean;
  baseFeeInfo: {
    current: number;
    change: number;
    next: number;
    average: number;
  } | null;
  setDeployedNodeCount: (count: number) => void;
  setIsDockerBuilt: (built: boolean) => void;
  setBaseFeeInfo: (info: GlobalState['baseFeeInfo']) => void;

  // Notifications
  toasts: Toast[];
  notifications: NotificationItem[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (isOpen: boolean) => void;
  addToast: (type: Toast['type'], title: string, message: string) => void;
  clearNotifications: () => void;
  // ★ 追加: トーストをIDで削除するアクション
  removeToast: (id: string) => void;

  // Economy
  users: UserAccount[];
  systemAccounts: SystemAccount[];
  refreshEconomy: () => Promise<void>;
  createUser: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  faucet: (targetId: string) => Promise<void>;
  // ★ 追加: ユーザー残高を直接更新するアクション
  updateUserBalance: (userId: string, newBalance: number) => void;

  // Library / Presets
  results: ExperimentResult[];
  presets: ExperimentPreset[];
  loadData: () => Promise<void>;
  // any -> GeneratorStateConfig に変更
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
    // any -> GenerateScenariosParams に変更
    generateScenarios: (params: GenerateScenariosParams) => Promise<void>;
    executeScenarios: (projectName: string) => Promise<void>;
    // any[] -> UserAccount[] に変更
    recalculateAll: (users: UserAccount[]) => Promise<void>;
    reprocessCondition: (id: number) => void;
    removeScenario: (id: number) => void;
    clearAllScenarios: () => void;
    // ★ 追加: 新しい実行進捗アクションの型定義 (ExecutionResultDetails に result が含まれるように修正)
    updateScenario: (
      id: string,
      updates: Partial<ExperimentScenario> & {
        log?: string;
        resultDetails?: ExecutionResultDetails;
      },
      isComplete?: boolean
    ) => void;
    // ★ 追加: 実行状態更新アクションの型定義
    updateExecutionStatus: (running: boolean, executionId?: string | null) => void;
  };
}
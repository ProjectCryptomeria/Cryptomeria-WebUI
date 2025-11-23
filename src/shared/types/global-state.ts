// shared/types - GlobalState型定義
// グローバルストアの型定義

import type { Toast, NotificationItem } from './index';
import type { UserAccount, SystemAccount } from '../../entities/account';
import type { ExperimentResult } from '../../entities/result';
import type { ExperimentPreset } from '../../entities/preset';
import type { ExperimentScenario, ExperimentConfig } from '../../entities/scenario';

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

	// Economy
	users: UserAccount[];
	systemAccounts: SystemAccount[];
	refreshEconomy: () => Promise<void>;
	createUser: () => Promise<void>;
	deleteUser: (id: string) => Promise<void>;
	faucet: (targetId: string) => Promise<void>;

	// Library / Presets
	results: ExperimentResult[];
	presets: ExperimentPreset[];
	loadData: () => Promise<void>;
	savePreset: (name: string, config: ExperimentConfig, generatorState?: any) => Promise<void>;
	deletePreset: (id: string) => Promise<void>;
	deleteResult: (id: string) => Promise<void>;
	registerResult: (result: ExperimentResult) => void;

	// Experiment Execution
	execution: {
		scenarios: ExperimentScenario[];
		isGenerating: boolean;
		isExecutionRunning: boolean;
		executionId: string | null;
		generateScenarios: (params: any) => Promise<void>;
		executeScenarios: (projectName: string) => Promise<void>;
		recalculateAll: (users: any[]) => Promise<void>;
		reprocessCondition: (id: number) => void;
		removeScenario: (id: number) => void;
		clearAllScenarios: () => void;
	};
}

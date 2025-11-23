import { StateCreator } from 'zustand';
import type { UserAccount, SystemAccount } from '@/entities/account';
import type { ExperimentResult } from '@/entities/result';
import type { ExperimentPreset } from '@/entities/preset';
import type { ExperimentScenario, ExperimentConfig, ExecutionResultDetails } from '@/entities/scenario';
import type { Toast, NotificationItem } from '@/shared/types';

// --- Slices Interfaces ---

export interface NotificationSlice {
	toasts: Toast[];
	notifications: NotificationItem[];
	isNotificationOpen: boolean;
	setIsNotificationOpen: (isOpen: boolean) => void;
	addToast: (type: Toast['type'], title: string, message: string) => void;
	clearNotifications: () => void;
	removeToast: (id: string) => void;
}

export interface NodeSlice {
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
	setBaseFeeInfo: (info: NodeSlice['baseFeeInfo']) => void;
}

export interface EconomySlice {
	users: UserAccount[];
	systemAccounts: SystemAccount[];
	refreshEconomy: () => Promise<void>;
	createUser: () => Promise<void>;
	deleteUser: (id: string) => Promise<void>;
	faucet: (targetId: string) => Promise<void>;
	updateUserBalance: (userId: string, newBalance: number) => void;
}

export interface PresetSlice {
	presets: ExperimentPreset[];
	loadPresets: () => Promise<void>;
	savePreset: (name: string, config: ExperimentConfig, generatorState?: any) => Promise<void>;
	deletePreset: (id: string) => Promise<void>;
}

export interface LibrarySlice {
	results: ExperimentResult[];
	loadResults: () => Promise<void>;
	deleteResult: (id: string) => Promise<void>;
	registerResult: (result: ExperimentResult) => void;
}

export interface ExecutionSlice {
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
		updateScenario: (
			id: string,
			updates: Partial<ExperimentScenario> & { log?: string; resultDetails?: ExecutionResultDetails & { result?: ExperimentResult } },
			isComplete?: boolean
		) => void;
		updateExecutionStatus: (running: boolean, executionId?: string | null) => void;
	};
}

// --- Global State Type ---
// 全てのスライスを結合した型
export interface GlobalState extends
	NotificationSlice,
	NodeSlice,
	EconomySlice,
	PresetSlice,
	LibrarySlice,
	ExecutionSlice {
	loadData: () => Promise<void>; // 全データロード用
}

// Slice Creator Type Helper
export type StoreSlice<T> = StateCreator<GlobalState, [], [], T>;
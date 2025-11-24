import { AllocatorStrategy, TransmitterStrategy, ExperimentScenario, ExecutionResultDetails } from '@/entities/scenario';
import { UserAccount } from '@/entities/account'; // UserAccountをインポート

/**
 * 範囲指定パラメータの構造
 */
export interface RangeValue {
	start: number | string;
	end: number | string;
	step: number | string;
}

/**
 * データサイズやチャンクサイズなどの値パラメータ型
 * - 'fixed': 固定値を指定
 * - 'range': 範囲とステップを指定
 */
export type ValueParam =
	| { mode: 'fixed'; fixed: number | string; }
	| { mode: 'range'; range: RangeValue; };

/**
 * チェーン数設定 (Rangeモード用)
 */
export interface ChainRangeParams {
	start: number | string;
	end: number | string;
	step: number | string;
}

/**
 * `generateScenarios` アクションのパラメータ型
 */
export interface GenerateScenariosParams {
	projectName: string;
	dataSizeParams: ValueParam;
	chunkSizeParams: ValueParam;
	// AllocatorStrategy, TransmitterStrategy は entities/scenario からインポート
	selectedAllocators: Iterable<AllocatorStrategy> | ArrayLike<AllocatorStrategy>;
	selectedTransmitters: Iterable<TransmitterStrategy> | ArrayLike<TransmitterStrategy>;
	selectedChains: Set<string>;
	chainMode: string; // 'fixed' | 'range' を想定
	chainRangeParams: ChainRangeParams;
	users: UserAccount[];
	selectedUserId: string;
	setIsOpen: (isOpen: boolean) => void;
}

/**
 * ExecutionSlice の状態型 (store.tsの execution: any を置き換え)
 * アクションのシグネチャもここで定義します。
 */
export interface ExecutionState {
	scenarios: ExperimentScenario[];
	isGenerating: boolean;
	isExecutionRunning: boolean;
	executionId: string | null;

	// Actions
	// resultDetails の any を ExecutionResultDetails に変更
	updateScenario: (id: string, updates: Partial<ExperimentScenario> & { log?: string; resultDetails?: ExecutionResultDetails }, isComplete?: boolean) => void;
	updateExecutionStatus: (running: boolean, executionId?: string | null) => void;
	generateScenarios: (params: GenerateScenariosParams) => Promise<void>;
	executeScenarios: (projectName: string) => Promise<void>;
	recalculateAll: (users: UserAccount[]) => Promise<void>; // users: any[] を UserAccount[] に変更
	reprocessCondition: (id: number) => void;
	removeScenario: (id: number) => void;
	clearAllScenarios: () => void;
}
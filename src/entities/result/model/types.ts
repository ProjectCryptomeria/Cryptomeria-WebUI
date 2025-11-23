// entities/result - 実験結果関連の型とモデル

import type { SortDirection } from '../../../shared/types';

export interface ExperimentResult {
	id: string;
	scenarioName: string;
	executedAt: string;
	status: 'SUCCESS' | 'FAILED' | 'ABORTED';
	dataSizeMB: number;
	chunkSizeKB: number;
	totalTxCount: number;
	allocator: string;
	transmitter: string;
	targetChainCount: number;
	usedChains: string[];
	uploadTimeMs: number;
	downloadTimeMs: number;
	throughputBps: number;
	logs?: string[];
}

export interface SortConfig {
	key: keyof ExperimentResult;
	direction: SortDirection;
}

export interface FilterCondition {
	key: keyof ExperimentResult;
	value: string;
	label: string;
}

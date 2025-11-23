import {
	ExperimentConfig,
	ExperimentPreset,
	AllocatorStrategy,
	TransmitterStrategy,
} from '../../../types';

// UIで使用するパラメータの型定義
export interface ExperimentFormState {
	projectName: string;
	selectedUserId: string;
	mode: 'virtual' | 'upload';
	dataSizeParams: {
		mode: 'fixed' | 'range';
		fixed: number;
		range: { start: number; end: number; step: number };
	};
	chunkSizeParams: {
		mode: 'fixed' | 'range';
		fixed: number;
		range: { start: number; end: number; step: number };
	};
	// Chain Selection
	chainMode: 'fixed' | 'range';
	chainRangeParams: { start: number; end: number; step: number };
	selectedChains: Set<string>;
	// Strategies
	selectedAllocators: Set<AllocatorStrategy>;
	selectedTransmitters: Set<TransmitterStrategy>;
}

/**
 * UIの状態から保存用のConfigとGeneratorStateを生成する
 */
export const mapStateToPresetConfig = (state: ExperimentFormState) => {
	const {
		projectName,
		selectedUserId,
		mode,
		dataSizeParams,
		chunkSizeParams,
		chainMode,
		chainRangeParams,
		selectedChains,
		selectedAllocators,
		selectedTransmitters,
	} = state;

	// 実行用コンフィグ (代表値を使用)
	// Rangeモードの場合は、開始台数分のチェーンを仮設定として入れるなどの処理
	const targetChainsConfig =
		chainMode === 'fixed'
			? Array.from(selectedChains)
			: Array.from({ length: chainRangeParams.start }).map((_, i) => `datachain-${i}`);

	const config: ExperimentConfig = {
		allocator: Array.from(selectedAllocators)[0],
		transmitter: Array.from(selectedTransmitters)[0],
		targetChains: targetChainsConfig,
		uploadType: mode === 'virtual' ? 'Virtual' : 'Real',
		projectName,
		userId: selectedUserId,
		virtualConfig: {
			sizeMB: dataSizeParams.fixed,
			chunkSizeKB: chunkSizeParams.fixed,
			files: 1,
		},
	};

	// UI復元用ステート
	const generatorState = {
		projectName,
		accountValue: selectedUserId,
		dataSize: {
			mode: dataSizeParams.mode,
			fixed: dataSizeParams.fixed,
			start: dataSizeParams.range.start,
			end: dataSizeParams.range.end,
			step: dataSizeParams.range.step,
		},
		chunkSize: {
			mode: chunkSizeParams.mode,
			fixed: chunkSizeParams.fixed,
			start: chunkSizeParams.range.start,
			end: chunkSizeParams.range.end,
			step: chunkSizeParams.range.step,
		},
		// Chain Selection State
		chainSelection: {
			mode: chainMode,
			range: chainRangeParams,
			selected: Array.from(selectedChains),
		},
		allocators: Array.from(selectedAllocators),
		transmitters: Array.from(selectedTransmitters),
		// 後方互換のために古い形式も残すが、基本は chainSelection を使用
		selectedChains: Array.from(selectedChains),
		uploadType: mode === 'virtual' ? 'Virtual' : 'Real',
	};

	return { config, generatorState };
};

/**
 * プリセットからUIの状態を復元する
 */
export const mapPresetToState = (
	preset: ExperimentPreset,
	currentDeployedCount: number
): Partial<ExperimentFormState> => {
	if (!preset.generatorState) return {};

	const gs = preset.generatorState;

	// チェーン選択情報の復元
	let chainMode: 'fixed' | 'range' = 'fixed';
	let chainRangeParams = { start: 1, end: currentDeployedCount || 5, step: 1 };
	let selectedChains = new Set<string>();

	if (gs.chainSelection) {
		// 新しい形式
		chainMode = gs.chainSelection.mode as 'fixed' | 'range';
		chainRangeParams = gs.chainSelection.range;
		selectedChains = new Set(
			gs.chainSelection.selected.filter((c: string) => {
				const parts = c.split('-');
				const idx = parseInt(parts[1]);
				return !isNaN(idx) && idx < currentDeployedCount;
			})
		);
	} else if (gs.selectedChains) {
		// 旧形式（後方互換）
		selectedChains = new Set(
			gs.selectedChains.filter((c: string) => {
				const parts = c.split('-');
				const idx = parseInt(parts[1]);
				return !isNaN(idx) && idx < currentDeployedCount;
			})
		);
	}

	return {
		projectName: gs.projectName,
		selectedUserId: gs.accountValue,
		mode: gs.uploadType === 'Virtual' ? 'virtual' : 'upload',
		dataSizeParams: {
			mode: gs.dataSize.mode as 'fixed' | 'range',
			fixed: gs.dataSize.fixed,
			range: { start: gs.dataSize.start, end: gs.dataSize.end, step: gs.dataSize.step },
		},
		chunkSizeParams: {
			mode: gs.chunkSize.mode as 'fixed' | 'range',
			fixed: gs.chunkSize.fixed,
			range: { start: gs.chunkSize.start, end: gs.chunkSize.end, step: gs.chunkSize.step },
		},
		chainMode,
		chainRangeParams,
		selectedAllocators: new Set(gs.allocators as AllocatorStrategy[]),
		selectedTransmitters: new Set(gs.transmitters as TransmitterStrategy[]),
		selectedChains,
	};
};
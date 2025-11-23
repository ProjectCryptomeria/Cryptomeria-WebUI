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
	selectedChains: Set<string>;
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
		selectedChains,
		selectedAllocators,
		selectedTransmitters,
	} = state;

	// 実行用コンフィグ (代表値を使用)
	const config: ExperimentConfig = {
		allocator: Array.from(selectedAllocators)[0],
		transmitter: Array.from(selectedTransmitters)[0],
		targetChains: Array.from(selectedChains),
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
		allocators: Array.from(selectedAllocators),
		transmitters: Array.from(selectedTransmitters),
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

	// 存在しないチェーンを除外してSetを再構築
	const validChains = new Set(
		gs.selectedChains.filter((c: string) => {
			const parts = c.split('-');
			const idx = parseInt(parts[1]);
			return !isNaN(idx) && idx < currentDeployedCount;
		})
	);

	return {
		projectName: gs.projectName,
		selectedUserId: gs.accountValue,
		mode: gs.uploadType === 'Virtual' ? 'virtual' : 'upload',
		dataSizeParams: {
			mode: gs.dataSize.mode satisfies 'fixed' | 'range',
			fixed: gs.dataSize.fixed,
			range: { start: gs.dataSize.start, end: gs.dataSize.end, step: gs.dataSize.step },
		},
		chunkSizeParams: {
			mode: gs.chunkSize.mode satisfies 'fixed' | 'range',
			fixed: gs.chunkSize.fixed,
			range: { start: gs.chunkSize.start, end: gs.chunkSize.end, step: gs.chunkSize.step },
		},
		selectedAllocators: new Set(gs.allocators satisfies AllocatorStrategy[]),
		selectedTransmitters: new Set(gs.transmitters satisfies TransmitterStrategy[]),
		selectedChains: validChains,
	};
};
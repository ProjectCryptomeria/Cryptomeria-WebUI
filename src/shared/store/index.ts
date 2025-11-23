import { create } from 'zustand';
import { GlobalState } from './types';

// Import Slices
import { createNotificationSlice } from '../model/notificationStore';
import { createNodeSlice } from '@/entities/node/model/store';
import { createEconomySlice } from '@/entities/account/model/store';
import { createPresetSlice } from '@/entities/preset/model/store';
import { createLibrarySlice } from '@/entities/result/model/store';
import { createExecutionSlice } from '@/features/experiment/model/store';

export const useGlobalStore = create<GlobalState>()((...a) => ({
	...createNotificationSlice(...a),
	...createNodeSlice(...a),
	...createEconomySlice(...a),
	...createPresetSlice(...a),
	...createLibrarySlice(...a),
	...createExecutionSlice(...a),

	// Root Actions
	loadData: async () => {
		// スライスのメソッドを呼び出して初期データをロード
		const get = a[1];

		// 並列実行
		await Promise.all([
			get().refreshEconomy(),
			get().loadPresets(),
			get().loadResults(),
		]);
	},
}));
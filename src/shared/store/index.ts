import { create } from 'zustand';
import { GlobalState } from './types';

// Import Slices
import { createNotificationSlice } from '../models/notificationStore';
import { createNodeSlice } from '@/entities/node/models/store';
import { createEconomySlice } from '@/entities/account/models/store';
import { createPresetSlice } from '@/entities/preset/models/store';
import { createLibrarySlice } from '@/entities/result/models/store';
import { createExecutionSlice } from '@/features/experiment/models/store';

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
    await Promise.all([get().refreshEconomy(), get().loadPresets(), get().loadResults()]);
  },
}));

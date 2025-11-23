import { StoreSlice } from '@/shared/store/types';
import { api } from '@/shared/api';
import { ExperimentPreset } from '@/entities/preset';

export const createPresetSlice: StoreSlice<{
  presets: ExperimentPreset[];
  loadPresets: () => Promise<void>;
  savePreset: (name: string, config: any, generatorState?: any) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
}> = (set, get) => ({
  presets: [],

  loadPresets: async () => {
    try {
      const res = await api.preset.getAll();
      set({ presets: res });
    } catch (e) {
      console.error(e);
    }
  },

  savePreset: async (name, config, generatorState) => {
    const { presets, addToast, loadPresets } = get();
    const existing = presets.find(s => s.name === name);
    const newPreset: ExperimentPreset = {
      id: existing ? existing.id : crypto.randomUUID(),
      name,
      config,
      generatorState,
      lastModified: new Date().toISOString(),
    };

    try {
      await api.preset.save(newPreset);
      addToast(
        'success',
        'プリセット保存完了',
        `プリセット「${name}」を${existing ? '更新' : '作成'} しました。`
      );
      await loadPresets();
    } catch (e) {
      addToast('error', '保存エラー', 'プリセットの保存に失敗しました。');
    }
  },

  deletePreset: async id => {
    const { addToast, loadPresets } = get();
    try {
      await api.preset.delete(id);
      addToast('success', '削除完了', 'プリセットを削除しました。');
      await loadPresets();
    } catch (e) {
      addToast('error', '削除エラー', 'プリセットの削除に失敗しました。');
    }
  },
});

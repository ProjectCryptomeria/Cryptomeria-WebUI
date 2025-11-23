import { StoreSlice } from '@/shared/store/types';
import { api } from '@/shared/api';
import { ExperimentResult } from '@/entities/result';

export const createLibrarySlice: StoreSlice<{
	results: ExperimentResult[];
	loadResults: () => Promise<void>;
	deleteResult: (id: string) => Promise<void>;
	registerResult: (result: ExperimentResult) => void;
}> = (set, get) => ({
	results: [],

	loadResults: async () => {
		try {
			const res = await api.library.getResults();
			set({ results: res });
		} catch (e) {
			console.error(e);
		}
	},

	deleteResult: async (id) => {
		const { addToast, results } = get();
		try {
			await api.library.deleteResult(id);
			set({ results: results.filter((r) => r.id !== id) });
			addToast('success', '削除完了', '実験結果ログを削除しました。');
		} catch (e) {
			addToast('error', '削除エラー', '実験結果の削除に失敗しました。');
		}
	},

	registerResult: (result) => {
		set((state) => ({ results: [result, ...state.results] }));
	},
});
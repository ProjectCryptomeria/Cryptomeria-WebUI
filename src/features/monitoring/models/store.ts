import { StoreSlice } from '@/shared/store/types';
import { BlockEvent } from '@/entities/node';
// [MODIFIED] types.tsからインポート
import { MonitoringState } from './types';

// 履歴の最大サイズ (コンポーネントと同期)
const HISTORY_SIZE = 40;

export const createMonitoringSlice: StoreSlice<{ monitoring: MonitoringState }> = (set) => ({
	monitoring: {
		blockHistory: new Map(),

		addBlockEvents: (newBlocks: BlockEvent[]) => {
			if (newBlocks.length === 0) return;

			set(state => {
				// [MODIFIED] 型を明示して unknown エラーを回避
				const next = new Map<string, BlockEvent[]>(state.monitoring.blockHistory);

				newBlocks.forEach(block => {
					const chainName = block.chainName;
					const currentHistory = next.get(chainName) || [];

					// 同じ高さのブロックは追加しない (重複防止)
					if (currentHistory.some(b => b.height === block.height)) return;

					// 新しいブロックを履歴に追加し、サイズを制限
					const updatedHistory = [...currentHistory, block].slice(-HISTORY_SIZE);
					next.set(chainName, updatedHistory);
				});

				return {
					monitoring: {
						...state.monitoring,
						blockHistory: next
					}
				};
			});
		}
	}
});
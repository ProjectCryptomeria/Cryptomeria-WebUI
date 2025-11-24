import { BlockEvent } from '@/entities/node';

// チェーンごとのブロック履歴 Mapの型
export type BlockHistoryMap = Map<string, BlockEvent[]>;

export interface MonitoringState {
	blockHistory: BlockHistoryMap;
	addBlockEvents: (newBlocks: BlockEvent[]) => void;
}
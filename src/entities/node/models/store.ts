// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-monitor/src/entities/node/models/store.ts
import { StoreSlice } from '@/shared/store/types';

export const createNodeSlice: StoreSlice<{
  deployedNodeCount: number;
  isDockerBuilt: boolean;
  minGasPrice: number | null;
  monitoringViewMode: 'topology' | 'feed'; // [NEW]
  setDeployedNodeCount: (count: number) => void;
  setIsDockerBuilt: (built: boolean) => void;
  setMinGasPrice: (price: number) => void;
  setMonitoringViewMode: (mode: 'topology' | 'feed') => void; // [NEW]
}> = set => ({
  deployedNodeCount: 5,
  isDockerBuilt: false,
  minGasPrice: null,
  monitoringViewMode: 'topology', // [NEW] 初期値はトポロジー
  setDeployedNodeCount: count => set({ deployedNodeCount: count }),
  setIsDockerBuilt: built => set({ isDockerBuilt: built }),
  setMinGasPrice: price => set({ minGasPrice: price }),
  setMonitoringViewMode: mode => set({ monitoringViewMode: mode }), // [NEW]
});
import { StoreSlice } from '@/shared/store/types';

export const createNodeSlice: StoreSlice<{
  deployedNodeCount: number;
  isDockerBuilt: boolean;
  minGasPrice: number | null;
  setDeployedNodeCount: (count: number) => void;
  setIsDockerBuilt: (built: boolean) => void;
  setMinGasPrice: (price: number) => void;
}> = set => ({
  deployedNodeCount: 5,
  isDockerBuilt: false,
  minGasPrice: null,
  setDeployedNodeCount: count => set({ deployedNodeCount: count }),
  setIsDockerBuilt: built => set({ isDockerBuilt: built }),
  setMinGasPrice: price => set({ minGasPrice: price }),
});
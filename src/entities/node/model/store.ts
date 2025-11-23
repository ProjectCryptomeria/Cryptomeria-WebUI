import { StoreSlice } from '@/shared/store/types';

export const createNodeSlice: StoreSlice<{
	deployedNodeCount: number;
	isDockerBuilt: boolean;
	baseFeeInfo: any;
	setDeployedNodeCount: (count: number) => void;
	setIsDockerBuilt: (built: boolean) => void;
	setBaseFeeInfo: (info: any) => void;
}> = (set) => ({
	deployedNodeCount: 5,
	isDockerBuilt: false,
	baseFeeInfo: null,
	setDeployedNodeCount: (count) => set({ deployedNodeCount: count }),
	setIsDockerBuilt: (built) => set({ isDockerBuilt: built }),
	setBaseFeeInfo: (info) => set({ baseFeeInfo: info }),
});
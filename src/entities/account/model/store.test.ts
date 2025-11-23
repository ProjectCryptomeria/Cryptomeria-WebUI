// src/entities/account/model/store.test.ts
// FSD Layer: Entities - 純粋なドメインロジック（Zustand Store Slice）のユニットテスト

import { create } from 'zustand';
import { createEconomySlice, EconomySlice } from '@/entities/account/model/store';
import { GlobalState } from '@/shared/store/types';
import { act } from '@testing-library/react';
import { vi } from 'vitest';

// createEconomySliceが依存するメソッドを含むGlobalStateの最小モック
type TestStore = EconomySlice & Pick<GlobalState, 'addToast'>;

// テスト用にGlobalState全体をモックしたStoreを作成
const useTestStore = create<TestStore>()((set, get) => ({
	...createEconomySlice(set, get as any, {} as any),
	addToast: vi.fn(),
}));

describe('Entities/Account: Economy Store Slice (FSD Layer: Entities)', () => {
	// 各テスト前にストアの状態をリセット
	beforeEach(() => {
		useTestStore.setState({
			users: [],
			systemAccounts: [],
		});
		vi.clearAllMocks();
	});

	it('should initialize with default state', () => {
		const { users, systemAccounts } = useTestStore.getState();
		expect(users).toEqual([]);
		expect(systemAccounts).toEqual([]);
	});

	it('should update user balance correctly', () => {
		// 初期状態としてユーザーを設定
		useTestStore.setState({
			users: [{ id: 'user-1', address: 'addr1', balance: 100, role: 'client' }]
		});

		const updateUserBalance = useTestStore.getState().updateUserBalance;

		act(() => {
			updateUserBalance('user-1', 200);
		});

		const updatedUser = useTestStore.getState().users.find(u => u.id === 'user-1');
		expect(updatedUser?.balance).toBe(200);
	});
});

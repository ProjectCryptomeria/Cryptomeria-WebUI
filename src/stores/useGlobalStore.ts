import { create } from 'zustand';
import {
	GlobalState,
	Toast,
	NotificationItem,
	UserAccount,
	SystemAccount,
	ExperimentResult,
	ExperimentPreset,
	ExperimentScenario,
	ExperimentConfig,
	AllocatorStrategy,
	TransmitterStrategy,
	ExecutionResultDetails,
} from '../types';
import { api } from '../services/api';

// WebSocket connection is handled in App.tsx for now to update the store
// In a more advanced setup, we could move WS logic here or into a middleware

interface GlobalStore extends GlobalState { }

export const useGlobalStore = create<GlobalStore>((set, get) => ({
	// --- Monitoring / Deployment ---
	deployedNodeCount: 5,
	isDockerBuilt: false,
	baseFeeInfo: null,
	setDeployedNodeCount: (count) => set({ deployedNodeCount: count }),
	setIsDockerBuilt: (built) => set({ isDockerBuilt: built }),
	setBaseFeeInfo: (info) => set({ baseFeeInfo: info }),

	// --- Notifications ---
	toasts: [],
	notifications: [],
	isNotificationOpen: false,
	setIsNotificationOpen: (isOpen) => set({ isNotificationOpen: isOpen }),
	addToast: (type, title, message) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newNotification: NotificationItem = {
			id,
			type,
			title,
			message,
			timestamp: Date.now(),
			read: false,
		};

		set((state) => {
			const updatedToasts = [...state.toasts, { id, type, title, message }];
			// Keep only last 3 toasts
			const limitedToasts = updatedToasts.length > 3 ? updatedToasts.slice(updatedToasts.length - 3) : updatedToasts;
			return {
				notifications: [newNotification, ...state.notifications],
				toasts: limitedToasts,
			};
		});

		// Auto remove toast after 5 seconds
		setTimeout(() => {
			set((state) => ({
				toasts: state.toasts.filter((t) => t.id !== id),
			}));
		}, 5000);
	},
	clearNotifications: () => set({ notifications: [] }),

	// --- Economy ---
	users: [],
	systemAccounts: [],
	refreshEconomy: async () => {
		try {
			const res = await api.economy.getUsers();
			set({ users: res.users, systemAccounts: res.system });
		} catch (e) {
			console.error('Failed to refresh economy', e);
		}
	},
	createUser: async () => {
		try {
			await api.economy.createUser();
			await get().refreshEconomy();
			get().addToast('success', 'アカウント作成完了', '新規ユーザーアカウントを作成しました。');
		} catch (e) {
			get().addToast('error', '作成エラー', 'アカウント作成に失敗しました。');
		}
	},
	deleteUser: async (id) => {
		try {
			await api.economy.deleteUser(id);
			await get().refreshEconomy();
			get().addToast('success', '削除完了', 'ユーザーアカウントを削除しました。');
		} catch (e) {
			get().addToast('error', '削除エラー', 'アカウント削除に失敗しました。');
		}
	},
	faucet: async (targetId) => {
		try {
			const res = await api.economy.faucet(targetId, 1000);
			await get().refreshEconomy();
			get().addToast('success', 'TKN 送金成功 (Faucet)', `${res.targetName} へ 1000 TKN を送金しました。`);
		} catch (e) {
			get().addToast('error', 'Faucet 失敗', '資金供給に失敗しました (プール残高不足の可能性)');
		}
	},

	// --- Library / Presets ---
	results: [],
	presets: [],
	loadData: async () => {
		try {
			const [resResults, resPresets] = await Promise.all([
				api.library.getResults(),
				api.preset.getAll(),
			]);
			set({ results: resResults, presets: resPresets });
		} catch (e) {
			console.error('Failed to load initial data', e);
		}
	},
	savePreset: async (name, config, generatorState) => {
		const { presets, addToast, loadData } = get();
		const existing = presets.find((s) => s.name === name);
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
				`プリセット「${name}」を${existing ? '更新' : '作成'}しました。`
			);
			await loadData();
		} catch (e) {
			addToast('error', '保存エラー', 'プリセットの保存に失敗しました。');
		}
	},
	deletePreset: async (id) => {
		const { addToast, loadData } = get();
		try {
			await api.preset.delete(id);
			addToast('success', '削除完了', 'プリセットを削除しました。');
			await loadData();
		} catch (e) {
			addToast('error', '削除エラー', 'プリセットの削除に失敗しました。');
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

	// --- Experiment Execution ---
	execution: {
		scenarios: [],
		isGenerating: false,
		isExecutionRunning: false,
		executionId: null,

		generateScenarios: async (params) => {
			const { addToast } = get();
			set((state) => ({ execution: { ...state.execution, isGenerating: true } }));

			// Simulate delay
			await new Promise((r) => setTimeout(r, 300));

			const newScenarios: ExperimentScenario[] = [];
			let idCounter = 1;
			const cleanName = params.projectName.replace(/[^a-zA-Z0-9_]/g, '') || 'Exp';

			const getRange = (p: { mode: string; fixed?: number; range?: any }) => {
				if (p.mode === 'fixed') return [p.fixed!];
				const res = [];
				const start = Number(p.range.start);
				const end = Number(p.range.end);
				const step = Number(p.range.step);
				if (step <= 0 || start > end) return [start];
				for (let i = start; i <= end; i += step) {
					res.push(i);
				}
				return res;
			};

			const dataSizes = getRange(params.dataSizeParams);
			const chunkSizes = getRange(params.chunkSizeParams);
			const allocators = Array.from(params.selectedAllocators) as AllocatorStrategy[];
			const transmitters = Array.from(params.selectedTransmitters) as TransmitterStrategy[];

			const sortedSelectedChains = Array.from(params.selectedChains as Set<string>).sort((a, b) =>
				a.localeCompare(b, undefined, { numeric: true })
			);

			let chainCounts: number[] = [];
			if (params.chainMode === 'range') {
				const { start, end, step } = params.chainRangeParams;
				const maxCount = sortedSelectedChains.length;
				if (step > 0) {
					for (let i = start; i <= end; i += step) {
						if (i > 0 && i <= maxCount) {
							chainCounts.push(i);
						}
					}
				}
				if (chainCounts.length === 0) chainCounts = [1];
			} else {
				chainCounts = [sortedSelectedChains.length];
			}

			for (const ds of dataSizes) {
				for (const cs of chunkSizes) {
					for (const cCount of chainCounts) {
						for (const alloc of allocators) {
							for (const trans of transmitters) {
								const targets = sortedSelectedChains.slice(0, cCount);
								if (targets.length === 0) continue;

								newScenarios.push({
									id: idCounter++,
									uniqueId: `${cleanName}_${Date.now()}_${idCounter}`,
									userId: params.selectedUserId,
									dataSize: ds,
									chunkSize: cs,
									allocator: alloc,
									transmitter: trans,
									chains: targets.length,
									targetChains: targets,
									budgetLimit: 1000,
									cost: 0,
									status: 'PENDING',
									failReason: null,
									progress: 0,
									logs: [],
								});
							}
						}
					}
				}
			}

			set((state) => ({
				execution: {
					...state.execution,
					scenarios: newScenarios,
					isGenerating: false,
				}
			}));

			params.setIsOpen(true);
			addToast(
				'info',
				'シナリオ生成',
				`${newScenarios.length} 件のシナリオを生成しました。コスト試算を開始します。`
			);

			// Start estimation sequence
			// Note: We need to access the store again to get the latest state if needed, 
			// but here we pass the new scenarios directly.
			// We also need to access users to check balance.
			// The original code passed users as argument. Here we can get it from store.

			// We need to define runEstimationSequence inside or outside. 
			// Since it's complex and uses `set`, let's define a helper or put it here.
			// For simplicity, I'll implement the logic here or call a private helper.
			// But `runEstimationSequence` was recursive/looping and updated state.

			// To avoid huge function, let's call a helper that we attach to the store or just inline it.
			// Since `runEstimationSequence` is not exposed in the interface, we can inline it or make it a local function.

			// However, `runEstimationSequence` needs to update the store state (scenarios).
			// We can use `get().execution.recalculateAll` logic if we make it reusable.

			// Let's just call the logic directly here.
			const { users } = get();
			// We need to pass users from params if they are not yet in store? 
			// The original code passed `params.users`. 
			// But `users` should be in global store now.

			await get().execution.recalculateAll(users);
		},

		executeScenarios: async (projectName) => {
			const { addToast, execution } = get();
			set((state) => ({ execution: { ...state.execution, isExecutionRunning: true } }));
			addToast('info', '実行開始', 'シナリオを順次実行します。');

			const readyScenarios = execution.scenarios.filter((s) => s.status === 'READY');
			try {
				const res = await api.experiment.run(readyScenarios);
				set((state) => ({ execution: { ...state.execution, executionId: res.executionId } }));
			} catch (e) {
				addToast('error', '実行エラー', 'シナリオの実行開始に失敗しました。');
				set((state) => ({ execution: { ...state.execution, isExecutionRunning: false } }));
			}
		},

		recalculateAll: async (users) => {
			const { addToast } = get();
			// Reset statuses if needed (logic from handleRecalculateAll)
			// But if called from generateScenarios, they are already PENDING.
			// If called explicitly, we reset them.

			// We need to know if we are just starting or restarting.
			// The original `handleRecalculateAll` reset everything.
			// `generateScenarios` created them as PENDING.

			// Let's assume this function handles the estimation loop for whatever is in `scenarios`.
			// But we should probably reset them to PENDING if they are not.

			// Actually, `generateScenarios` calls `runEstimationSequence`.
			// `handleRecalculateAll` resets then calls `runEstimationSequence`.

			// Let's implement the loop logic here.

			const userBalances: { [key: string]: number } = {};
			users.forEach((u: any) => {
				userBalances[u.id] = u.balance;
			});

			// We need a way to update a single scenario in the loop
			const updateStatus = (id: number, status: string, cost = 0, reason: string | null = null) => {
				set((state) => ({
					execution: {
						...state.execution,
						scenarios: state.execution.scenarios.map((s) =>
							s.id === id ? { ...s, status: status as any, cost, failReason: reason } : s
						),
					}
				}));
			};

			const { execution } = get();
			const targetScenarios = execution.scenarios; // These should be the ones to estimate

			let abort = false;

			for (const scenario of targetScenarios) {
				if (abort) break;

				// Skip if already calculated? Original code didn't skip, it iterated all passed scenarios.
				// But `handleRecalculateAll` passed "resetScenarios".
				// `generateScenarios` passed "newScenarios".

				// So we should iterate over current scenarios in store.

				// Check if we need to reset status first?
				// If the status is not PENDING/CALCULATING, maybe we should skip?
				// Original logic:
				// generateScenarios -> creates PENDING scenarios -> runEstimationSequence
				// handleRecalculateAll -> resets all to PENDING -> runEstimationSequence

				// So if we are here, we assume scenarios are ready to be estimated.

				updateStatus(scenario.id, 'CALCULATING');

				try {
					const res = await api.experiment.estimate(scenario as any);
					const estimatedCost = res.cost;
					const currentBalance = userBalances[scenario.userId] || 0;

					if (currentBalance < estimatedCost) {
						updateStatus(
							scenario.id,
							'FAIL',
							estimatedCost,
							`資金不足 (残高: ${currentBalance.toFixed(2)} < 必要: ${estimatedCost.toFixed(2)})`
						);
						abort = true;
						addToast('error', '試算中断', `シナリオ #${scenario.id} で資金不足が発生しました。`);
						break;
					} else {
						userBalances[scenario.userId] -= estimatedCost;
						updateStatus(scenario.id, 'READY', estimatedCost);
					}
				} catch (e) {
					updateStatus(scenario.id, 'FAIL', 0, '試算APIエラー');
					abort = true;
					break;
				}
			}
		},

		reprocessCondition: (id) => {
			set((state) => ({
				execution: {
					...state.execution,
					scenarios: state.execution.scenarios.map((s) =>
						s.id === id ? { ...s, status: 'PENDING', failReason: null } : s
					),
				}
			}));
		},

		removeScenario: (id) => {
			const { addToast, execution } = get();
			if (execution.isExecutionRunning) {
				addToast('warning', '操作不可', '実行中はシナリオを削除できません。');
				return;
			}
			const target = execution.scenarios.find((s) => s.id === id);
			if (target && (target.status === 'CALCULATING' || target.status === 'PENDING')) {
				addToast('warning', '操作不可', 'コスト試算中はシナリオを削除できません。');
				return;
			}
			set((state) => ({
				execution: {
					...state.execution,
					scenarios: state.execution.scenarios.filter((s) => s.id !== id),
				}
			}));
		},

		clearAllScenarios: () => {
			const { addToast, execution } = get();
			if (execution.isExecutionRunning) {
				addToast('warning', '操作不可', '実行中はシナリオを削除できません。');
				return;
			}
			const isEstimating = execution.scenarios.some((s) => s.status === 'CALCULATING' || s.status === 'PENDING');
			if (isEstimating) {
				addToast('warning', '操作不可', 'コスト試算中はシナリオを削除できません。');
				return;
			}

			set((state) => ({
				execution: {
					...state.execution,
					scenarios: [],
				}
			}));
			addToast('info', 'キュー削除', 'すべてのシナリオを削除しました。');
		},
	},
}));

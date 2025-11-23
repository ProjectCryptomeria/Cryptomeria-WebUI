import { create } from 'zustand';
import type {
	Toast,
	NotificationItem,
	GlobalState,
} from '../types';
import type {
	UserAccount,
	SystemAccount,
} from '../../entities/account';
import type { ExperimentResult } from '../../entities/result';
import type { ExperimentPreset } from '../../entities/preset';
import type {
	ExperimentScenario,
	ExperimentConfig,
	AllocatorStrategy,
	TransmitterStrategy,
	ExecutionResultDetails,
} from '../../entities/scenario';
import { api } from '../api';

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

	// ★ 追加: トーストを削除するアクションの実装
	removeToast: (id) => {
		set((state) => ({
			toasts: state.toasts.filter((t) => t.id !== id),
		}));
	},

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
			// ★ 修正: removeToast アクションを呼び出すように変更
			get().removeToast(id);
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

	// ★ 追加: 特定のユーザーの残高を更新するアクション
	updateUserBalance: (userId, newBalance) => {
		set(state => ({
			users: state.users.map(u =>
				u.id === userId ? { ...u, balance: newBalance } : u
			)
		}));
	},

	// --- Library / Presets ---
	results: [],
	presets: [],
	// ★ 修正: loadData に Economy データ取得を追加（前々回の修正漏れ対応）
	loadData: async () => {
		try {
			const [resResults, resPresets, resEconomy] = await Promise.all([
				api.library.getResults(),
				api.preset.getAll(),
				api.economy.getUsers(), // ★ 追加: Economyデータ取得
			]);
			set({
				results: resResults,
				presets: resPresets,
				users: resEconomy.users,         // ★ 追加: usersの更新
				systemAccounts: resEconomy.system // ★ 追加: systemAccountsの更新
			});
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
				`プリセット「${name}」を${existing ? '更新' : '作成'} しました。`
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

		// ★ 追加/修正: シナリオの状態とログ、および実行完了時の処理（通知/残高更新）
		updateScenario: (id, updates, isComplete = false) => {
			const { addToast, registerResult, updateUserBalance } = get();

			set((state) => ({
				execution: {
					...state.execution,
					scenarios: state.execution.scenarios.map((s) => {
						if (s.uniqueId === id) {
							const newStatus = updates.status || s.status;
							const newLog = updates.log ? [...s.logs, updates.log] : s.logs;

							// 実行完了時: 結果を登録し、通知を出す
							if (isComplete && (newStatus === 'COMPLETE' || newStatus === 'FAIL')) {
								const details = updates.resultDetails;
								let toastTitle = '';
								let toastMessage = '';

								if (details) {
									const actualCost = details.actualCost.toFixed(2);
									const refund = details.refund.toFixed(2);
									const currentBalance = details.currentBalance.toFixed(2);
									const userName = details.userName || 'Unknown User';

									// ★ 修正: 通知タイトルにシナリオIDとユニークIDの一部を追加
									if (newStatus === 'COMPLETE') {
										toastTitle = `シナリオ #${s.id} 結果 (${s.uniqueId.substring(0, 8)}...)`;
										// ★ 修正: 通知メッセージにアカウント名、費用、残高を追加
										toastMessage = `アカウント: ${userName} | 費用: ${actualCost} TKN (返金: ${refund} TKN) | 残高: ${currentBalance} TKN`;
										if (details.result) {
											registerResult(details.result);
										}
									} else {
										toastTitle = `シナリオ #${s.id} エラー (${s.uniqueId.substring(0, 8)}...)`;
										// ★ 修正: 通知メッセージにアカウント名、費用、残高を追加
										toastMessage = `アカウント: ${userName} | 費用: ${actualCost} TKN (返金: ${refund} TKN) | 残高: ${currentBalance} TKN`;
									}

									// ★ 追加: ユーザー残高を更新する (画面上のリアルタイム更新のため)
									updateUserBalance(details.userId, details.currentBalance);
								} else {
									// Fallback
									toastTitle = newStatus === 'COMPLETE' ? '実行完了' : '実行失敗';
									toastMessage = `シナリオ #${s.id} が${toastTitle}しました。`;
								}

								addToast(newStatus === 'COMPLETE' ? 'success' : 'error', toastTitle, toastMessage);

								// 実行キューのログを更新するために、ログをここで保持する
								return {
									...s,
									status: newStatus,
									logs: newLog,
									failReason: updates.failReason || s.failReason,
									cost: updates.resultDetails?.actualCost || s.cost,
								} as ExperimentScenario; // 型推論を ExperimentScenario に固定
							}

							return {
								...s,
								...updates,
								logs: newLog,
								status: newStatus,
							} as ExperimentScenario; // 型推論を ExperimentScenario に固定
						}
						return s;
					}),
					// isExecutionRunning の状態は updateExecutionStatus で別途管理
				}
			}));
		},

		// ★ 追加: 実行状態をまとめて管理するためのアクション
		updateExecutionStatus: (running, executionId = null) => {
			set(state => ({
				execution: {
					...state.execution,
					isExecutionRunning: running,
					executionId: executionId,
				}
			}))
		},

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
									uniqueId: `${cleanName}_${Date.now()}_${idCounter} `,
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
			const { users } = get();
			await get().execution.recalculateAll(users);
		},

		executeScenarios: async (projectName) => {
			const { addToast, execution } = get();
			// updateExecutionStatus を使用
			get().execution.updateExecutionStatus(true);
			addToast('info', '実行開始', 'シナリオを順次実行します。');

			const readyScenarios = execution.scenarios.filter((s) => s.status === 'READY');
			try {
				const res = await api.experiment.run(readyScenarios);
				// updateExecutionStatus を使用
				get().execution.updateExecutionStatus(true, res.executionId);
			} catch (e) {
				addToast('error', '実行エラー', 'シナリオの実行開始に失敗しました。');
				// updateExecutionStatus を使用
				get().execution.updateExecutionStatus(false);
			}
		},

		recalculateAll: async (users) => {
			const { addToast } = get();

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

			// ★ 修正点: 処理対象のシナリオを、PENDING (初回生成) または FAIL (再試算対象) のみに限定する
			let targetScenarios = execution.scenarios.filter(s => s.status === 'PENDING' || s.status === 'FAIL');

			if (targetScenarios.length === 0) {
				// 再試算対象がなければ何もしない
				return;
			}

			let abort = false;

			for (const scenario of targetScenarios) {
				if (abort) break;

				// PENDING/FAIL のシナリオを CALCULATING に設定して処理を開始
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
							`資金不足(残高: ${currentBalance.toFixed(2)} < 必要: ${estimatedCost.toFixed(2)})`
						);
						abort = true;
						addToast('error', '試算中断', `シナリオ #${scenario.id} で資金不足が発生しました。`);
						break;
					} else {
						// 成功したら、そのコストを一旦ユーザーの仮想残高から引く (次のシナリオの残高チェックに影響するため)
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
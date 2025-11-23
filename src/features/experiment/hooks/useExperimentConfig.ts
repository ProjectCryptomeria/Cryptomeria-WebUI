import { useState, useEffect } from 'react';
import {
	AllocatorStrategy,
	TransmitterStrategy,
	UserAccount,
	ExperimentConfig,
	ExperimentPreset,
} from '../../../types';
import { useFileUploadTree } from './useFileUploadTree';
import { mapStateToPresetConfig, mapPresetToState, ExperimentFormState } from '../utils/mappers';

/**
 * 実験設定フォームの状態とロジックを管理するHook
 */
export const useExperimentConfig = (
	users: UserAccount[],
	deployedNodeCount: number,
	notify: (type: 'success' | 'error', title: string, message: string) => void,
	onSavePresetAPI: (name: string, config: ExperimentConfig, generatorState?: any) => void
) => {
	// --- State Definitions (入力フォームの状態管理) ---

	// データソースのモード（仮想データ生成 'virtual' か、実ファイルアップロード 'upload' か）を管理
	const [mode, setMode] = useState<'virtual' | 'upload'>('virtual');

	// 実験プロジェクトの名称を管理
	const [projectName, setProjectName] = useState('複合パラメータテスト');

	// 実験を実行するユーザーアカウントのIDを管理
	const [selectedUserId, setSelectedUserId] = useState<string>('');

	// データサイズの設定値を管理（固定値、または実験用の範囲指定）
	const [dataSizeParams, setDataSizeParams] = useState({
		mode: 'fixed' as 'fixed' | 'range',
		fixed: 500,
		range: { start: 100, end: 500, step: 100 },
	});

	// チャンクサイズの設定値を管理（固定値、または実験用の範囲指定）
	const [chunkSizeParams, setChunkSizeParams] = useState({
		mode: 'fixed' as 'fixed' | 'range',
		fixed: 64,
		range: { start: 32, end: 128, step: 32 },
	});

	// 実験対象として選択されたデータチェーン（ノード）のIDセットを管理
	const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());

	// 選択されたデータ割り当て戦略（Allocator）のセットを管理
	const [selectedAllocators, setSelectedAllocators] = useState<Set<AllocatorStrategy>>(
		new Set([AllocatorStrategy.ROUND_ROBIN])
	);

	// 選択されたデータ送信戦略（Transmitter）のセットを管理
	const [selectedTransmitters, setSelectedTransmitters] = useState<Set<TransmitterStrategy>>(
		new Set([TransmitterStrategy.ONE_BY_ONE])
	);

	// ファイルアップロード機能の統合（ファイル解析、ツリー構造データ、input要素への参照などを管理）
	const { uploadStats, setUploadStats, fileInputRef, processFiles } = useFileUploadTree(notify);

	// --- Initialization Effects (初期化処理) ---
	useEffect(() => {
		// デプロイ済みノードが存在し、チェーンが未選択の場合、デフォルトで全てのチェーンを選択状態にする
		if (deployedNodeCount > 0 && selectedChains.size === 0) {
			const all = new Set<string>();
			for (let i = 0; i < deployedNodeCount; i++) all.add(`datachain-${i}`);
			setSelectedChains(all);
		}
		// ユーザーリストがロードされ、ユーザーが未選択の場合、リストの先頭のユーザーをデフォルト選択する
		if (users.length > 0 && !selectedUserId) {
			setSelectedUserId(users[0].id);
		}
	}, [deployedNodeCount, users]);

	// --- Handlers (操作ロジック) ---

	/**
	 * ファイルアップロード処理
	 * アップロードされたファイルを解析し、その合計サイズを「データサイズ（固定値）」として設定に反映する
	 */
	const handleFileProcess = async (files: File[]) => {
		const sizeMB = await processFiles(files);
		setDataSizeParams(prev => ({ ...prev, mode: 'fixed', fixed: sizeMB }));
	};

	/**
	 * プリセット保存処理
	 * 現在のフォーム状態を集約・変換し、API経由でプリセットとして保存する
	 */
	const handleSavePreset = (newPresetName: string) => {
		if (!newPresetName) {
			notify('error', 'エラー', 'プリセット名を入力してください');
			return;
		}

		// 現在の全ステートをまとめる
		const currentState: ExperimentFormState = {
			projectName,
			selectedUserId,
			mode,
			dataSizeParams,
			chunkSizeParams,
			selectedChains,
			selectedAllocators,
			selectedTransmitters,
		};

		// 保存用にAPIの形式へ変換（Mapperを利用）
		const { config, generatorState } = mapStateToPresetConfig(currentState);
		onSavePresetAPI(newPresetName, config, generatorState);
	};

	/**
	 * プリセット読み込み処理
	 * 保存されたプリセットデータを受け取り、それをUI用のステート形式に変換（復元）して各Stateを更新する
	 */
	const loadPreset = (preset: ExperimentPreset) => {
		const newState = mapPresetToState(preset, deployedNodeCount);

		if (newState.projectName) setProjectName(newState.projectName);
		if (newState.selectedUserId) setSelectedUserId(newState.selectedUserId);
		if (newState.mode) setMode(newState.mode);
		if (newState.dataSizeParams) setDataSizeParams(newState.dataSizeParams);
		if (newState.chunkSizeParams) setChunkSizeParams(newState.chunkSizeParams);
		if (newState.selectedAllocators) setSelectedAllocators(newState.selectedAllocators);
		if (newState.selectedTransmitters) setSelectedTransmitters(newState.selectedTransmitters);
		if (newState.selectedChains) setSelectedChains(newState.selectedChains);

		notify('success', 'ロード完了', `プリセット "${preset.name}" を読み込みました`);
	};

	/**
	 * 現在の状態取得ヘルパー
	 * シナリオ生成ロジックなど、外部機能に現在のフォーム設定を一括で渡すために使用
	 */
	const getCurrentState = (): ExperimentFormState => ({
		projectName,
		selectedUserId,
		mode,
		dataSizeParams,
		chunkSizeParams,
		selectedChains,
		selectedAllocators,
		selectedTransmitters,
	});

	return {
		// States (UIコンポーネントへ渡す値)
		mode,
		setMode,
		projectName,
		setProjectName,
		selectedUserId,
		setSelectedUserId,
		dataSizeParams,
		setDataSizeParams,
		chunkSizeParams,
		setChunkSizeParams,
		selectedChains,
		setSelectedChains,
		selectedAllocators,
		setSelectedAllocators,
		selectedTransmitters,
		setSelectedTransmitters,

		// File Upload (ファイル関連の機能)
		uploadStats,
		setUploadStats,
		fileInputRef,
		handleFileProcess,

		// Logic (アクション関数)
		handleSavePreset,
		loadPreset,
		getCurrentState,
	};
};
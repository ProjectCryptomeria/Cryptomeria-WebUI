// src/features/experiment/hooks/useExperimentConfig.ts 修正後の内容
// 1. Unused eslint-disable directive の警告を解消するため、該当するディレクティブを削除または修正する。

import { useState, useEffect } from 'react';
import { AllocatorStrategy, TransmitterStrategy } from '@/entities/scenario';
import { ExperimentPreset } from '@/entities/preset';
import { NodeStatus, MonitoringUpdate } from '@/entities/node';
import { useFileUploadTree } from './useFileUploadTree';
import { mapStateToPresetConfig, mapPresetToState, ExperimentFormState } from '../utils/mappers';
import { useWebSocket } from '@/shared/lib/hooks/useWebSocket';
import { useGlobalStore } from '@/shared/store';

/**
 * 実験設定フォームの状態とロジックを管理するHook
 */
export const useExperimentConfig = () => {
  const { users, addToast, savePreset } = useGlobalStore();

  // --- WebSocket Data (Nodes Status) ---
  const [nodes, setNodes] = useState<NodeStatus[]>([]);

  // 監視情報を受信してノード状態を更新
  // NOTE: useWebSocketの戻り値からsocketRef.currentへの直接アクセスを削除したため、ここでの変更は不要
  useWebSocket<MonitoringUpdate>('/ws/monitoring', data => {
    if (data && data.nodes) {
      setNodes(data.nodes);
    }
  });

  // --- State Definitions ---
  const [mode, setMode] = useState<'virtual' | 'upload'>('virtual');
  const [projectName, setProjectName] = useState('アップロードテスト');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const [dataSizeParams, setDataSizeParams] = useState({
    mode: 'fixed' as 'fixed' | 'range',
    fixed: 500,
    range: { start: 100, end: 500, step: 100 },
  });
  const [chunkSizeParams, setChunkSizeParams] = useState({
    mode: 'fixed' as 'fixed' | 'range',
    fixed: 64,
    range: { start: 32, end: 128, step: 32 },
  });

  // --- Chain Selection States ---
  // chainMode: 'fixed' (選択したチェーン全て) or 'range' (選択リストからステップ実行)
  const [chainMode, setChainMode] = useState<'fixed' | 'range'>('fixed');
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());

  // Rangeパラメータ (選択されたチェーンの数に対する範囲)
  const [chainRangeParams, setChainRangeParams] = useState({
    start: 1,
    end: 1, // 初期値
    step: 1,
  });

  const [selectedAllocators, setSelectedAllocators] = useState<Set<AllocatorStrategy>>(
    new Set([AllocatorStrategy.ROUND_ROBIN])
  );
  const [selectedTransmitters, setSelectedTransmitters] = useState<Set<TransmitterStrategy>>(
    new Set([TransmitterStrategy.ONE_BY_ONE])
  );

  // useFileUploadTreeのanyエラーを避けるため、anyを削除 (ここでは型定義の修正は行いませんが、anyを渡す箇所を修正する際に必要となる情報です)
  const { uploadStats, setUploadStats, fileInputRef, processFiles } = useFileUploadTree(addToast);

  // --- Initialization Effects ---

  // ノード情報が更新されたら、デフォルト選択や範囲の最大値を調整
  useEffect(() => {
    const activeDataNodes = nodes.filter(n => n.type === 'data' && n.status === 'active');

    // まだチェーンが選択されていない場合、Activeなものを全選択する（初期ロード時など）
    if (activeDataNodes.length > 0 && selectedChains.size === 0) {
      const allActive = new Set(activeDataNodes.map(n => n.id));
      // NOTE: 非同期データ（nodes）に基づく初期化処理のため、set-state-in-effectを無効化
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedChains(allActive);
      setChainRangeParams(prev => ({ ...prev, end: allActive.size }));
    }
    // 修正: selectedChains.sizeが条件として使われているため、exhaustive-depsの警告を解消するために依存配列に追加
  }, [nodes, selectedChains.size]); // nodesの更新を監視

  // ユーザー初期選択
  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      // NOTE: 非同期データ（users）に基づく初期化処理のため、set-state-in-effectを無効化
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedUserId(users[0].id);
    }
    // 修正: selectedUserIdが条件として使われているため、exhaustive-depsの警告を解消するために依存配列に追加
  }, [users, selectedUserId]);

  // 選択チェーン数が変わったら、RangeのEndを自動調整する（UX向上）
  useEffect(() => {
    if (selectedChains.size > 0) {
      // NOTE: UI/UXの即時フィードバックのための同期的なset-stateであるため、set-state-in-effectを無効化
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChainRangeParams(prev => ({
        ...prev,
        end: Math.min(Math.max(prev.end, 1), selectedChains.size), // 現在の設定と選択数の小さい方、ただし最低1
      }));
    }
  }, [selectedChains.size]);

  // --- Handlers ---

  const handleFileProcess = async (files: File[]) => {
    const sizeMB = await processFiles(files);
    setDataSizeParams(prev => ({ ...prev, mode: 'fixed', fixed: sizeMB }));
  };

  const handleSavePreset = (newPresetName: string) => {
    if (!newPresetName) {
      addToast('error', 'エラー', 'プリセット名を入力してください');
      return;
    }

    const currentState: ExperimentFormState = {
      projectName,
      selectedUserId,
      mode,
      dataSizeParams,
      chunkSizeParams,
      chainMode,
      chainRangeParams,
      selectedChains,
      selectedAllocators,
      selectedTransmitters,
    };

    const { config, generatorState } = mapStateToPresetConfig(currentState);
    savePreset(newPresetName, config, generatorState);
  };

  const loadPreset = (preset: ExperimentPreset) => {
    // ノード数ではなく、実際のノードIDリストが必要なため、ここでは簡易的な整合性チェックに留める
    const newState = mapPresetToState(preset, 100); // countは一旦大きめに渡す

    if (newState.projectName) setProjectName(newState.projectName);
    if (newState.selectedUserId) setSelectedUserId(newState.selectedUserId);
    if (newState.mode) setMode(newState.mode);
    if (newState.dataSizeParams) setDataSizeParams(newState.dataSizeParams);
    if (newState.chunkSizeParams) setChunkSizeParams(newState.chunkSizeParams);

    if (newState.chainMode) setChainMode(newState.chainMode);
    if (newState.chainRangeParams) setChainRangeParams(newState.chainRangeParams);

    // プリセットのチェーンが存在し、かつActiveなものだけを選択状態にするフィルタリング
    if (newState.selectedChains) {
      const validChains = new Set<string>();
      newState.selectedChains.forEach(id => {
        const node = nodes.find(n => n.id === id);
        // ノード情報がまだロードされていない場合はとりあえず追加、ロードされていればActiveのみ
        if (!node || node.status === 'active') {
          validChains.add(id);
        }
      });
      setSelectedChains(validChains);
    }

    if (newState.selectedAllocators) setSelectedAllocators(newState.selectedAllocators);
    if (newState.selectedTransmitters) setSelectedTransmitters(newState.selectedTransmitters);

    addToast('success', 'ロード完了', `プリセット "${preset.name}" を読み込みました`);
  };

  const getCurrentState = (): ExperimentFormState => ({
    projectName,
    selectedUserId,
    mode,
    dataSizeParams,
    chunkSizeParams,
    chainMode,
    chainRangeParams,
    selectedChains,
    selectedAllocators,
    selectedTransmitters,
  });

  return {
    nodes, // UI側でリスト表示に使うため返す
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

    chainMode,
    setChainMode,
    chainRangeParams,
    setChainRangeParams,
    selectedChains,
    setSelectedChains,

    selectedAllocators,
    setSelectedAllocators,
    selectedTransmitters,
    setSelectedTransmitters,

    uploadStats,
    setUploadStats,
    fileInputRef,
    handleFileProcess,

    handleSavePreset,
    loadPreset,
    getCurrentState,
  };
};

import React, { useState } from 'react';
import {
  ExperimentConfig,
  UserAccount,
  ExperimentPreset,
  ExperimentScenario,
  ExperimentResult,
} from '../../types';
import { AlertCircle, Loader2, X, ArrowLeft, CheckCircle, Clock, TestTube } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { LogViewer } from '../../components/ui/LogViewer';
import { PageHeader } from '../../components/ui/PageHeader';
import { useResizerPanel } from '../../hooks/useResizerPanel';
import { useScenarioExecution } from './hooks/useScenarioExecution';

// Components
import { PresetSidePanel } from './components/PresetSidePanel';
import { ResultsBottomPanel } from './components/ResultsBottomPanel';
import { ExperimentConfigForm } from './components/ExperimentConfigForm';
import { useExperimentConfig } from './hooks/useExperimentConfig';

interface ExperimentLayerProps {
  users: UserAccount[];
  presets: ExperimentPreset[];
  deployedNodeCount: number;
  onRegisterResult: (result: ExperimentResult) => void;
  onSavePreset: (name: string, config: ExperimentConfig, generatorState?: any) => void;
  onDeletePreset?: (id: string) => void;
  notify: (type: 'success' | 'error', title: string, message: string) => void;
}

const ExperimentLayer: React.FC<ExperimentLayerProps> = ({
  users,
  presets,
  deployedNodeCount,
  onRegisterResult,
  onSavePreset,
  onDeletePreset,
  notify,
}) => {
  // --- UI States ---
  // [FIX] プリセットパネル表示ステート
  const [isPresetPanelOpen, setIsPresetPanelOpen] = useState(true);
  // [FIX] 新規プリセット名
  const [newPresetName, setNewPresetName] = useState('');

  // Modal States
  // [FIX] エラーモーダル表示ステート
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; id: string; reason: string }>({
    isOpen: false,
    id: '',
    reason: '',
  });
  // [FIX] 表示するシナリオのユニークIDのみを保持する
  const [logScenarioId, setLogScenarioId] = useState<string | null>(null);

  // --- Custom Hooks ---

  // [FIX] Configuration Logic (フォーム状態とプリセット操作)
  const config = useExperimentConfig(users, deployedNodeCount, notify, onSavePreset);

  // [FIX] Execution Logic (シナリオ生成と実行)
  const execution = useScenarioExecution(notify, onRegisterResult);

  // [FIX] Bottom Panel Resizer
  const bottomPanel = useResizerPanel(320, 100, 0.8);

  // [FIX] Derived State: IDが設定されている場合、常に最新のシナリオ配列から該当オブジェクトを検索する
  const scenarioToView = React.useMemo(() => {
    if (!logScenarioId) return null;
    return execution.scenarios.find(s => s.uniqueId === logScenarioId) || null;
  }, [logScenarioId, execution.scenarios]);

  // --- Calculations ---

  // [FIX] successCount は 'COMPLETE' のみで、'READY' は Pending に含める
  const successCount = execution.scenarios.filter(c => ['COMPLETE'].includes(c.status)).length;

  // [FIX] failCount は 'FAIL' のみで、'READY' は Pending に含める
  const failCount = execution.scenarios.filter(c => ['FAIL'].includes(c.status)).length;

  // [FIX] 実行待機中数 (PENDING, CALCULATING, READY, RUNNING の合計) を計算
  const pendingCount = execution.scenarios.filter(c =>
    ['PENDING', 'CALCULATING', 'READY', 'RUNNING'].includes(c.status)
  ).length;

  const totalCost = execution.scenarios.reduce((acc, cur) => acc + (cur.cost || 0), 0).toFixed(2);

  // --- Handlers ---

  // [FIX] シナリオを生成する
  const handleGenerateClick = () => {
    const state = config.getCurrentState();
    execution.generateScenarios({
      ...state,
      users,
      setIsOpen: bottomPanel.setIsOpen,
    });
  };

  // [FIX] 新規プリセットを保存する
  const onSaveClick = () => {
    config.handleSavePreset(newPresetName);
    setNewPresetName('');
  };

  return (
    <div className="flex h-full w-full overflow-hidden relative text-gray-800">
      <div className="flex w-full h-full relative">
        <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar pb-32">
            {/* --- Header Added Here --- */}
            <PageHeader
              title="実験実行"
              description="実験シナリオのパラメータ設定と実行、バッチ処理の管理"
              icon={TestTube}
              iconColor="text-scenario-accent"
            />

            {/* --- メイン設定フォーム --- */}
            <ExperimentConfigForm
              // State passed from useExperimentConfig hook
              mode={config.mode}
              setMode={config.setMode}
              projectName={config.projectName}
              setProjectName={config.setProjectName}
              users={users}
              selectedUserId={config.selectedUserId}
              setSelectedUserId={config.setSelectedUserId}
              uploadStats={config.uploadStats}
              setUploadStats={config.setUploadStats}
              fileInputRef={config.fileInputRef}
              onFileProcess={config.handleFileProcess}
              dataSizeParams={config.dataSizeParams}
              setDataSizeParams={config.setDataSizeParams}
              chunkSizeParams={config.chunkSizeParams}
              setChunkSizeParams={config.setChunkSizeParams}
              deployedNodeCount={deployedNodeCount}
              selectedChains={config.selectedChains}
              setSelectedChains={config.setSelectedChains}
              // 追加・修正
              nodes={config.nodes} // ノード情報を渡す
              chainMode={config.chainMode}
              setChainMode={config.setChainMode}
              chainRangeParams={config.chainRangeParams}
              setChainRangeParams={config.setChainRangeParams}
              selectedAllocators={config.selectedAllocators}
              setSelectedAllocators={config.setSelectedAllocators}
              selectedTransmitters={config.selectedTransmitters}
              setSelectedTransmitters={config.setSelectedTransmitters}
              // Actions
              isGenerating={execution.isGenerating}
              onGenerate={handleGenerateClick}
            />

            {/* Spacer for Bottom Panel */}
            <div className="h-[80px] w-full pointer-events-none" aria-hidden="true" />
          </div>

          {/* --- 生成結果パネル (ボトム) --- */}
          <ResultsBottomPanel
            isOpen={bottomPanel.isOpen}
            setIsOpen={bottomPanel.setIsOpen}
            height={bottomPanel.height}
            panelRef={bottomPanel.panelRef}
            resizerRef={bottomPanel.resizerRef}
            scenarios={execution.scenarios}
            totalCost={totalCost}
            successCount={successCount}
            failCount={failCount}
            pendingCount={pendingCount} // [修正] pendingCountを渡す
            isExecutionRunning={execution.isExecutionRunning}
            onRecalculateAll={execution.handleRecalculateAll}
            onExecute={() => execution.executeScenarios(config.projectName)}
            onErrorClick={(id, reason) => setErrorModal({ isOpen: true, id, reason })}
            onReprocess={execution.reprocessCondition}
            // [FIX] onLogClickでユニークIDをセット
            onLogClick={scenario => setLogScenarioId(scenario.uniqueId)}
          />

          {/* サイドバー開閉ボタン */}
          <button
            onClick={() => setIsPresetPanelOpen(true)}
            className={`absolute top-4 right-0 bg-white border border-gray-200 shadow-lg rounded-l-xl p-3 text-scenario-accent hover:bg-orange-50 transition-all z-20 ${
              isPresetPanelOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* --- プリセット管理サイドバー --- */}
        <PresetSidePanel
          isOpen={isPresetPanelOpen}
          onClose={() => setIsPresetPanelOpen(false)}
          presets={presets}
          newPresetName={newPresetName}
          setNewPresetName={setNewPresetName}
          onSave={onSaveClick}
          onLoad={config.loadPreset}
          onDelete={onDeletePreset}
          deployedNodeCount={deployedNodeCount}
        />
      </div>

      {/* --- モーダル定義 --- */}

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(p => ({ ...p, isOpen: false }))}
        className="max-w-md w-full p-8 rounded-3xl ring-4 ring-white/50"
      >
        <div className="flex items-center border-b border-gray-100 pb-4 mb-6">
          <div className="bg-red-50 p-3 rounded-full mr-4 text-status-fail">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">試算エラー詳細</h3>
        </div>
        <div className="mb-8">
          <p className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-wide">
            ID: {errorModal.id}
          </p>
          <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">理由</p>
          <p className="text-red-600 font-medium bg-red-50 p-4 rounded-xl border border-red-100 text-base leading-relaxed shadow-sm">
            {errorModal.reason}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setErrorModal(p => ({ ...p, isOpen: false }))}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
          >
            閉じる
          </button>
        </div>
      </Modal>

      {/* Log Modal */}
      <Modal
        // [FIX] isOpenをIDの有無で判定
        isOpen={logScenarioId !== null}
        // [FIX] onCloseでIDをクリア
        onClose={() => setLogScenarioId(null)}
        className="max-w-3xl w-full h-[75vh] flex flex-col p-0 rounded-3xl ring-4 ring-white/50"
      >
        {/* [FIX] 導出された最新のシナリオオブジェクトを使用 */}
        {scenarioToView && (
          <div className="flex flex-col h-full">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl">
              <div className="flex items-center">
                <div className="mr-4">
                  {scenarioToView.status === 'RUNNING' ? (
                    <Loader2 className="w-8 h-8 text-status-process animate-spin" />
                  ) : scenarioToView.status === 'COMPLETE' ? (
                    <CheckCircle className="w-8 h-8 text-status-success" />
                  ) : scenarioToView.status === 'FAIL' ? (
                    <AlertCircle className="w-8 h-8 text-status-fail" />
                  ) : (
                    <Clock className="w-8 h-8 text-status-ready" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">実行詳細ログ</h3>
                  <p className="text-sm text-gray-400 font-mono mt-1 font-medium">
                    {scenarioToView.uniqueId}
                  </p>
                </div>
              </div>
              <button
                // [FIX] onCloseでIDをクリア
                onClick={() => setLogScenarioId(null)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-bold text-gray-500">進捗</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-300 shadow-sm ${
                    scenarioToView.status === 'FAIL' ? 'bg-status-fail' : 'bg-primary-indigo'
                  }`}
                  style={{
                    width:
                      // [修正] READY/PENDING/CALCULATING は 0% に、RUNNING は 45% を表示する
                      scenarioToView.status === 'COMPLETE'
                        ? '100%'
                        : ['READY', 'PENDING', 'CALCULATING'].includes(scenarioToView.status)
                          ? '0%'
                          : scenarioToView.status === 'FAIL'
                            ? '80%' // 失敗時も進捗が途中であることを示すために残す
                            : scenarioToView.status === 'RUNNING'
                              ? '45%' // 実行中は中間値（モック）
                              : '0%', // その他の場合は0%
                  }}
                ></div>
              </div>
            </div>
            <LogViewer
              logs={scenarioToView.logs || []}
              className="flex-1 m-0 rounded-none border-x-0 bg-gray-900 font-mono text-sm text-gray-300 leading-relaxed"
            />
            <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end rounded-b-3xl">
              <button
                // [FIX] onCloseでIDをクリア
                onClick={() => setLogScenarioId(null)}
                className="px-6 py-2.5 bg-white border-2 border-gray-100 hover:border-gray-300 text-gray-600 font-bold rounded-xl transition-colors shadow-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExperimentLayer;

import React, { useState } from 'react';
import type { ExperimentScenario } from '@/entities/scenario';
import { AlertCircle, ArrowLeft, TestTube } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useResizerPanel } from '@/shared/lib/hooks/useResizerPanel';
import { useGlobalStore } from '@/shared/store/useGlobalStore';

// Components
import { PresetSidePanel } from '@/features/experiment/components/PresetSidePanel';
import { ResultsBottomPanel } from '@/features/experiment/components/ResultsBottomPanel';
import { ExperimentConfigForm } from '@/features/experiment/components/ExperimentConfigForm';
import { useExperimentConfig } from '@/features/experiment/hooks/useExperimentConfig';

interface ExperimentLayerProps {
  onLogClick: (scenario: ExperimentScenario) => void;
}

const ExperimentLayer: React.FC<ExperimentLayerProps> = ({ onLogClick }) => {
  const {
    users,
    presets,
    deployedNodeCount,
    registerResult,
    savePreset,
    deletePreset,
    addToast,
    execution,
  } = useGlobalStore();

  // --- UI States ---
  const [isPresetPanelOpen, setIsPresetPanelOpen] = useState(true);
  const [newPresetName, setNewPresetName] = useState('');

  // Modal States
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; id: string; reason: string }>({
    isOpen: false,
    id: '',
    reason: '',
  });

  // --- Custom Hooks ---
  const config = useExperimentConfig();

  // Bottom Panel Resizer (初期高さ 550px)
  const bottomPanel = useResizerPanel(550, 100, 0.8);

  // --- Calculations ---
  const successCount = execution.scenarios.filter(c => ['COMPLETE'].includes(c.status)).length;
  const failCount = execution.scenarios.filter(c => ['FAIL'].includes(c.status)).length;
  const pendingCount = execution.scenarios.filter(c =>
    ['PENDING', 'CALCULATING', 'READY', 'RUNNING'].includes(c.status)
  ).length;
  const totalCost = execution.scenarios.reduce((acc, cur) => acc + (cur.cost || 0), 0).toFixed(2);

  // --- Handlers ---
  const handleGenerateClick = () => {
    const state = config.getCurrentState();
    execution.generateScenarios({
      ...state,
      users,
      setIsOpen: bottomPanel.setIsOpen,
    });
  };

  const onSaveClick = () => {
    config.handleSavePreset(newPresetName);
    setNewPresetName('');
  };

  return (
    <div className="flex h-full w-full overflow-hidden relative text-gray-800">
      <div className="flex w-full h-full relative">
        <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar pb-32">
            <PageHeader
              title="Experiment Configuration"
              description="実験シナリオのパラメータ設定と実行、バッチ処理の管理"
              icon={TestTube}
              iconColor="text-scenario-accent"
            />

            <ExperimentConfigForm
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
              nodes={config.nodes}
              chainMode={config.chainMode}
              setChainMode={config.setChainMode}
              chainRangeParams={config.chainRangeParams}
              setChainRangeParams={config.setChainRangeParams}
              selectedAllocators={config.selectedAllocators}
              setSelectedAllocators={config.setSelectedAllocators}
              selectedTransmitters={config.selectedTransmitters}
              setSelectedTransmitters={config.setSelectedTransmitters}
              isGenerating={execution.isGenerating}
              onGenerate={handleGenerateClick}
            />

            <div className="h-[80px] w-full pointer-events-none" aria-hidden="true" />
          </div>

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
            pendingCount={pendingCount}
            isExecutionRunning={execution.isExecutionRunning}
            onRecalculateAll={() => execution.recalculateAll(users)}
            onExecute={() => execution.executeScenarios(config.projectName)}
            onErrorClick={(id, reason) => setErrorModal({ isOpen: true, id, reason })}
            onLogClick={onLogClick}
            onRemoveScenario={execution.removeScenario}
            onClearAllScenarios={execution.clearAllScenarios}
          />

          <button
            onClick={() => setIsPresetPanelOpen(true)}
            className={`absolute top-4 right-0 bg-white border border-gray-200 shadow-lg rounded-l-xl p-3 text-scenario-accent hover:bg-orange-50 transition-all z-20 ${
              isPresetPanelOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <PresetSidePanel
          isOpen={isPresetPanelOpen}
          onClose={() => setIsPresetPanelOpen(false)}
          presets={presets}
          newPresetName={newPresetName}
          setNewPresetName={setNewPresetName}
          onSave={onSaveClick}
          onLoad={config.loadPreset}
          onDelete={deletePreset}
          deployedNodeCount={deployedNodeCount}
        />
      </div>

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
    </div>
  );
};

export default ExperimentLayer;

// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/App.tsx

import React, { useState, useMemo } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import DeploymentLayer from './features/deployment';
import EconomyLayer from './features/economy';
import { useEconomyManagement } from './features/economy/hooks/useEconomyManagement';
import ExperimentLayer from './features/experiment';
import { useScenarioExecution } from './features/experiment/hooks/useScenarioExecution';
import LibraryLayer from './features/library';
import MonitoringLayer from './features/monitoring';
import PresetLayer from './features/preset';
import { useNotification } from './hooks/useNotification';
import { api } from './services/api';
import {
  AppLayer,
  ExperimentConfig,
  ExperimentPreset,
  ExperimentResult,
  ExperimentScenario,
  MonitoringUpdate,
} from './types';
import { Modal } from './components/ui/Modal';
import { LogViewer } from './components/ui/LogViewer';
import { Loader2, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';

const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<AppLayer>(AppLayer.MONITORING);

  const [deployedNodeCount, setDeployedNodeCount] = useState<number>(5);
  const [isDockerBuilt, setIsDockerBuilt] = useState<boolean>(false);

  // Base Feeの状態管理 (拡張: next, average)
  const [baseFeeInfo, setBaseFeeInfo] = useState<{
    current: number;
    change: number;
    next: number;
    average: number;
  } | null>(null);

  // WebSocketからBase Feeのモニタリングデータを受信
  useWebSocket<MonitoringUpdate>('/ws/monitoring', data => {
    if (data.currentBaseFee !== undefined) {
      setBaseFeeInfo({
        current: data.currentBaseFee,
        change: data.baseFeeChangeRatio || 0,
        next: data.nextBaseFee || data.currentBaseFee,
        average: data.averageBaseFee || data.currentBaseFee,
      });
    }
    // MonitoringLayerと重複するが、ここではBaseFee取得に特化し、他はLayerに任せる
    setDeployedNodeCount(data.deployedCount);
  });

  const {
    toasts,
    notifications,
    isNotificationOpen,
    setIsNotificationOpen,
    notificationRef,
    addToast,
    clearNotifications,
  } = useNotification();

  const {
    users,
    systemAccounts,
    handleCreateUser,
    handleDeleteUser,
    handleFaucet,
    refresh: refreshEconomy,
  } = useEconomyManagement(deployedNodeCount, addToast);

  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [presets, setPresets] = useState<ExperimentPreset[]>([]);

  const [logScenarioId, setLogScenarioId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resResults, resPresets] = await Promise.all([
        api.library.getResults(),
        api.preset.getAll(),
      ]);
      setResults(resResults);
      setPresets(resPresets);
    } catch (e) {
      console.error('Failed to load initial data', e);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [activeLayer]);

  const handleSavePreset = async (name: string, config: ExperimentConfig, generatorState?: any) => {
    const existing = presets.find(s => s.name === name);
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
      loadData();
    } catch (e) {
      addToast('error', '保存エラー', 'プリセットの保存に失敗しました。');
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await api.preset.delete(id);
      addToast('success', '削除完了', 'プリセットを削除しました。');
      loadData();
    } catch (e) {
      addToast('error', '削除エラー', 'プリセットの削除に失敗しました。');
    }
  };

  const handleDeleteResult = (id: string) => {
    api.library.deleteResult(id).then(() => {
      setResults(results.filter(r => r.id !== id));
      addToast('success', '削除完了', '実験結果ログを削除しました。');
    });
  };
  const handleRegisterResult = (result: ExperimentResult) => setResults(prev => [result, ...prev]);

  const execution = useScenarioExecution(addToast, handleRegisterResult, refreshEconomy);

  const handleLogClick = (scenario: ExperimentScenario) => {
    setLogScenarioId(scenario.uniqueId);
  };

  const scenarioToView = useMemo(() => {
    if (!logScenarioId) return null;
    return execution.scenarios.find(s => s.uniqueId === logScenarioId) || null;
  }, [logScenarioId, execution.scenarios]);

  return (
    <>
      <MainLayout
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        deployedNodeCount={deployedNodeCount}
        notifications={notifications}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        clearNotifications={clearNotifications}
        notificationRef={notificationRef}
        toasts={toasts}
        isExecutionRunning={execution.isExecutionRunning}
        execution={execution}
        onLogClick={handleLogClick}
        users={users}
        baseFeeInfo={baseFeeInfo}
      >
        {(activeLayer === AppLayer.MONITORING || activeLayer === AppLayer.EXPERIMENT) && (
          <div className="absolute inset-0 overflow-hidden">
            {activeLayer === AppLayer.MONITORING && (
              <MonitoringLayer setDeployedNodeCount={setDeployedNodeCount} />
            )}
            {activeLayer === AppLayer.EXPERIMENT && (
              <ExperimentLayer
                users={users}
                presets={presets}
                deployedNodeCount={deployedNodeCount}
                onRegisterResult={handleRegisterResult}
                onSavePreset={handleSavePreset}
                notify={addToast}
                onDeletePreset={handleDeletePreset}
                execution={execution}
                onLogClick={handleLogClick}
              />
            )}
          </div>
        )}

        {!(activeLayer === AppLayer.MONITORING || activeLayer === AppLayer.EXPERIMENT) && (
          <div className="h-full w-full p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
            <div className="max-w-[1600px] mx-auto min-h-full flex flex-col">
              {activeLayer === AppLayer.DEPLOYMENT && (
                <DeploymentLayer
                  setDeployedNodeCount={setDeployedNodeCount}
                  deployedNodeCount={deployedNodeCount}
                  setIsDockerBuilt={setIsDockerBuilt}
                  isDockerBuilt={isDockerBuilt}
                />
              )}

              {activeLayer === AppLayer.ECONOMY && (
                <EconomyLayer
                  users={users}
                  systemAccounts={systemAccounts}
                  onCreateUser={handleCreateUser}
                  onDeleteUser={handleDeleteUser}
                  onFaucet={handleFaucet}
                />
              )}

              {activeLayer === AppLayer.PRESET && (
                <PresetLayer presets={presets} onDeletePreset={handleDeletePreset} />
              )}

              {activeLayer === AppLayer.LIBRARY && (
                <LibraryLayer results={results} onDeleteResult={handleDeleteResult} />
              )}
            </div>
          </div>
        )}
      </MainLayout>

      {/* --- Global Log Modal --- */}
      <Modal
        isOpen={logScenarioId !== null}
        onClose={() => setLogScenarioId(null)}
        className="max-w-3xl w-full h-[75vh] flex flex-col p-0 rounded-3xl ring-4 ring-white/50"
      >
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
                      scenarioToView.status === 'COMPLETE'
                        ? '100%'
                        : ['READY', 'PENDING', 'CALCULATING'].includes(scenarioToView.status)
                          ? '0%'
                          : scenarioToView.status === 'FAIL'
                            ? '80%'
                            : scenarioToView.status === 'RUNNING'
                              ? '45%'
                              : '0%',
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
                onClick={() => setLogScenarioId(null)}
                className="px-6 py-2.5 bg-white border-2 border-gray-100 hover:border-gray-300 text-gray-600 font-bold rounded-xl transition-colors shadow-sm"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default App;

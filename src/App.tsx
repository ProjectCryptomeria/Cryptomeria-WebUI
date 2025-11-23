import React, { useState, useMemo, useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import DeploymentLayer from './features/deployment';
import EconomyLayer from './features/economy';
import ExperimentLayer from './features/experiment';
import LibraryLayer from './features/library';
import MonitoringLayer from './features/monitoring';
import PresetLayer from './features/preset';
import { AppLayer, ExperimentScenario, MonitoringUpdate } from './types';
import { Modal } from './components/ui/Modal';
import { LogViewer } from './components/ui/LogViewer';
import { Loader2, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import { useGlobalStore } from './stores/useGlobalStore';

const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<AppLayer>(AppLayer.MONITORING);

  const { setDeployedNodeCount, setBaseFeeInfo, loadData, execution } = useGlobalStore();

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
    setDeployedNodeCount(data.deployedCount);
  });

  useEffect(() => {
    loadData();
  }, [activeLayer]); // Reload data when layer changes (or just once on mount if preferred, but original had dependency)

  const [logScenarioId, setLogScenarioId] = useState<string | null>(null);

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
        onLogClick={handleLogClick}
      >
        {(activeLayer === AppLayer.MONITORING || activeLayer === AppLayer.EXPERIMENT) && (
          <div className="absolute inset-0 overflow-hidden">
            {activeLayer === AppLayer.MONITORING && <MonitoringLayer />}
            {activeLayer === AppLayer.EXPERIMENT && <ExperimentLayer onLogClick={handleLogClick} />}
          </div>
        )}

        {!(activeLayer === AppLayer.MONITORING || activeLayer === AppLayer.EXPERIMENT) && (
          <div className="h-full w-full p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
            <div className="max-w-[1600px] mx-auto min-h-full flex flex-col">
              {activeLayer === AppLayer.DEPLOYMENT && <DeploymentLayer />}

              {activeLayer === AppLayer.ECONOMY && <EconomyLayer />}

              {activeLayer === AppLayer.PRESET && <PresetLayer />}

              {activeLayer === AppLayer.LIBRARY && <LibraryLayer />}
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

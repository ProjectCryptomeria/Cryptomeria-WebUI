// app/index - アプリケーションのエントリーポイント

import React, { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '../widgets/layout';
import { LogModal } from '../widgets/log-modal';
import MonitoringPage from '../pages/monitoring';
import DeploymentPage from '../pages/deployment';
import EconomyPage from '../pages/economy';
import ExperimentPage from '../pages/experiment';
import PresetPage from '../pages/preset';
import LibraryPage from '../pages/library';
import { AppLayer } from '../shared/types';
import type { ExperimentScenario } from '../entities/scenario';
import type { MonitoringUpdate } from '../entities/node';
import { useWebSocket } from '../shared/lib/hooks/useWebSocket';
import { useGlobalStore } from '../shared/store/useGlobalStore';

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
  }, [activeLayer]);

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
            {activeLayer === AppLayer.MONITORING && <MonitoringPage />}
            {activeLayer === AppLayer.EXPERIMENT && <ExperimentPage onLogClick={handleLogClick} />}
          </div>
        )}

        {!(activeLayer === AppLayer.MONITORING || activeLayer === AppLayer.EXPERIMENT) && (
          <div className="h-full w-full p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
            <div className="max-w-[1600px] mx-auto min-h-full flex flex-col">
              {activeLayer === AppLayer.DEPLOYMENT && <DeploymentPage />}

              {activeLayer === AppLayer.ECONOMY && <EconomyPage />}

              {activeLayer === AppLayer.PRESET && <PresetPage />}

              {activeLayer === AppLayer.LIBRARY && <LibraryPage />}
            </div>
          </div>
        )}
      </MainLayout>

      <LogModal
        scenario={scenarioToView}
        isOpen={logScenarioId !== null}
        onClose={() => setLogScenarioId(null)}
      />
    </>
  );
};

export default App;

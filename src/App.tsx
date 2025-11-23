// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/App.tsx

import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import DeploymentLayer from './features/deployment';
import EconomyLayer from './features/economy';
import { useEconomyManagement } from './features/economy/hooks/useEconomyManagement';
import ExperimentLayer from './features/experiment';
import LibraryLayer from './features/library';
import MonitoringLayer from './features/monitoring';
import PresetLayer from './features/preset';
import { useNotification } from './hooks/useNotification';
import { api } from './services/api';
import { AppLayer, ExperimentConfig, ExperimentPreset, ExperimentResult } from './types';

const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<AppLayer>(AppLayer.MONITORING);

  // NOTE: deployedNodeCount is now synced from MonitoringLayer via WS
  const [deployedNodeCount, setDeployedNodeCount] = useState<number>(5);
  const [isDockerBuilt, setIsDockerBuilt] = useState<boolean>(false);

  const {
    toasts,
    notifications,
    isNotificationOpen,
    setIsNotificationOpen,
    notificationRef,
    addToast,
    clearNotifications,
  } = useNotification();
  const { users, systemAccounts, handleCreateUser, handleDeleteUser, handleFaucet } =
    useEconomyManagement(deployedNodeCount, addToast);

  // Library & Presets
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [presets, setPresets] = useState<ExperimentPreset[]>([]);

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
  }, [activeLayer]); // Refresh when switching tabs

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
      addToast('success', 'Saved', `Preset "${name}" ${existing ? 'updated' : 'created'}.`);
      loadData();
    } catch (e) {
      addToast('error', 'Error', 'Failed to save preset');
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await api.preset.delete(id);
      addToast('success', 'Deleted', 'Preset removed.');
      loadData();
    } catch (e) {
      addToast('error', 'Error', 'Failed to delete preset');
    }
  };

  const handleDeleteResult = (id: string) => {
    api.library.deleteResult(id).then(() => {
      setResults(results.filter(r => r.id !== id));
      addToast('success', 'Deleted', 'Result log removed.');
    });
  };
  const handleRegisterResult = (result: ExperimentResult) => setResults(prev => [result, ...prev]);

  return (
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
  );
};

export default App;

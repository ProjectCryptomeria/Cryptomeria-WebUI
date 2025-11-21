import React, { useState, useEffect } from 'react';
import { AppLayer, ExperimentResult, ExperimentConfig, ExperimentPreset } from './types';
import { MainLayout } from './components/layout/MainLayout';
import { MonitoringPage } from './features/monitoring/MonitoringPage';
import { DeploymentPage } from './features/deployment/DeploymentPage';
import { EconomyPage } from './features/economy/EconomyPage';
import { ExperimentPage } from './features/experiment/ExperimentPage';
import { PresetPage } from './features/preset/PresetPage';
import { LibraryPage } from './features/library/LibraryPage';
import { useNotification } from './hooks/useNotification';
import { useEconomyManagement } from './features/economy/hooks/useEconomyManagement';
import { generateMockPresets } from './services/mockData';
import { api } from './services/api';

const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<AppLayer>(AppLayer.MONITORING);
  const [deployedNodeCount, setDeployedNodeCount] = useState<number>(5);
  const [isDockerBuilt, setIsDockerBuilt] = useState<boolean>(false);

  const notificationData = useNotification();
  const { addToast } = notificationData;
  const { users, systemAccounts, handleCreateUser, handleDeleteUser, handleFaucet } = useEconomyManagement(deployedNodeCount, addToast);

  const [results, setResults] = useState<ExperimentResult[]>([]);
  useEffect(() => { api.library.getResults().then(setResults); }, [activeLayer]);

  const [presets, setPresets] = useState<ExperimentPreset[]>(generateMockPresets());
  const handleSavePreset = (name: string, config: ExperimentConfig, generatorState?: any) => {
      const existingIndex = presets.findIndex(s => s.name === name);
      const newPreset: ExperimentPreset = { id: existingIndex >= 0 ? presets[existingIndex].id : crypto.randomUUID(), name, config, generatorState, lastModified: new Date().toISOString() };
      if (existingIndex >= 0) { const next = [...presets]; next[existingIndex] = newPreset; setPresets(next); addToast('success', 'Saved', `Preset "${name}" updated.`); } else { setPresets([...presets, newPreset]); addToast('success', 'Saved', `Preset "${name}" created.`); }
  };
  const handleDeletePreset = (id: string) => { setPresets(prev => prev.filter(s => s.id !== id)); addToast('success', 'Deleted', 'Preset removed.'); };
  const handleDeleteResult = (id: string) => { api.library.deleteResult(id).then(() => { setResults(results.filter(r => r.id !== id)); addToast('success', 'Deleted', 'Result log removed.'); }); };
  const handleRegisterResult = (result: ExperimentResult) => setResults(prev => [result, ...prev]);

  return (
    <MainLayout activeLayer={activeLayer} setActiveLayer={setActiveLayer} deployedNodeCount={deployedNodeCount} notificationData={notificationData}>
        <div className="absolute inset-0 overflow-hidden">
           {activeLayer === AppLayer.MONITORING && <MonitoringPage setDeployedNodeCount={setDeployedNodeCount} />}
           {activeLayer === AppLayer.EXPERIMENT && <ExperimentPage users={users} presets={presets} deployedNodeCount={deployedNodeCount} onRegisterResult={handleRegisterResult} onSavePreset={handleSavePreset} notify={addToast} onDeletePreset={handleDeletePreset} />}
        </div>
        {!(activeLayer === AppLayer.MONITORING || activeLayer === AppLayer.EXPERIMENT) && (
            <div className="h-full w-full p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-slate-50/50">
                <div className="max-w-[1600px] mx-auto min-h-full flex flex-col">
                    {activeLayer === AppLayer.DEPLOYMENT && <DeploymentPage setDeployedNodeCount={setDeployedNodeCount} deployedNodeCount={deployedNodeCount} setIsDockerBuilt={setIsDockerBuilt} isDockerBuilt={isDockerBuilt} />}
                    {activeLayer === AppLayer.ECONOMY && <EconomyPage users={users} systemAccounts={systemAccounts} onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser} onFaucet={handleFaucet} />}
                    {activeLayer === AppLayer.PRESET && <PresetPage presets={presets} onDeletePreset={handleDeletePreset} />}
                    {activeLayer === AppLayer.LIBRARY && <LibraryPage results={results} onDeleteResult={handleDeleteResult} />}
                </div>
            </div>
        )}
    </MainLayout>
  );
};

export default App;
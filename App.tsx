import React, { useState } from 'react';
import { AppLayer, ExperimentResult, ExperimentConfig, ExperimentPreset } from './src/types';
import { generateMockPresets } from './src/services/mockData';
import MonitoringLayer from './src/features/monitoring';
import DeploymentLayer from './src/features/deployment';
import EconomyLayer from './src/features/economy';
import ExperimentLayer from './src/features/experiment';
import LibraryLayer from './src/features/library';
import PresetLayer from './src/features/preset';
import { useEconomyManagement, useNotification } from './src/hooks';
import { api } from './src/services/api';
import { MainLayout } from './src/components/layout/MainLayout';

const App: React.FC = () => {
    const [activeLayer, setActiveLayer] = useState<AppLayer>(AppLayer.MONITORING);

    // NOTE: deployedNodeCount is now synced from MonitoringLayer via WS
    const [deployedNodeCount, setDeployedNodeCount] = useState<number>(5);
    const [isDockerBuilt, setIsDockerBuilt] = useState<boolean>(false);

    const { toasts, notifications, isNotificationOpen, setIsNotificationOpen, notificationRef, addToast, clearNotifications } = useNotification();
    const { users, systemAccounts, handleCreateUser, handleDeleteUser, handleFaucet } = useEconomyManagement(deployedNodeCount, addToast);

    // Library & Presets
    const [results, setResults] = useState<ExperimentResult[]>([]);
    React.useEffect(() => {
        api.library.getResults().then(setResults);
    }, [activeLayer]); // Refresh when switching tabs

    const [presets, setPresets] = useState<ExperimentPreset[]>(generateMockPresets());

    const handleSavePreset = (name: string, config: ExperimentConfig, generatorState?: any) => {
        const existingIndex = presets.findIndex(s => s.name === name);
        const newPreset: ExperimentPreset = {
            id: existingIndex >= 0 ? presets[existingIndex].id : crypto.randomUUID(),
            name, config, generatorState, lastModified: new Date().toISOString()
        };
        if (existingIndex >= 0) {
            const next = [...presets]; next[existingIndex] = newPreset; setPresets(next);
            addToast('success', 'Saved', `Preset "${name}" updated.`);
        } else {
            setPresets([...presets, newPreset]);
            addToast('success', 'Saved', `Preset "${name}" created.`);
        }
    };

    const handleDeletePreset = (id: string) => { setPresets(prev => prev.filter(s => s.id !== id)); addToast('success', 'Deleted', 'Preset removed.'); };
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
                    {activeLayer === AppLayer.MONITORING && <MonitoringLayer setDeployedNodeCount={setDeployedNodeCount} />}
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
                            <PresetLayer
                                presets={presets}
                                onDeletePreset={handleDeletePreset}
                            />
                        )}

                        {activeLayer === AppLayer.LIBRARY && <LibraryLayer results={results} onDeleteResult={handleDeleteResult} />}
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default App;
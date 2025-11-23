// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/app/index.tsx
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
import type {
  ExperimentScenario,
  ScenarioStatus,
  ExecutionResultDetails,
} from '../entities/scenario'; // 必要な型をインポート
import type { MonitoringUpdate } from '../entities/node';
import type { ExperimentResult } from '../entities/result'; // 必要な型をインポート
import { useWebSocket } from '../shared/lib/hooks/useWebSocket';
import { useGlobalStore } from '../shared/store';

// 進捗通知の型を定義
interface ProgressMessage {
  executionId: string;
  scenarioId?: number; // Scenario.id (number)
  status?: ScenarioStatus;
  log?: string;
  type?: 'ALL_COMPLETE'; // 全実行完了シグナル
  resultDetails?: ExecutionResultDetails & { result?: ExperimentResult }; // 結果詳細とLibraryへの登録データ
}

const App: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<AppLayer>(AppLayer.MONITORING);

  // ★ 修正: execution オブジェクトを分割して updateScenario, updateExecutionStatus を取得
  const { setDeployedNodeCount, setBaseFeeInfo, loadData, execution, addToast } = useGlobalStore();

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

  // ★ 追加: 実験進捗WebSocketリスナー
  useWebSocket<ProgressMessage>('/ws/experiment/progress', data => {
    const { executionId, scenarioId, type, status, log, resultDetails } = data;

    if (type === 'ALL_COMPLETE') {
      execution.updateExecutionStatus(false);
      // addToast は updateScenario 内で呼ばれるため、ここでは不要
      return;
    }

    if (scenarioId !== undefined) {
      // uniqueId を使用してシナリオを特定する必要がある
      // MockServer.ts の実装に基づき、ここでは scenarioId (number) から uniqueId を見つける
      const scenario = execution.scenarios.find(s => s.id === scenarioId);
      if (!scenario) return;

      const updates: any = {};
      if (status) updates.status = status;
      if (log) updates.log = log;

      const isComplete = status === 'COMPLETE' || status === 'FAIL';

      if (isComplete) {
        // 完了時に必要な詳細データを渡す
        execution.updateScenario(
          scenario.uniqueId,
          {
            status: status as ScenarioStatus,
            log: log,
            resultDetails: resultDetails,
          },
          true
        );
      } else if (status || log) {
        // 実行中またはログの追加
        execution.updateScenario(scenario.uniqueId, updates);
      }
    }
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

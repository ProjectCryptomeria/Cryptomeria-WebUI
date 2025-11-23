import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useGlobalStore } from '../../../stores/useGlobalStore';

/**
 * デプロイメント制御のためのHook
 * Dockerビルド、ノードのスケーリング、クラスタのリセットを管理します
 */
export const useDeploymentControl = () => {
  const { deployedNodeCount, setDeployedNodeCount, setIsDockerBuilt } = useGlobalStore();
  const [scaleCount, setScaleCount] = useState(deployedNodeCount);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Sync local scale count when prop updates (from monitoring source of truth)
  useEffect(() => {
    setScaleCount(deployedNodeCount);
  }, [deployedNodeCount]);

  // Listen for logs
  useWebSocket<{ jobId: string; type: string; message?: string }>('/ws/deployment/logs', data => {
    if (data.jobId === activeJobId) {
      if (data.type === 'log' && data.message) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${data.message}`]);
      } else if (data.type === 'complete') {
        setIsBuilding(false);
        setIsDockerBuilt(true);
      }
    }
  });

  const handleBuild = async () => {
    if (isBuilding) return;
    setLogs([]);
    setIsBuilding(true);
    const res = await api.deployment.build();
    setActiveJobId(res.jobId);
  };

  const handleDeploy = async () => {
    if (isDeploying) return;
    setLogs(prev => [...prev, '>> Initiating Helm Upgrade...']);
    setIsDeploying(true);
    await api.deployment.scale(scaleCount);
    // Note: In a real app we'd wait for pod ready via WS, here we assume API returns when accepted
    setDeployedNodeCount(scaleCount);
    setLogs(prev => [...prev, '>> Deployment request accepted.']);
    setIsDeploying(false);
  };

  const handleReset = async () => {
    setLogs([]);
    await api.deployment.reset();
    setIsDockerBuilt(false);
    setDeployedNodeCount(0);
  };

  return {
    scaleCount,
    setScaleCount,
    isBuilding,
    isDeploying,
    logs,
    handleBuild,
    handleDeploy,
    handleReset,
  };
};

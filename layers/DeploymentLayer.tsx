
import React, { useState, useEffect } from 'react';
import { Play, Trash2, Layers, CheckCircle2, Server, AlertTriangle } from 'lucide-react';
import { MOCK_INITIAL_LOGS } from '../constants';
import { Card, LogViewer, Badge } from '../components/Shared';

interface DeploymentLayerProps {
    setDeployedNodeCount: (count: number) => void;
    deployedNodeCount: number;
    setIsDockerBuilt: (isBuilt: boolean) => void;
    isDockerBuilt: boolean;
}

const DeploymentLayer: React.FC<DeploymentLayerProps> = ({ setDeployedNodeCount, deployedNodeCount, setIsDockerBuilt, isDockerBuilt }) => {
  const [scaleCount, setScaleCount] = useState(deployedNodeCount);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>(MOCK_INITIAL_LOGS);

  useEffect(() => { setScaleCount(deployedNodeCount); }, [deployedNodeCount]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('ja-JP')}] ${msg}`]);

  const handleBuild = () => {
    if (isBuilding) return;
    setLogs([]); setIsBuilding(true);
    addLog(">> Starting Docker Build for targets: [DataChain, MetaChain]...");
    let step = 0;
    const interval = setInterval(() => {
        step++;
        if (step === 1) addLog("Building context: 124.5MB transferred.");
        if (step === 2) addLog("Step 1/5 : FROM golang:1.22-alpine as builder");
        if (step === 3) addLog("Step 2/5 : WORKDIR /app");
        if (step === 4) addLog("Step 3/5 : COPY . .");
        if (step === 5) addLog("Step 4/5 : RUN go build -o datachain ./cmd/datachain");
        if (step === 6) {
            addLog("Successfully built image 'raidchain/node:latest'");
            setIsBuilding(false); setIsDockerBuilt(true); clearInterval(interval);
        }
    }, 800);
  };

  const handleDeploy = () => {
    if (isDeploying) return;
    setLogs([]); setIsDeploying(true);
    addLog(`>> Starting Helm Upgrade (Scale: ${scaleCount})...`);
    setTimeout(() => {
        addLog("Release \"raidchain-core\" does not exist. Installing it now.");
        addLog("Manifest rendered. Applying to namespace 'default'.");
        addLog(`[K8s] Service/datachain-svc created.`);
        for(let i=0; i<scaleCount; i++) setTimeout(() => addLog(`[K8s] Pod/datachain-${i} scheduled.`), i * 500);
        setTimeout(() => {
             addLog(">> Deployment Sync Completed. System Healthy.");
             setDeployedNodeCount(scaleCount); setIsDeploying(false);
        }, scaleCount * 500 + 1000);
    }, 1000);
  };

  const handleReset = () => {
      if(!window.confirm("本当に環境を全削除しますか？\n(PVCを含むすべてのデータが破棄されます)")) return;
      setLogs([]); addLog(">> Executing Helm Uninstall..."); addLog("Removing PVCs..."); addLog("Cleaned up resources.");
      setIsDockerBuilt(false); setDeployedNodeCount(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      <div className="space-y-6">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-200">システムステータス: 稼働中</h4>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>K8sクラスタ接続済み
                        </div>
                    </div>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-700">
                     <div>NS: default</div><div>SC: standard</div>
                </div>
            </div>
        </div>

        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-lg">
                <Layers className="w-5 h-5 text-indigo-600" /> イメージビルド
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ターゲット</label>
                    <div className="flex gap-2 flex-wrap">
                        {['DataChain', 'MetaChain', 'Relayer'].map(t => (
                            <label key={t} className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                                <span className="text-sm">{t}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <button onClick={handleBuild} disabled={isBuilding} className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-all ${isBuilding ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'}`}>
                    {isBuilding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" />} Dockerイメージ作成
                </button>
                {isDockerBuilt && <Badge color="green" className="flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> ビルド済み (raidchain/node:latest)</Badge>}
            </div>
        </Card>

        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-lg">
                <Server className="w-5 h-5 text-emerald-600" /> クラスタデプロイ
            </div>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">DataChain ノード数</label>
                        <span className="text-sm font-bold text-emerald-600">{scaleCount} Nodes</span>
                    </div>
                    <input type="range" min="1" max="10" step="1" value={scaleCount} onChange={(e) => setScaleCount(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                    <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1</span><span>5</span><span>10</span></div>
                </div>

                {!isDockerBuilt && (
                    <div className="text-xs bg-orange-50 text-orange-600 p-3 rounded border border-orange-100 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> 先にDockerイメージをビルドしてください。
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleDeploy} disabled={isDeploying || isBuilding || !isDockerBuilt} className={`col-span-2 py-3 rounded-lg font-medium shadow-md transition-all flex items-center justify-center gap-2 ${isDeploying || isBuilding || !isDockerBuilt ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                       {isDeploying ? 'デプロイ中...' : 'Helmで適用'}
                    </button>
                    <button onClick={handleReset} className="col-span-2 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                        <Trash2 className="w-3 h-3" /> 環境をリセット
                    </button>
                </div>
            </div>
        </Card>
      </div>

      <LogViewer logs={logs} title="webui-controller-terminal" className="lg:col-span-2" />
    </div>
  );
};

export default DeploymentLayer;

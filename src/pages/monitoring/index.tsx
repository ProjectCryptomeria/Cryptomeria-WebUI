// pages/monitoring - ネットワーク監視ページ

import React, { useState } from 'react';
import TopologyGraph from '@/features/monitoring/components/TopologyGraph';
import type { NodeStatus, MonitoringUpdate } from '@/entities/node';
import { Activity, Zap, ChevronLeft, Monitor, X } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { PageHeader } from '@/shared/ui/PageHeader';
import { BottomPanel } from '@/shared/ui/BottomPanel';
import { MempoolChart } from '@/features/monitoring/components/MempoolChart';
import { useResizerPanel } from '@/shared/lib/hooks/useResizerPanel';
import { useWebSocket } from '@/shared/lib/hooks/useWebSocket';
import { useGlobalStore } from '@/shared/store';

const MonitoringLayer: React.FC = () => {
  const { setDeployedNodeCount } = useGlobalStore();
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [mempoolData, setMempoolData] = useState<any[]>([]);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // isTransitioning を追加で受け取る
  const { isOpen, setIsOpen, height, panelRef, resizerRef, isDragging, isTransitioning } =
    useResizerPanel(550, 100, 0.8);

  useWebSocket<MonitoringUpdate>('/ws/monitoring', data => {
    setNodes(data.nodes);
    setMempoolData(data.mempool);
    setTimeout(() => {
      setDeployedNodeCount(data.deployedCount);
    }, 0);
  });

  return (
    <div className="flex h-full w-full overflow-hidden relative text-slate-800">
      <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
        <div className="p-6 flex-shrink-0">
          <PageHeader
            title="Network Monitoring"
            description="リアルタイムのネットワークトポロジーとノードの状態監視"
            icon={Activity}
            iconColor="text-blue-500"
            action={
              <div className="flex items-center gap-2">
                <Badge
                  color="green"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Nodes: {nodes.filter(n => n.status === 'active').length}
                </Badge>
              </div>
            }
          />
        </div>

        <div className="flex-1 p-6 pt-0 pb-32 flex items-center justify-center overflow-hidden">
          <TopologyGraph nodes={nodes} />
        </div>

        <button
          onClick={() => setIsSidePanelOpen(true)}
          className={`absolute top-6 right-0 bg-white border border-slate-200 shadow-lg rounded-l-xl p-3 text-slate-500 hover:bg-slate-50 transition-all z-20 ${isSidePanelOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <BottomPanel
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          height={height}
          panelRef={panelRef}
          resizerRef={resizerRef}
          title="Mempool Status"
          description="各DataChainにおける未処理TXの滞留数"
          icon={Zap}
        >
          <div className="flex-1 p-6 bg-slate-50/50 overflow-hidden flex flex-col h-full">
            {/* ドラッグ中 OR アニメーション中は再描画を抑制する */}
            <MempoolChart data={mempoolData} isResizing={isDragging || isTransitioning} />
          </div>
        </BottomPanel>
      </div>

      <div
        className={`flex-shrink-0 border-l border-slate-200 bg-white relative z-20 transition-all duration-300 overflow-hidden flex flex-col ${isSidePanelOpen ? 'w-96' : 'w-0'}`}
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-slate-700 flex items-center text-lg">
            <Monitor className="w-5 h-5 mr-2 text-slate-500" />
            Node Registry
          </h2>
          <button
            onClick={() => setIsSidePanelOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 space-y-3">
          {nodes.map(node => (
            <div
              key={node.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${node.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}
                  />
                  <span className="font-mono font-bold text-sm text-slate-800">{node.id}</span>
                </div>
                <Badge
                  color={
                    node.type === 'control' ? 'blue' : node.type === 'meta' ? 'indigo' : 'slate'
                  }
                >
                  {node.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Height</div>
                  <div className="font-mono text-sm font-bold text-slate-700">
                    {node.height.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Latency</div>
                  <div
                    className={`font-mono text-sm font-bold ${node.latency > 50 ? 'text-orange-500' : 'text-emerald-500'}`}
                  >
                    {node.latency} ms
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonitoringLayer;

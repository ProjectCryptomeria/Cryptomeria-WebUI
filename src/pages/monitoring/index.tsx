import React, { useState } from 'react';
import TopologyGraph from '@/features/monitoring/components/TopologyGraph';
import { BlockFeed } from '@/features/monitoring/components/BlockFeed';
import type { NodeStatus, MonitoringUpdate, MempoolInfo } from '@/entities/node';
import { Activity, Zap, ChevronLeft, Monitor, X, Layers } from 'lucide-react'; // RefreshCw を削除
import { Badge } from '@/shared/ui/Badge';
import { PageHeader } from '@/shared/ui/PageHeader';
import { BottomPanel } from '@/shared/ui/BottomPanel';
import { MempoolChart } from '@/features/monitoring/components/MempoolChart';
import { useResizerPanel } from '@/shared/lib/hooks/useResizerPanel';
import { useWebSocket } from '@/shared/lib/hooks/useWebSocket';
import { useGlobalStore } from '@/shared/store';
// Button コンポーネントは使用しなくなったため削除しても良いが、念のため残すか削除するか。ここでは未使用として削除。

const MonitoringLayer: React.FC = () => {
  // [MODIFIED] グローバルステートから取得
  const { setDeployedNodeCount, monitoringViewMode, setMonitoringViewMode } = useGlobalStore();
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [mempoolData, setMempoolData] = useState<MempoolInfo[]>([]);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // View State: false = Topology (Front), true = BlockFeed (Back)
  // [MODIFIED] グローバルステートに置き換え
  const isFlipped = monitoringViewMode === 'feed';
  const setIsFlipped = (flipped: boolean) => setMonitoringViewMode(flipped ? 'feed' : 'topology');

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
    <div className="flex h-full w-full overflow-hidden relative text-slate-800 bg-slate-50/50">
      <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
        <div className="px-6 pt-6 flex-shrink-0">
          <PageHeader
            title={isFlipped ? 'Live Block Feed' : 'Network Topology'}
            description={
              isFlipped
                ? '全チェーンのブロック生成イベントをリアルタイムで追跡'
                : 'リアルタイムのネットワークトポロジーとノードの状態監視'
            }
            icon={isFlipped ? Layers : Activity}
            iconColor={isFlipped ? 'text-indigo-500' : 'text-blue-500'}
            action={
              <div className="flex items-center gap-3">
                {/* View Switcher */}
                <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
                  <button
                    onClick={() => setIsFlipped(false)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      !isFlipped
                        ? 'bg-slate-100 text-slate-800 shadow-inner'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Activity className="w-3 h-3" /> Topology
                  </button>
                  <button
                    onClick={() => setIsFlipped(true)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      isFlipped
                        ? 'bg-indigo-50 text-indigo-700 shadow-inner'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-3 h-3" /> Block Feed
                  </button>
                </div>

                {/* 削除: RefreshCw Button (謎の空白ボタン) */}

                {/* Active Badge (常時表示に変更し、レイアウトズレを防ぐ) */}
                <Badge
                  color="green"
                  className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-2 py-2 px-3 h-10"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-50 animate-pulse" />
                  {nodes.filter(n => n.status === 'active').length} Active
                </Badge>
              </div>
            }
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 pt-0 pb-32 flex items-center justify-center overflow-hidden relative [perspective:1500px]">
          {/* Side Panel Toggle Button - Moved inside relative container to avoid overlap with header */}
          {/* top-6 だったものを top-4 に変更し、配置基準をこのdivに変更 */}
          <button
            onClick={() => setIsSidePanelOpen(true)}
            className={`absolute top-4 right-0 bg-white border border-slate-200 shadow-lg rounded-l-xl p-3 text-slate-500 hover:bg-slate-50 transition-all z-30 ${
              isSidePanelOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d]"
            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* Front Face: Topology Graph */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
              <TopologyGraph nodes={nodes} />
            </div>

            {/* Back Face: Block Feed */}
            <div
              className="absolute inset-0 w-full h-full [backface-visibility:hidden] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xl"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <BlockFeed />
            </div>
          </div>
        </div>

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
            <MempoolChart data={mempoolData} isResizing={isDragging || isTransitioning} />
          </div>
        </BottomPanel>
      </div>

      {/* Side Panel (Node Registry) */}
      <div
        className={`flex-shrink-0 border-l border-slate-200 bg-white relative z-20 transition-all duration-300 overflow-hidden flex flex-col shadow-xl ${
          isSidePanelOpen ? 'w-96' : 'w-0'
        }`}
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
          <h2 className="font-bold text-slate-700 flex items-center text-lg">
            <Monitor className="w-5 h-5 mr-2 text-slate-500" />
            Node Registry
          </h2>
          <button
            onClick={() => setIsSidePanelOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 space-y-3">
          {nodes.map(node => (
            <div
              key={node.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-white ${
                      node.status === 'active'
                        ? 'bg-emerald-500 ring-emerald-100'
                        : 'bg-red-500 ring-red-100'
                    }`}
                  />
                  <span className="font-mono font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {node.id}
                  </span>
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
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    Height
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-700">
                    {node.height.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    Latency
                  </div>
                  <div
                    className={`font-mono text-sm font-bold ${
                      node.latency > 50 ? 'text-orange-500' : 'text-emerald-600'
                    }`}
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

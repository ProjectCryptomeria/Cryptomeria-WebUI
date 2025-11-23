import React from 'react';
import { ExperimentScenario } from '../../../types';
import {
  List,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
  PlayCircle,
  Settings2,
  CheckCircle2,
} from 'lucide-react';
import { BottomPanel } from '../../../components/ui/BottomPanel';

interface ResultsBottomPanelProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  height: number;
  panelRef: React.RefObject<HTMLDivElement | null>;
  resizerRef: React.RefObject<HTMLDivElement | null>;

  scenarios: ExperimentScenario[];
  totalCost: string;
  successCount: number;
  failCount: number;
  isExecutionRunning: boolean;

  onRecalculateAll: () => void;
  onExecute: () => void;
  onErrorClick: (id: string, reason: string) => void;
  onReprocess: (id: number) => void;
  onLogClick: (scenario: ExperimentScenario) => void;
}

export const ResultsBottomPanel: React.FC<ResultsBottomPanelProps> = ({
  isOpen,
  setIsOpen,
  height,
  panelRef,
  resizerRef,
  scenarios,
  totalCost,
  successCount,
  failCount,
  isExecutionRunning,
  onRecalculateAll,
  onExecute,
  onErrorClick,
  onReprocess,
  onLogClick,
}) => {
  return (
    <BottomPanel
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      height={height}
      panelRef={panelRef}
      resizerRef={resizerRef}
      title={
        <>
          生成結果
          <span className="ml-3 bg-primary-indigo text-white text-sm font-bold px-2.5 py-0.5 rounded-full shadow-sm shadow-indigo-200">
            {scenarios.length}
          </span>
        </>
      }
      icon={List}
      headerRight={
        <div className="text-base text-gray-600 font-medium hidden sm:block">
          総コスト試算:{' '}
          <span className="font-mono font-bold text-gray-900 text-lg">{totalCost}</span> TKN
        </div>
      }
    >
      {/* Status Bar & Execute */}
      <div className="px-8 py-3 bg-indigo-50/50 border-b border-indigo-50 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-8 text-sm">
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-bold text-lg">{successCount}</span>
            <span className="text-xs text-green-700 font-bold ml-1.5 uppercase">Success</span>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-bold text-lg">{failCount}</span>
            <span className="text-xs text-red-700 font-bold ml-1.5 uppercase">Fail</span>
          </div>
        </div>
        <div className="flex gap-3">
          {/* Bulk Recalculate Button */}
          {failCount > 0 && (
            <button
              onClick={onRecalculateAll}
              disabled={isExecutionRunning}
              className="bg-white border border-status-fail text-status-fail px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center hover:bg-red-50 transition-all"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              一括再試算
            </button>
          )}
          <button
            onClick={onExecute}
            disabled={scenarios.length === 0 || isExecutionRunning || successCount === 0}
            className="bg-gray-300 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm flex items-center disabled:opacity-50 data-[ready=true]:bg-primary-indigo data-[ready=true]:hover:bg-indigo-700 data-[ready=true]:hover:shadow-md transition-all transform active:scale-95"
            data-ready={successCount > 0 && !isExecutionRunning}
          >
            {isExecutionRunning ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <PlayCircle className="w-5 h-5 mr-2" />
            )}
            実行
          </button>
        </div>
      </div>

      {/* Scenario List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
        {scenarios.map(c => {
          let border = 'border-l-4 border-gray-200';
          let statusContent = null;
          let bgClass = 'bg-white';

          if (c.status === 'PENDING' || c.status === 'CALCULATING') {
            border = 'border-l-4 border-status-process';
            statusContent = (
              <div className="text-status-process font-bold flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> 試算中
              </div>
            );
          } else if (c.status === 'RUNNING') {
            border = 'border-l-4 border-status-process';
            statusContent = (
              <div className="text-status-process font-bold flex items-center">
                <Settings2 className="w-4 h-4 animate-spin mr-1.5" /> 実行中
              </div>
            );
          } else if (c.status === 'READY') {
            border = 'border-l-4 border-status-ready';
            statusContent = (
              <div className="text-status-ready font-bold flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-1.5" /> {c.cost.toFixed(2)} TKN
              </div>
            );
          } else if (c.status === 'COMPLETE') {
            border = 'border-l-4 border-status-success';
            statusContent = (
              <div className="text-status-success font-bold flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-1.5" /> 完了
              </div>
            );
          } else if (c.status === 'FAIL') {
            border = 'border-l-4 border-status-fail';
            bgClass = 'bg-red-50/30';
            statusContent = (
              <div className="flex items-center">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onErrorClick(c.uniqueId, c.failReason || '');
                  }}
                  className="text-status-fail font-bold hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                >
                  <AlertCircle className="w-5 h-5 mr-1.5" /> ERROR
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onReprocess(c.id);
                  }}
                  className="ml-2 bg-white text-status-fail border border-status-fail hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" /> 再試算
                </button>
              </div>
            );
          }

          return (
            <div
              key={c.uniqueId}
              onClick={() => onLogClick(c)}
              className={`p-4 rounded-2xl shadow-sm ${border} ${bgClass} flex justify-between items-center animate-fade-in hover:shadow-md transition-all cursor-pointer mb-1`}
            >
              <div className="flex items-center space-x-5 flex-1">
                <div className="text-center w-10 shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    Seq
                  </span>
                  <span className="font-black text-gray-700 text-lg">{c.id}</span>
                </div>
                <div className="text-sm overflow-hidden">
                  <div className="font-mono text-xs font-bold text-gray-400 truncate mb-1 opacity-70">
                    {c.uniqueId}
                  </div>
                  <div className="font-bold text-gray-800 text-base">
                    Size: {c.dataSize}MB / Chunk: {c.chunkSize}KB
                  </div>
                  <div className="text-gray-500 text-xs mt-1 font-medium flex gap-2">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {c.allocator}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {c.transmitter}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>Chains: {c.chains}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 flex items-center">{statusContent}</div>
            </div>
          );
        })}
      </div>
    </BottomPanel>
  );
};

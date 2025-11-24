// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/components/layout/Sidebar.tsx

import React from 'react';
import { AppLayer } from '../../shared/types';
import { NAV_ITEMS } from '../../shared/config/constants';
import { ChevronRight, Info, Loader2, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useGlobalStore } from '../../shared/store';

interface SidebarProps {
  activeLayer: AppLayer;
  setActiveLayer: (layer: AppLayer) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeLayer, setActiveLayer }) => {
  const { execution, baseFeeInfo } = useGlobalStore();
  const isExecutionRunning = execution.isExecutionRunning;

  const isUp = baseFeeInfo && baseFeeInfo.change >= 0;
  const changeColor = baseFeeInfo ? (isUp ? 'text-red-400' : 'text-emerald-400') : 'text-slate-500';
  const ChangeIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <nav className="w-72 bg-white flex flex-col py-8 px-4 gap-2 shrink-0 overflow-y-auto border-r border-slate-100">
      <div className="px-4 mb-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
        Navigation
      </div>
      {NAV_ITEMS.map(item => {
        const isActive = activeLayer === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveLayer(item.id)}
            className={`
                    relative px-5 py-4 rounded-2xl text-left transition-all duration-300 flex items-center gap-4 group
                    ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm scale-[1.02]'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:scale-[1.01]'
                    }
                `}
          >
            <item.icon
              className={`w-6 h-6 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}
            />
            <div className="flex-1">
              <div
                className={`font-bold text-sm ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}
              >
                {item.label}
              </div>
              <div
                className={`text-[10px] font-medium mt-0.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}
              >
                {item.subLabel}
              </div>
            </div>

            {item.id === AppLayer.EXPERIMENT && isExecutionRunning ? (
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            ) : (
              isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        );
      })}

      <div className="mt-auto pt-8 px-2">
        <div className="bg-slate-900 p-5 rounded-3xl shadow-xl relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Info className="w-16 h-16 text-white" />
          </div>
          <div className="relative z-1">
            <div className="flex items-center gap-2 mb-3 text-slate-300">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div className="text-xs font-bold uppercase tracking-wider">Base Fee Status</div>
            </div>

            {/* Base Fee Metrics Grid */}
            {baseFeeInfo ? (
              <div className="grid grid-cols-2 gap-2 mb-0">
                {' '}
                {/* mb-4 -> mb-0 に変更 (下の要素削除に伴い) */}
                {/* Current */}
                <div className="col-span-2 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Current Block
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-lg ${changeColor}`}>
                      {baseFeeInfo.current.toFixed(7)}
                    </span>
                    <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-lg">
                      <ChangeIcon className={`w-3 h-3 ${changeColor}`} />
                      <span className={`text-[10px] font-mono ${changeColor}`}>
                        {Math.abs(baseFeeInfo.change)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 text-right mt-0.5">TKN / Gas</div>
                </div>
                {/* Next */}
                <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
                  <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Next</div>
                  <div className="font-mono font-bold text-slate-300 text-sm">
                    {baseFeeInfo.next.toFixed(7)}
                  </div>
                </div>
                {/* Average */}
                <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
                  <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Avg (10)</div>
                  <div className="font-mono font-bold text-blue-300 text-sm">
                    {baseFeeInfo.average.toFixed(7)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 text-xs">Loading Fee Data...</div>
            )}

            {/* 不要な Minikube / Memory 情報を削除しました */}
          </div>
        </div>
      </div>
    </nav>
  );
};

// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/components/layout/Sidebar.tsx

import React from 'react';
import { AppLayer } from '../../shared/types';
import { NAV_ITEMS } from '../../shared/config/constants';
import { ChevronRight, Loader2, Zap, Coins } from 'lucide-react';
import { useGlobalStore } from '../../shared/store';

interface SidebarProps {
  activeLayer: AppLayer;
  setActiveLayer: (layer: AppLayer) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeLayer, setActiveLayer }) => {
  const { execution, minGasPrice } = useGlobalStore(); // minGasPriceを取得
  const isExecutionRunning = execution.isExecutionRunning;

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
          <div className="relative z-1">
            <div className="flex items-center gap-2 mb-3 text-slate-300">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div className="text-xs font-bold uppercase tracking-wider">NETWORK STATUS</div>
            </div>

            {/* Min Gas Price Display (Static) */}
            {minGasPrice !== null ? (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-2">
                  <Coins className="w-3 h-3 text-slate-500" /> Min Gas Price
                </div>
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-lg text-emerald-400 font-mono`}>
                    {minGasPrice.toFixed(7)}
                  </span>
                  <div className="text-xs text-slate-400 font-mono">TKN / Gas</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 text-xs">Loading Fee Data...</div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

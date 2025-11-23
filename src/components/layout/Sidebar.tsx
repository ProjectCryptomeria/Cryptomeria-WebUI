// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/components/layout/Sidebar.tsx

import React from 'react';
import { AppLayer } from '../../types';
import { NAV_ITEMS } from '../../utils/constants';
import { ChevronRight, Info, Loader2 } from 'lucide-react'; // Loader2 追加

interface SidebarProps {
  activeLayer: AppLayer;
  setActiveLayer: (layer: AppLayer) => void;
  // 追加: 実行中フラグを受け取る
  isExecutionRunning?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeLayer,
  setActiveLayer,
  isExecutionRunning,
}) => {
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

            {/* 変更: Experiment項目で実行中の場合にスピナーを表示 */}
            {item.id === AppLayer.EXPERIMENT && isExecutionRunning ? (
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            ) : (
              isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        );
      })}

      {/* ...以下既存コード (Cluster Infoなど) ... */}
      <div className="mt-auto pt-8 px-2">
        <div className="bg-slate-900 p-5 rounded-3xl shadow-xl relative overflow-hidden group cursor-default">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Info className="w-16 h-16 text-white" />
          </div>
          <div className="relative z-10">
            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Cluster Info
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Provider</span>
                <span className="font-bold text-slate-200">Minikube</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Ver</span>
                <span className="font-bold text-slate-200">v1.28.3</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Memory</span>
                <span className="font-bold text-emerald-400">8192MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

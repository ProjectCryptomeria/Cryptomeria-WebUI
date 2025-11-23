// syugeeeeeeeeeei/raidchain-webui/Raidchain-WebUI-temp-refact/src/components/ui/BottomPanel.tsx

import React from 'react';
import { ChevronUp } from 'lucide-react';

interface BottomPanelProps {
  // useResizerPanelフックからの戻り値を受け取る
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  height: number;
  panelRef: React.RefObject<HTMLDivElement | null>;
  resizerRef: React.RefObject<HTMLDivElement | null>;

  // コンテンツ設定
  title: React.ReactNode;
  icon?: React.ElementType;
  description?: string;
  headerRight?: React.ReactNode; // ヘッダー右側（閉じるボタンの左）に追加する要素
  children: React.ReactNode;
  className?: string;
}

/**
 * リサイズ可能なボトムパネルコンポーネント
 */
export const BottomPanel: React.FC<BottomPanelProps> = ({
  isOpen,
  setIsOpen,
  height,
  panelRef,
  resizerRef,
  title,
  icon: Icon,
  description,
  headerRight,
  children,
  className = '',
}) => {
  return (
    <div
      ref={panelRef}
      className={`absolute bottom-0 left-0 right-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 rounded-t-[2rem] border-t border-slate-100 flex flex-col bottom-panel-transition ${isOpen ? '' : 'h-20'} ${className}`}
      style={{ height: isOpen ? height : undefined }}
    >
      {/* Resizer Handle */}
      <div
        ref={resizerRef}
        className="absolute top-0 left-0 right-0 h-4 w-full cursor-row-resize z-50 group flex justify-center items-center"
      >
        <div className="w-16 h-1.5 bg-slate-200 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
      </div>

      {/* Header */}
      <div
        className="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-[2rem] cursor-pointer hover:bg-slate-50 transition-colors relative z-40 mt-1 shrink-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {Icon && (
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 truncate">
              {title}
            </h3>
            {description && <p className="text-[10px] text-slate-500 truncate">{description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {headerRight}
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
            <ChevronUp
              className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>
    </div>
  );
};

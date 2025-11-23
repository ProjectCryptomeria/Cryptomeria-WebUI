import React, { useEffect, useRef } from 'react';
import { Terminal, Info } from 'lucide-react';

/**
 * ログ表示コンポーネント
 *
 * @why: システムログやビルドログを「ターミナル風」に表示し、開発者ツールらしさを演出するため。
 * 自動スクロール機能を持ちます。
 */
export const LogViewer: React.FC<{ logs: string[]; className?: string; title?: string }> = ({
  logs,
  className = '',
  title,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // ログが更新されるたびに最下部へスクロール (scrollToを使用)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [logs]);

  return (
    <div
      className={`flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 font-mono ${className}`}
    >
      {/* Terminal Header */}
      <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b border-white/5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/10 rounded-md">
            <Terminal className="w-3 h-3 text-slate-300" />
          </div>
          <span className="text-xs font-bold text-slate-300 tracking-wider uppercase opacity-80">
            {title || 'System Output'}
          </span>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/50 shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/50 shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50 shadow-inner" />
        </div>
      </div>

      {/* Log Content */}
      <div
        ref={scrollRef}
        className="flex-1 p-6 text-xs md:text-sm overflow-y-auto custom-scrollbar text-slate-300 leading-relaxed space-y-1.5"
      >
        {logs.length === 0 && (
          <div className="text-slate-600 italic flex items-center gap-2">
            <Info className="w-4 h-4" /> Waiting for logs...
          </div>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            className="break-all animate-in fade-in slide-in-from-left-2 duration-200 flex"
          >
            <span className="text-emerald-500 mr-3 select-none opacity-50">➜</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

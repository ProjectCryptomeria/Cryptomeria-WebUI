
import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, Loader2, Terminal } from 'lucide-react';

// --- Card Component ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className} ${onClick ? 'cursor-pointer transition-all hover:shadow-md' : ''}`}>
    {children}
  </div>
);

// --- Modal Component ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; className?: string }> = ({ isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 ${className}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const ModalHeader: React.FC<{ title: string; subTitle?: string; icon?: React.ElementType; onClose: () => void; iconColor?: string }> = ({ title, subTitle, icon: Icon, onClose, iconColor = "text-slate-800" }) => (
  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
    <div className="flex items-center gap-2">
       {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
       <div>
         <div className="text-lg font-bold text-slate-800">{title}</div>
         {subTitle && <div className="text-xs text-slate-500 font-mono">{subTitle}</div>}
       </div>
    </div>
    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
      <X className="w-5 h-5" />
    </button>
  </div>
);

// --- Badge Component ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'slate' | 'blue' | 'green' | 'red' | 'yellow' | 'indigo'; className?: string }> = ({ children, color = 'slate', className = '' }) => {
  const colors = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color: 'green' | 'red' | 'yellow' | 'slate' = 'slate';
  let icon = null;
  
  if (['active', 'SUCCESS', 'COMPLETE', 'READY'].includes(status)) {
    color = 'green';
    icon = <CheckCircle className="w-3 h-3 mr-1" />;
  } else if (['error', 'FAILED', 'FAIL'].includes(status)) {
    color = 'red';
    icon = <AlertTriangle className="w-3 h-3 mr-1" />;
  } else if (['RUNNING', 'PENDING', 'CALCULATING'].includes(status)) {
    color = 'yellow';
    icon = <Loader2 className="w-3 h-3 mr-1 animate-spin" />;
  }

  return (
    <Badge color={color} className="inline-flex items-center">
      {icon}
      {status}
    </Badge>
  );
};

// --- Log Viewer Component ---
export const LogViewer: React.FC<{ logs: string[]; className?: string; title?: string }> = ({ logs, className = '', title }) => {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return (
    <div className={`flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700 ${className}`}>
      {title && (
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-300">{title}</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
        </div>
      )}
      <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar text-slate-300 leading-relaxed">
        {logs.length === 0 && <div className="text-slate-600 italic">No logs available...</div>}
        {logs.map((log, i) => (
          <div key={i} className="mb-1 break-all animate-in fade-in slide-in-from-left-2 duration-200">
            <span className="text-emerald-500 mr-2">$</span>
            {log}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

// --- SlideOver Component ---
export const SlideOver: React.FC<{ isOpen: boolean; title: string; onClose?: () => void; children: React.ReactNode; width?: string }> = ({ isOpen, title, onClose, children, width = "w-96" }) => (
  <div className={`fixed right-0 top-16 bottom-0 ${width} bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 z-20 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
    {isOpen && (
      <>
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-xl text-slate-800">{title}</h3>
          {onClose && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </>
    )}
  </div>
);

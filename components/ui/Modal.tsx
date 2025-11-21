import React from 'react';
import { X } from 'lucide-react';

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; className?: string }> = ({ isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" onClick={onClose}>
      <div 
        className={`bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-300 ${className}`} 
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const ModalHeader: React.FC<{ title: string; subTitle?: string; icon?: React.ElementType; onClose: () => void; iconColor?: string }> = ({ title, subTitle, icon: Icon, onClose, iconColor = "text-slate-800" }) => (
  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-3xl">
    <div className="flex items-center gap-3">
       {Icon && <div className={`p-2 bg-slate-50 rounded-xl ${iconColor}`}><Icon className="w-5 h-5" /></div>}
       <div>
         <div className="text-lg font-bold text-slate-800">{title}</div>
         {subTitle && <div className="text-xs text-slate-500 font-mono">{subTitle}</div>}
       </div>
    </div>
    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
      <X className="w-4 h-4" />
    </button>
  </div>
);
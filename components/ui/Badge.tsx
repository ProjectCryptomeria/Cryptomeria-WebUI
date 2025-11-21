import React from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export const Badge: React.FC<{ children: React.ReactNode; color?: 'slate' | 'blue' | 'green' | 'red' | 'yellow' | 'indigo' | 'purple'; className?: string }> = ({ children, color = 'slate', className = '' }) => {
  const colors = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wide ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color: 'green' | 'red' | 'yellow' | 'slate' = 'slate';
  let icon = null;
  
  if (['active', 'SUCCESS', 'COMPLETE', 'READY'].includes(status)) {
    color = 'green';
    icon = <CheckCircle className="w-3 h-3 mr-1.5" />;
  } else if (['error', 'FAILED', 'FAIL', 'ABORTED'].includes(status)) {
    color = 'red';
    icon = <AlertTriangle className="w-3 h-3 mr-1.5" />;
  } else if (['RUNNING', 'PENDING', 'CALCULATING'].includes(status)) {
    color = 'yellow';
    icon = <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />;
  }

  return (
    <Badge color={color} className="inline-flex items-center pl-2 pr-3 py-1.5">
      {icon}
      {status}
    </Badge>
  );
};
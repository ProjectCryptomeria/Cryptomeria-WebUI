import React from 'react';

export const PageHeader: React.FC<{ 
  title: string; 
  description?: string; 
  icon: React.ElementType; 
  iconColor?: string;
  action?: React.ReactNode;
}> = ({ title, description, icon: Icon, iconColor = "text-primary-indigo", action }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-in fade-in slide-in-from-top-5 duration-500">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-100 ${iconColor}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
        {description && <p className="text-slate-500 text-sm font-medium mt-0.5">{description}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);
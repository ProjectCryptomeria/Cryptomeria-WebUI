import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick} 
    className={`
      bg-white rounded-3xl shadow-sm border border-slate-100 
      ${className} 
      ${onClick ? 'cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1' : ''}
    `}
  >
    {children}
  </div>
);
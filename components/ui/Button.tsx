import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: ButtonVariant; 
  size?: ButtonSize; 
  isLoading?: boolean;
  icon?: React.ElementType;
}> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  icon: Icon,
  disabled,
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-lg",
  };

  const variantStyles = {
    primary: "bg-primary-indigo text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    outline: "bg-transparent border-2 border-slate-200 text-slate-600 hover:border-primary-indigo hover:text-primary-indigo",
  };

  return (
    <button 
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
};
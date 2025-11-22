import React from 'react';

/**
 * テキスト入力フィールド
 * 
 * @why: フォーム要素のデザインを統一し、フォーカス時のリングや色を一貫させるため。
 */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
	<input
		ref={ref}
		className={`
      block w-full rounded-xl border-slate-200 bg-slate-50 p-3 
      text-sm font-medium text-slate-800 placeholder:text-slate-400
      focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 
      outline-none transition-all shadow-sm
      ${className}
    `}
		{...props}
	/>
));

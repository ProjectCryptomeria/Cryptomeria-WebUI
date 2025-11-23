import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  colorClass?: string; // e.g., 'peer-checked:bg-indigo-600'
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  colorClass = 'peer-checked:bg-indigo-600',
}) => {
  return (
    <label
      // 修正: 'relative' クラスを追加して、sr-onlyなinputの位置をこの要素内に留める
      className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={e => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      <div
        className={`
        relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 
        rounded-full peer 
        ${colorClass} 
        peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
        peer-checked:after:border-white after:content-[''] 
        after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 
        after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
        dark:border-gray-600
      `}
      ></div>
      {label && <span className="ms-3 text-sm font-medium text-gray-700 select-none">{label}</span>}
    </label>
  );
};

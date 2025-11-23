import React from 'react';
import { Lock } from 'lucide-react';

interface RangeInputProps {
  label: string;
  type: 'data-size' | 'chunk-size';
  fixedValue: number;
  rangeParams: { start: number; end: number; step: number };
  isRange: boolean;
  disabled?: boolean;
  unit: string;
  onChangeFixed: (v: number) => void;
  onChangeRange: (k: 'start' | 'end' | 'step', v: number) => void;
  onToggleRange: () => void;
}

export const RangeInput: React.FC<RangeInputProps> = ({
  label,
  fixedValue,
  rangeParams,
  isRange,
  disabled,
  unit,
  onChangeFixed,
  onChangeRange,
  onToggleRange,
}) => (
  <div
    className={`bg-gray-50 p-5 rounded-2xl border transition-colors hover:border-primary-indigo/30 ${
      disabled ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <label className="font-bold text-gray-700 text-base">
        {label} ({unit})
      </label>
      <label
        className={`inline-flex items-center text-xs cursor-pointer bg-white px-2 py-1 rounded border border-gray-200 shadow-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={isRange}
          onChange={onToggleRange}
          disabled={disabled}
          className="rounded text-primary-indigo focus:ring-0 w-3 h-3 mr-1"
        />
        <span className="text-gray-500 font-medium">範囲指定</span>
      </label>
    </div>

    {!isRange ? (
      <div>
        <input
          type="number"
          value={fixedValue}
          disabled={disabled}
          onChange={e => onChangeFixed(Number(e.target.value))}
          className="param-input block w-full rounded-lg border-gray-200 border p-2.5 focus:border-primary-indigo outline-none text-right font-mono text-lg font-bold disabled:bg-gray-100 disabled:text-gray-400"
        />
      </div>
    ) : (
      <div className="grid grid-cols-3 gap-2">
        {(['start', 'end', 'step'] as const).map(field => (
          <input
            key={field}
            type="number"
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={rangeParams[field]}
            onChange={e => onChangeRange(field, Number(e.target.value))}
            className="param-input border border-gray-200 rounded-lg p-2 text-sm font-mono text-right focus:border-primary-indigo outline-none"
          />
        ))}
      </div>
    )}
    {disabled && (
      <p className="text-xs text-orange-500 mt-2 font-bold flex items-center justify-end">
        <Lock className="w-3 h-3 mr-1" />
        アップロード時は固定されます
      </p>
    )}
  </div>
);

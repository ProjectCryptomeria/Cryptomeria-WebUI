import React from 'react';
import { Lock } from 'lucide-react';
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch';

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
    className={`p-5 rounded-2xl border transition-colors hover:border-primary-indigo/30 h-40 flex flex-col ${
      disabled ? 'border-orange-200 bg-orange-50/50' : 'bg-gray-50 border-gray-200'
    }`}
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-2 shrink-0">
      <label className="font-bold text-gray-700 text-base flex items-center gap-2">
        {label} <span className="text-xs text-gray-400 font-normal">({unit})</span>
      </label>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold ${isRange ? 'text-indigo-600' : 'text-gray-400'}`}>
          範囲指定
        </span>
        <ToggleSwitch checked={isRange} onChange={onToggleRange} disabled={disabled} />
      </div>
    </div>

    {/* Main Input Area */}
    <div className="flex-1 flex flex-col justify-center min-h-0">
      {!isRange ? (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <input
            type="number"
            value={fixedValue}
            disabled={disabled}
            onChange={e => onChangeFixed(Number(e.target.value))}
            className="w-full rounded-xl border-gray-200 border p-3 focus:border-primary-indigo outline-none text-right font-mono text-2xl font-bold disabled:bg-gray-100 disabled:text-gray-400 transition-all focus:ring-4 focus:ring-indigo-50 bg-white text-slate-700"
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 animate-in fade-in zoom-in-95 duration-200">
          {(['start', 'end', 'step'] as const).map(field => (
            <div key={field}>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">
                {field === 'start' ? '開始' : field === 'end' ? '終了' : 'ステップ'}
              </div>
              <input
                type="number"
                value={rangeParams[field]}
                onChange={e => onChangeRange(field, Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl p-2 text-lg font-mono text-center focus:border-primary-indigo outline-none focus:ring-2 focus:ring-indigo-100 transition-all bg-white text-slate-700 font-bold"
              />
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Footer / Status */}
    <div className="h-2 mt-1 shrink-0 flex items-center justify-end">
      {disabled && (
        <p className="text-xs text-orange-500 font-bold flex items-center animate-fade-in">
          <Lock className="w-3 h-3 mr-1" />
          固定
        </p>
      )}
    </div>
  </div>
);

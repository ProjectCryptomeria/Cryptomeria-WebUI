import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StrategyCardProps {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  label,
  description,
  selected,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`rounded-2xl p-5 relative bg-white cursor-pointer border-2 transition-all duration-200 ${
      selected ? 'border-primary-indigo bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-200'
    }`}
  >
    <div className="flex justify-between items-start">
      <div>
        <div className="font-bold text-gray-800 text-base">{label}</div>
        <div className="text-xs font-medium text-gray-400 mt-1">{description}</div>
      </div>
      {selected && (
        <div className="text-primary-indigo">
          <CheckCircle2 className="w-6 h-6 fill-current" />
        </div>
      )}
    </div>
  </div>
);

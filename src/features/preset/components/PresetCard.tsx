import React from 'react';
import { AllocatorStrategy, TransmitterStrategy } from '@/entities/scenario';
import { ExperimentPreset } from '@/entities/preset';
import { FileText, Clock, Trash2, Database, Puzzle, Monitor } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';

interface PresetCardProps {
  preset: ExperimentPreset;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

/**
 * プリセットカードコンポーネント
 *
 * @why: プリセット一覧での個別の表示ロジックを分離し、再利用性と保守性を高めるため。
 * 削除ボタンの配置やサイズを調整し、操作しやすくしています。
 */
export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  isSelected,
  onClick,
  onDelete,
}) => {
  // 表示用ヘルパー
  const getSizeDisplay = () =>
    preset.generatorState
      ? preset.generatorState.dataSize.mode === 'range'
        ? `${preset.generatorState.dataSize.start}-${preset.generatorState.dataSize.end}MB`
        : `${preset.generatorState.dataSize.fixed}MB`
      : `${preset.config.virtualConfig?.sizeMB || 0}MB`;

  const getChunkDisplay = () =>
    preset.generatorState
      ? preset.generatorState.chunkSize.mode === 'range'
        ? `${preset.generatorState.chunkSize.start}-${preset.generatorState.chunkSize.end}KB`
        : `${preset.generatorState.chunkSize.fixed}KB`
      : `${preset.config.virtualConfig?.chunkSizeKB}KB`;

  const getChainCount = () =>
    preset.generatorState
      ? preset.generatorState.selectedChains.length
      : preset.config.targetChains.length;

  const getStrategyBadge = (type: 'allocator' | 'transmitter', value: string) => {
    let label = value;
    let colorClass = 'bg-slate-100 text-slate-600';

    if (type === 'allocator') {
      colorClass = 'bg-blue-50 text-blue-700 border border-blue-100';
      if (value === AllocatorStrategy.ROUND_ROBIN) label = 'RR';
      else if (value === AllocatorStrategy.AVAILABLE) label = 'LB';
      else if (value === AllocatorStrategy.RANDOM) label = 'RND';
      else if (value === AllocatorStrategy.STATIC) label = 'FIX';
      else if (value === AllocatorStrategy.HASH) label = 'HASH';
    } else {
      colorClass = 'bg-purple-50 text-purple-700 border border-purple-100';
      if (value === TransmitterStrategy.ONE_BY_ONE) label = '1by1';
      else if (value === TransmitterStrategy.MULTI_BURST) label = 'Push';
    }

    return (
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center border ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  const allocator = preset.generatorState
    ? preset.generatorState.allocators[0]
    : preset.config.allocator;
  const transmitter = preset.generatorState
    ? preset.generatorState.transmitters[0]
    : preset.config.transmitter;

  return (
    <Card
      onClick={onClick}
      className={`
        p-6 h-full group relative flex flex-col justify-between border-2 transition-all duration-300 cursor-pointer
        ${
          isSelected
            ? 'border-blue-500 ring-4 ring-blue-50 shadow-xl'
            : 'border-transparent hover:border-blue-200 hover:shadow-lg hover:-translate-y-1'
        }
      `}
    >
      <div>
        <div className="flex justify-between items-start mb-4 pr-8">
          <div className="flex items-center gap-4 overflow-hidden">
            <div
              className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'
              }`}
            >
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3
                className={`font-bold text-lg truncate ${
                  isSelected ? 'text-blue-700' : 'text-slate-800'
                }`}
                title={preset.name}
              >
                {preset.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1">
                <Clock className="w-3 h-3" />
                {new Date(preset.lastModified).toLocaleString('ja-JP')}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Button: Absolute positioning to avoid clipping and layout shifts.
          Increased size (w-9 h-9) and z-index for better usability.
        */}
        {onDelete && (
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete(preset.id);
            }}
            className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-20 border border-transparent hover:border-red-100"
            title="Delete Preset"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-wrap gap-2 mt-4 mb-4">
          <Badge color="blue" className="flex items-center gap-1.5">
            <Database className="w-3 h-3" />
            {getSizeDisplay()}
          </Badge>
          <Badge color="purple" className="flex items-center gap-1.5">
            <Puzzle className="w-3 h-3" />
            {getChunkDisplay()}
          </Badge>
          <Badge color="green" className="flex items-center gap-1.5">
            <Monitor className="w-3 h-3" />
            {getChainCount()} Chains
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {getStrategyBadge('allocator', allocator)}
          {getStrategyBadge('transmitter', transmitter)}
        </div>
      </div>
    </Card>
  );
};

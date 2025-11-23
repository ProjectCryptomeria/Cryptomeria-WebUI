import React from 'react';
import { ExperimentPreset, AllocatorStrategy, TransmitterStrategy } from '../../../types';
import {
  Bookmark,
  X,
  Save,
  Folder,
  Clock,
  Database,
  Puzzle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

interface PresetSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  presets: ExperimentPreset[];
  newPresetName: string;
  setNewPresetName: (name: string) => void;
  onSave: () => void;
  onLoad: (preset: ExperimentPreset) => void;
  onDelete?: (id: string) => void;
  deployedNodeCount: number; // チェーン数の計算用
}

export const PresetSidePanel: React.FC<PresetSidePanelProps> = ({
  isOpen,
  onClose,
  presets,
  newPresetName,
  setNewPresetName,
  onSave,
  onLoad,
  onDelete,
  deployedNodeCount,
}) => {
  // バッジ表示用のヘルパー関数 (ローカル定義)
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
        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div
      className={`flex-shrink-0 border-l border-gray-200 bg-white relative z-20 transition-all duration-300 overflow-hidden ${
        isOpen ? 'w-96' : 'w-0'
      }`}
    >
      <aside className="h-full flex flex-col w-96">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-gray-700 flex items-center text-lg">
            <Bookmark className="w-6 h-6 mr-2 text-scenario-accent" />
            プリセット管理
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Form */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPresetName}
              onChange={e => setNewPresetName(e.target.value)}
              placeholder="設定名..."
              className="flex-1 border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:border-scenario-accent focus:ring-2 focus:ring-orange-100 outline-none transition-all font-medium"
            />
            <button
              onClick={onSave}
              className="bg-scenario-accent hover:bg-orange-600 text-white rounded-xl px-3.5 py-2.5 shadow-md shadow-orange-100 transition-colors flex items-center justify-center min-w-[44px]"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
          {presets.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Folder className="w-8 h-8" />
              </div>
              <p className="text-sm text-gray-400 font-medium">保存されたプリセットはありません</p>
            </div>
          )}
          {presets.map(s => {
            // Extract strategy values for badges
            const allocator = s.generatorState
              ? s.generatorState.allocators[0]
              : s.config.allocator;
            const transmitter = s.generatorState
              ? s.generatorState.transmitters[0]
              : s.config.transmitter;
            const dataSizeLabel = s.generatorState
              ? s.generatorState.dataSize.mode === 'range'
                ? `${s.generatorState.dataSize.start}MB`
                : `${s.generatorState.dataSize.fixed}MB`
              : `${s.config.virtualConfig?.sizeMB}MB`;
            const chunkLabel = s.generatorState
              ? s.generatorState.chunkSize.mode === 'range'
                ? `Range`
                : `${s.generatorState.chunkSize.fixed}KB`
              : `${s.config.virtualConfig?.chunkSizeKB}KB`;

            return (
              <div
                key={s.id}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group relative cursor-default"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className="font-bold text-slate-800 text-lg truncate w-full pr-8"
                    title={s.name}
                  >
                    {s.name}
                  </h3>
                  {onDelete && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(s.id);
                      }}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full p-1 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center text-xs text-slate-400 mb-4 font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(s.lastModified).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    color="blue"
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-100"
                  >
                    <Database className="w-3 h-3" />
                    {dataSizeLabel}
                  </Badge>
                  <Badge
                    color="slate"
                    className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-100"
                  >
                    <Puzzle className="w-3 h-3" />
                    {chunkLabel}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {getStrategyBadge('allocator', allocator)}
                  {getStrategyBadge('transmitter', transmitter)}
                </div>

                <button
                  onClick={() => onLoad(s)}
                  className="w-full bg-white border border-scenario-accent text-scenario-accent text-sm font-bold py-2.5 rounded-xl hover:bg-scenario-accent hover:text-white transition-all flex items-center justify-center group/btn"
                >
                  <RotateCcw className="w-4 h-4 mr-2 group-hover/btn:rotate-180 transition-transform" />{' '}
                  適用する
                </button>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};

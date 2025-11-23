import React, { useRef, ReactNode, ComponentType, SVGProps } from 'react';
import { ExperimentPreset } from '@/entities/preset';
import {
  FileText,
  Settings2,
  Database,
  Puzzle,
  Network,
  ArrowRight,
  Layers,
  Hash,
  ChevronDown,
  Monitor,
} from 'lucide-react';
import { SlideOver } from '@/shared/ui/SlideOver';
import { Badge } from '@/shared/ui/Badge';

// --- 修正箇所: DetailRow と RangeVisualizer を外部に移動し、型を定義 ---

interface DetailRowProps {
  label: string;
  value: ReactNode;
  // Lucideアイコンまたはその他のコンポーネントの型を定義し、anyを解消
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  subValue?: string;
}

/**
 * 内部コンポーネント: 詳細行 (PresetDetailsPanel の外に移動)
 */
const DetailRow: React.FC<DetailRowProps> = ({ label, value, icon: Icon, subValue }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-500">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
        {subValue && <div className="text-[10px] text-slate-400 mt-0.5">{subValue}</div>}
      </div>
    </div>
    <div className="font-mono font-bold text-slate-700 text-sm">{value}</div>
  </div>
);

interface RangeVisualizerProps {
  label: string;
  start: number;
  end: number;
  step: number;
  unit: string;
}

/**
 * 内部コンポーネント: 範囲可視化 (PresetDetailsPanel の外に移動)
 */
const RangeVisualizer: React.FC<RangeVisualizerProps> = ({ label, start, end, step, unit }) => (
  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
    <div className="flex justify-between items-center mb-4">
      <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
        <Layers className="w-4 h-4" /> {label} Range
      </span>
      <Badge color="indigo" className="font-mono">
        Step: {step}
        {unit}
      </Badge>
    </div>
    <div className="flex items-center justify-between font-mono font-bold text-slate-700 relative z-10 px-2">
      <div className="flex flex-col items-center">
        <span className="text-2xl">{start}</span>
        <span className="text-[10px] text-slate-400">{unit}</span>
      </div>
      <div className="flex-1 mx-6 h-1.5 bg-slate-200 rounded-full relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-300 to-indigo-500 opacity-50 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm border border-indigo-100">
          <ArrowRight className="w-3 h-3 text-indigo-500" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl">{end}</span>
        <span className="text-[10px] text-slate-400">{unit}</span>
      </div>
    </div>
  </div>
);

// --- Main Component Definition Starts Here ---

interface PresetDetailsPanelProps {
  preset: ExperimentPreset | null;
  onClose: () => void;
}

/**
 * プリセット詳細パネルコンポーネント
 */
export const PresetDetailsPanel: React.FC<PresetDetailsPanelProps> = ({ preset, onClose }) => {
  // スクロール制御用のRef
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // アコーディオン展開時の自動スクロール処理
  const handleConfigToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (e.currentTarget.open) {
      // アニメーションやレンダリングの安定を待つために僅かに遅延させる
      setTimeout(() => {
        e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // 表示用ヘルパー関数
  const getSizeDisplay = (p: ExperimentPreset) =>
    p.generatorState
      ? p.generatorState.dataSize.mode === 'range'
        ? `${p.generatorState.dataSize.start}-${p.generatorState.dataSize.end}MB`
        : `${p.generatorState.dataSize.fixed}MB`
      : `${p.config.virtualConfig?.sizeMB || 0}MB`;

  const getChunkDisplay = (p: ExperimentPreset) =>
    p.generatorState
      ? p.generatorState.chunkSize.mode === 'range'
        ? `${p.generatorState.chunkSize.start}-${p.generatorState.chunkSize.end}KB`
        : `${p.generatorState.chunkSize.fixed}KB`
      : `${p.config.virtualConfig?.chunkSizeKB}KB`;

  const getChainCount = (p: ExperimentPreset) =>
    p.generatorState ? p.generatorState.selectedChains.length : p.config.targetChains.length;

  return (
    <SlideOver isOpen={!!preset} title="Preset Details" onClose={onClose} width="w-[500px]">
      {preset && (
        <div className="flex flex-col h-full">
          <div className="bg-slate-900 p-8 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3 opacity-70">
                <Settings2 className="w-4 h-4" />
                <span className="text-xs font-mono tracking-wider uppercase">Configuration</span>
              </div>
              <h2 className="text-3xl font-bold mb-3 leading-tight">{preset.name}</h2>
              <div className="flex items-center gap-4 text-xs font-mono opacity-50">
                <span>ID: {preset.id.substring(0, 8)}...</span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-10 flex-1 overflow-y-auto custom-scrollbar bg-white">
            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Overview Stats
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center hover:scale-105 transition-transform">
                  <div className="text-blue-600 mb-2 flex justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Size</div>
                  <div className="font-bold text-slate-800 text-lg">{getSizeDisplay(preset)}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center hover:scale-105 transition-transform">
                  <div className="text-purple-600 mb-2 flex justify-center">
                    <Puzzle className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Chunk</div>
                  <div className="font-bold text-slate-800 text-lg">{getChunkDisplay(preset)}</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center hover:scale-105 transition-transform">
                  <div className="text-emerald-600 mb-2 flex justify-center">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Targets</div>
                  <div className="font-bold text-slate-800 text-lg">
                    {getChainCount(preset)} Nodes
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Parameters
              </h4>

              <DetailRow
                label="Data Source"
                value={preset.config.uploadType}
                icon={FileText}
                subValue={
                  preset.config.uploadType === 'Virtual' ? 'Generated on-the-fly' : 'Physical files'
                }
              />

              {preset.generatorState?.dataSize.mode === 'range' ? (
                <RangeVisualizer
                  label="Data Size"
                  start={preset.generatorState.dataSize.start}
                  end={preset.generatorState.dataSize.end}
                  step={preset.generatorState.dataSize.step}
                  unit="MB"
                />
              ) : (
                <DetailRow
                  label="Data Size (Fixed)"
                  value={`${preset.generatorState?.dataSize.fixed} MB`}
                  icon={Database}
                />
              )}

              {preset.generatorState?.chunkSize.mode === 'range' ? (
                <RangeVisualizer
                  label="Chunk Size"
                  start={preset.generatorState.chunkSize.start}
                  end={preset.generatorState.chunkSize.end}
                  step={preset.generatorState.chunkSize.step}
                  unit="KB"
                />
              ) : (
                <DetailRow
                  label="Chunk Size (Fixed)"
                  value={`${preset.generatorState?.chunkSize.fixed} KB`}
                  icon={Puzzle}
                />
              )}
            </section>

            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Network className="w-4 h-4" /> Strategies
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 transition-colors group bg-slate-50/50">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-2">Allocator</div>
                  <div className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {preset.config.allocator}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-slate-200 hover:border-purple-400 transition-colors group bg-slate-50/50">
                  <div className="text-xs text-slate-400 font-bold uppercase mb-2">Transmitter</div>
                  <div className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                    {preset.config.transmitter}
                  </div>
                </div>
              </div>
            </section>

            <section className="pt-6 border-t border-slate-100">
              <details className="group" ref={detailsRef} onToggle={handleConfigToggle}>
                <summary className="flex items-center justify-between cursor-pointer list-none text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold uppercase">View Raw Config</span>
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 bg-slate-900 rounded-2xl p-6 overflow-x-auto shadow-inner border border-slate-700">
                  <pre className="text-[10px] font-mono text-slate-300 leading-relaxed">
                    {JSON.stringify(preset.generatorState || preset.config, null, 2)}
                  </pre>
                </div>
              </details>
            </section>
          </div>
        </div>
      )}
    </SlideOver>
  );
};

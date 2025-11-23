import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Check,
  Server,
  Layers,
  Lock,
  AlertCircle,
  RotateCw,
  ArrowRight,
  MousePointerClick,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { NodeStatus } from '../../../types';
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch';

interface ChainSelectorProps {
  nodes: NodeStatus[];
  selectedChains: Set<string>;
  setSelectedChains: (chains: Set<string>) => void;
  chainRangeParams: { start: number; end: number; step: number };
  setChainRangeParams: (params: { start: number; end: number; step: number }) => void;
  mode: 'fixed' | 'range';
  setMode: (mode: 'fixed' | 'range') => void;
  disabled?: boolean;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  nodes,
  selectedChains,
  setSelectedChains,
  chainRangeParams,
  setChainRangeParams,
  mode,
  setMode,
  disabled,
}) => {
  const [isListOpen, setIsListOpen] = useState(true);

  const dataNodes = useMemo(() => {
    return nodes
      .filter(n => n.type === 'data')
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [nodes]);

  const activeDataNodes = dataNodes.filter(n => n.status === 'active');

  const handleSelectAll = () => {
    const allActive = new Set(activeDataNodes.map(n => n.id));
    setSelectedChains(allActive);
  };

  const handleSelectNone = () => {
    setSelectedChains(new Set());
  };

  const toggleChain = (id: string, isActive: boolean) => {
    if (!isActive || disabled) return;
    const next = new Set(selectedChains);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedChains(next);
  };

  // プレビュー用のデータを生成
  const previewScenarios = useMemo(() => {
    const sortedSelection = Array.from(selectedChains).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    if (sortedSelection.length === 0) return [];

    const { start, end, step } = chainRangeParams;
    const scenarios = [];

    if (mode === 'fixed') {
      // Fixedモードの場合は現在の選択状態がそのまま1つのシナリオ
      scenarios.push(sortedSelection);
    } else {
      // Rangeモードの場合はステップ計算
      for (let i = start; i <= end; i += step) {
        if (i > 0 && i <= sortedSelection.length) {
          scenarios.push(sortedSelection.slice(0, i));
        }
      }
    }
    return scenarios;
  }, [selectedChains, chainRangeParams, mode]);

  return (
    <div
      className={`bg-gray-50 p-6 rounded-3xl border transition-colors hover:border-primary-indigo/30 ${
        disabled ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <label className="font-bold text-gray-700 text-lg block">対象チェーン</label>
            <div className="text-xs text-gray-400 font-medium mt-0.5">
              選択中: <span className="text-indigo-600 font-bold">{selectedChains.size}</span> /{' '}
              {activeDataNodes.length} 稼働ノード
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <span
            className={`text-xs font-bold ${mode === 'range' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            ステップ実行
          </span>
          <ToggleSwitch
            checked={mode === 'range'}
            onChange={() => setMode(mode === 'fixed' ? 'range' : 'fixed')}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Main Content Area - Fixed Height for Consistency */}
      <div className="flex flex-col lg:flex-row gap-6 h-[440px]">
        {/* --- Left Column: Config (List + Step Settings) --- */}
        <div className="flex flex-col gap-4 lg:w-1/2 h-full min-h-0">
          {/* 1. Available Chains List (Flex-1 to fill available space) */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm ring-4 ring-gray-50 flex flex-col flex-1 min-h-0">
            <div
              className="px-5 py-3 flex justify-between items-center bg-gray-50/80 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100 shrink-0"
              onClick={() => setIsListOpen(!isListOpen)}
            >
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                利用可能なチェーン
                {!isListOpen && <Badge className="ml-2">{dataNodes.length}</Badge>}
              </span>
              <div className="flex items-center gap-4">
                {!disabled && (
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={handleSelectAll}
                      className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      全選択
                    </button>
                    <div className="w-px h-4 bg-gray-300 my-auto"></div>
                    <button
                      onClick={handleSelectNone}
                      className="text-[10px] font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      解除
                    </button>
                  </div>
                )}
                {isListOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {isListOpen && (
              <div className="p-4 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-3 content-start">
                {dataNodes.map(node => {
                  const isSelected = selectedChains.has(node.id);
                  const isActive = node.status === 'active';

                  return (
                    <div
                      key={node.id}
                      onClick={() => toggleChain(node.id, isActive)}
                      className={`
                        group flex items-center justify-between p-3 rounded-xl border transition-all select-none relative overflow-hidden h-14
                        ${
                          !isActive
                            ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                            : isSelected
                              ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200'
                              : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm cursor-pointer'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                            isSelected && isActive
                              ? 'bg-primary-indigo border-primary-indigo scale-110'
                              : 'border-slate-300 bg-white group-hover:border-indigo-300'
                          }`}
                        >
                          {isSelected && isActive && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <div
                            className={`text-[13px] font-bold leading-none mb-1 ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}
                          >
                            {node.id}
                          </div>
                          <div className="text-[12px] text-slate-400 font-mono">
                            レイテンシ: {node.latency}ms
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10">
                        {isActive ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>

                      {isSelected && isActive && (
                        <div className="absolute inset-0 bg-indigo-50/50 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Step Settings (Visible only in Range Mode - Shrink-0) */}
          {mode === 'range' && (
            <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-4 border-b border-indigo-50 pb-2">
                <div className="p-1 bg-indigo-100 rounded text-indigo-600">
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  ステップ設定
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(['start', 'end', 'step'] as const).map(field => (
                  <div key={field} className="relative">
                    <div className="text-[10px] font-extrabold text-indigo-300 uppercase mb-1.5 ml-1 tracking-widest">
                      {field === 'start' ? '開始' : field === 'end' ? '終了' : 'ステップ'}
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={selectedChains.size || 1}
                      value={chainRangeParams[field]}
                      onChange={e => {
                        const val = Number(e.target.value);
                        const maxVal = selectedChains.size || 1;
                        // 選択数以上には増やせないように制限
                        const clampedVal = Math.min(maxVal, Math.max(1, val));
                        setChainRangeParams({ ...chainRangeParams, [field]: clampedVal });
                      }}
                      // param-input クラスを削除してスピンボタンを表示、文字サイズなどを小さめに調整
                      className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl p-2 text-sm font-mono text-center focus:border-primary-indigo outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-indigo-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Right Column: Generation Preview (Always Visible) --- */}
        <div className="lg:w-1/2 w-full flex flex-col h-full min-h-0">
          <div className="bg-indigo-50/30 rounded-2xl border border-indigo-100 p-1 h-full flex flex-col">
            <div className="px-4 py-3 flex items-center justify-between border-b border-indigo-100/50 mb-1 shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  生成プレビュー
                </span>
              </div>
              <Badge color="indigo">{previewScenarios.length} シナリオ</Badge>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2 space-y-2">
              {previewScenarios.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-indigo-300 p-8 border-2 border-dashed border-indigo-100 rounded-xl m-2">
                  <MousePointerClick className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-bold">チェーンを選択してシナリオを生成</span>
                  {mode === 'range' && (
                    <span className="text-[10px] mt-1 text-indigo-300/80">
                      ステップ範囲設定を確認してください
                    </span>
                  )}
                </div>
              ) : (
                previewScenarios.map((scenarioChains, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-indigo-50 shadow-sm flex flex-col gap-2 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          #{idx + 1}
                        </div>
                        <span className="text-xs font-bold text-gray-600">
                          {scenarioChains.length} ノード
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:text-indigo-400 transition-colors" />
                    </div>

                    {/* Node List Badge */}
                    <div className="flex flex-wrap gap-1">
                      {scenarioChains.map(chainId => (
                        <span
                          key={chainId}
                          className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                        >
                          {chainId.replace('datachain-', 'DC-')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {disabled && (
        <p className="text-xs text-orange-500 mt-2 font-bold flex items-center justify-end">
          <Lock className="w-3 h-3 mr-1" />
          アップロード時は固定されます
        </p>
      )}
    </div>
  );
};

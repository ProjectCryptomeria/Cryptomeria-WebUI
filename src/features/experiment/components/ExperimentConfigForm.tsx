import React, { useState, useRef, useEffect } from 'react';
import { AllocatorStrategy, TransmitterStrategy, UserAccount, NodeStatus } from '../../../types';
import { Settings2, Box, Upload, Zap, Info, Server, Loader2, ChevronDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { RangeInput } from './RangeInput';
import { StrategyCard } from './StrategyCard';
import { ChainSelector } from './ChainSelector';
import { FileTreeViewer } from './FileTreeViewer';

interface ExperimentConfigFormProps {
  // Mode
  mode: 'virtual' | 'upload';
  setMode: (mode: 'virtual' | 'upload') => void;

  // Project & Account
  projectName: string;
  setProjectName: (name: string) => void;
  users: UserAccount[];
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;

  // File Upload
  uploadStats: { count: number; sizeMB: number; tree: any; treeOpen: boolean };
  setUploadStats: React.Dispatch<
    React.SetStateAction<{ count: number; sizeMB: number; tree: any; treeOpen: boolean }>
  >;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileProcess: (files: File[]) => void;

  // Numeric Parameters
  dataSizeParams: {
    mode: 'fixed' | 'range';
    fixed: number;
    range: { start: number; end: number; step: number };
  };
  setDataSizeParams: React.Dispatch<React.SetStateAction<any>>;
  chunkSizeParams: {
    mode: 'fixed' | 'range';
    fixed: number;
    range: { start: number; end: number; step: number };
  };
  setChunkSizeParams: React.Dispatch<React.SetStateAction<any>>;

  // Chain Selection
  nodes: NodeStatus[];
  deployedNodeCount: number;
  selectedChains: Set<string>;
  setSelectedChains: (chains: Set<string>) => void;
  chainMode: 'fixed' | 'range';
  setChainMode: (mode: 'fixed' | 'range') => void;
  chainRangeParams: { start: number; end: number; step: number };
  setChainRangeParams: (params: any) => void;

  // Strategies
  selectedAllocators: Set<AllocatorStrategy>;
  setSelectedAllocators: (s: Set<AllocatorStrategy>) => void;
  selectedTransmitters: Set<TransmitterStrategy>;
  setSelectedTransmitters: (s: Set<TransmitterStrategy>) => void;

  // Actions
  isGenerating: boolean;
  onGenerate: () => void;
}

export const ExperimentConfigForm: React.FC<ExperimentConfigFormProps> = ({
  mode,
  setMode,
  projectName,
  setProjectName,
  users,
  selectedUserId,
  setSelectedUserId,
  uploadStats,
  setUploadStats,
  fileInputRef,
  onFileProcess,
  dataSizeParams,
  setDataSizeParams,
  chunkSizeParams,
  setChunkSizeParams,
  nodes,
  deployedNodeCount,
  selectedChains,
  setSelectedChains,
  chainMode,
  setChainMode,
  chainRangeParams,
  setChainRangeParams,
  selectedAllocators,
  setSelectedAllocators,
  selectedTransmitters,
  setSelectedTransmitters,
  isGenerating,
  onGenerate,
}) => {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const selectedUser = users.find(u => u.id === selectedUserId);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (uploadStats.tree && treeContainerRef.current) {
      setTimeout(() => {
        treeContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [uploadStats.tree]);

  return (
    <div className="space-y-6 mb-10">
      {/* --- 基本設定セクション --- */}
      <Card className="overflow-hidden rounded-3xl shadow-soft border-gray-100">
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center tracking-tight">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-3 text-primary-indigo">
              <Settings2 className="w-5 h-5" />
            </div>
            基本設定
          </h2>
          <div className="bg-gray-100 p-1.5 rounded-xl flex text-sm font-bold">
            <button
              onClick={() => setMode('virtual')}
              className={`px-5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                mode === 'virtual'
                  ? 'bg-white shadow-sm text-primary-indigo'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              <Box className="w-4 h-4" /> 仮想データ
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`px-5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                mode === 'upload'
                  ? 'bg-white shadow-sm text-primary-indigo'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              <Upload className="w-4 h-4" /> アップロード
            </button>
          </div>
        </div>

        <div className="p-6">
          {mode === 'virtual' ? (
            <div className="flex items-start bg-blue-50 p-6 rounded-2xl border border-blue-100 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-1">仮想データ生成モード</h3>
                <p className="text-base text-blue-700 leading-relaxed opacity-90">
                  ランダムなバイナリデータを動的に生成して実験を行います。物理的なファイルの準備は不要です。
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div
                className={`upload-area rounded-3xl h-48 flex flex-col items-center justify-center cursor-pointer mb-6 group relative transition-all hover:bg-indigo-50/30 ${
                  uploadStats.count > 0 ? 'border-primary-indigo' : ''
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('drag-active');
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('drag-active');
                }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('drag-active');
                  if (e.dataTransfer.files) onFileProcess(Array.from(e.dataTransfer.files));
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={e => e.target.files && onFileProcess(Array.from(e.target.files))}
                  {...({ webkitdirectory: '' } as any)}
                />
                <div className="bg-white w-20 h-20 rounded-full shadow-lg mb-4 flex items-center justify-center text-primary-indigo group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-xl font-bold text-gray-700 pointer-events-none">
                  フォルダまたはファイルをドロップ
                </p>
                <p className="text-sm text-gray-400 mt-2 pointer-events-none font-medium">
                  ※Zipファイルは自動で展開されます
                </p>
              </div>

              {uploadStats.tree && (
                <div
                  ref={treeContainerRef}
                  className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden ring-4 ring-gray-50 transition-all duration-300"
                >
                  <div
                    className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setUploadStats(p => ({ ...p, treeOpen: !p.treeOpen }))}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-6 bg-primary-indigo rounded-full mr-3"></div>
                      <span className="text-lg font-bold text-gray-700">
                        解析されたディレクトリ構造
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-bold bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full border border-indigo-100">
                        {uploadStats.count} Files, {uploadStats.sizeMB} MB
                      </span>
                    </div>
                  </div>
                  <div
                    className={`transition-max-height duration-300 ease-in-out overflow-hidden ${
                      uploadStats.treeOpen ? 'max-h-80' : 'max-h-0'
                    }`}
                  >
                    <div className="p-4 pt-0 font-sans overflow-y-auto max-h-80 custom-scrollbar">
                      <FileTreeViewer tree={uploadStats.tree} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* --- パラメータ設定セクション --- */}
      <Card className="rounded-3xl shadow-soft border-gray-100">
        <div className="bg-white px-6 py-5 border-b border-gray-100 rounded-t-3xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center tracking-tight">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3 text-primary-green">
              <Zap className="w-5 h-5" />
            </div>
            実験シナリオパラメータ
          </h2>
        </div>
        <div className="p-6 space-y-8">
          {/* Project & Account */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2 ml-1">
                プロジェクト名
              </label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3.5 focus:ring-2 focus:ring-primary-indigo focus:bg-white outline-none transition-all text-base font-medium shadow-sm"
              />
            </div>
            <div className="relative">
              <label className="block text-base font-bold text-gray-700 mb-2 ml-1">
                実行アカウント
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="w-full text-left bg-white border border-gray-200 rounded-xl p-3.5 flex justify-between items-center hover:border-primary-indigo transition-all shadow-sm"
                >
                  <span className="block truncate text-gray-700 font-medium">
                    {selectedUser
                      ? `${selectedUser.name} (${selectedUser.balance.toFixed(2)} TKN)`
                      : 'アカウントを選択...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {isAccountDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                    {users.map(u => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setIsAccountDropdownOpen(false);
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedUserId === u.id ? 'bg-indigo-50 text-primary-indigo' : ''
                        }`}
                      >
                        <div className="font-bold text-gray-800">{u.name}</div>
                        <div className="text-xs font-mono text-gray-500 mt-0.5">
                          {u.balance.toFixed(2)} TKN
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <hr className="border-gray-100" />

          {/* Numeric Parameters (2カラムに変更) */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center ml-1">
              <div className="w-1 h-4 bg-gray-300 mr-2 rounded-full"></div> 数値設定
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <RangeInput
                label="データサイズ"
                type="data-size"
                unit="MB"
                fixedValue={dataSizeParams.fixed}
                rangeParams={dataSizeParams.range}
                isRange={dataSizeParams.mode === 'range'}
                disabled={mode === 'upload'}
                onChangeFixed={v => setDataSizeParams(p => ({ ...p, fixed: v }))}
                onChangeRange={(k, v) =>
                  setDataSizeParams(p => ({ ...p, range: { ...p.range, [k]: v } }))
                }
                onToggleRange={() =>
                  setDataSizeParams(p => ({
                    ...p,
                    mode: p.mode === 'fixed' ? 'range' : 'fixed',
                  }))
                }
              />
              <RangeInput
                label="チャンクサイズ"
                type="chunk-size"
                unit="KB"
                fixedValue={chunkSizeParams.fixed}
                rangeParams={chunkSizeParams.range}
                isRange={chunkSizeParams.mode === 'range'}
                onChangeFixed={v => setChunkSizeParams(p => ({ ...p, fixed: v }))}
                onChangeRange={(k, v) =>
                  setChunkSizeParams(p => ({ ...p, range: { ...p.range, [k]: v } }))
                }
                onToggleRange={() =>
                  setChunkSizeParams(p => ({
                    ...p,
                    mode: p.mode === 'fixed' ? 'range' : 'fixed',
                  }))
                }
              />
            </div>

            {/* Datachain Selection (別セクションとして配置) */}
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center ml-1">
              <div className="w-1 h-4 bg-gray-300 mr-2 rounded-full"></div> Datachain設定
            </h3>
            <ChainSelector
              nodes={nodes}
              selectedChains={selectedChains}
              setSelectedChains={setSelectedChains}
              chainRangeParams={chainRangeParams}
              setChainRangeParams={setChainRangeParams}
              mode={chainMode}
              setMode={setChainMode}
              disabled={mode === 'upload'}
            />
          </div>

          {/* Strategies */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center ml-1">
              <div className="w-1 h-4 bg-gray-300 mr-2 rounded-full"></div> 配布・送信戦略
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide ml-1">
                  Allocator Strategy
                </label>
                <div className="space-y-4">
                  <StrategyCard
                    label="Round Robin"
                    description="分散アルゴリズム"
                    selected={selectedAllocators.has(AllocatorStrategy.ROUND_ROBIN)}
                    onClick={() => {
                      const s = new Set(selectedAllocators);
                      s.has(AllocatorStrategy.ROUND_ROBIN) && s.size > 1
                        ? s.delete(AllocatorStrategy.ROUND_ROBIN)
                        : s.add(AllocatorStrategy.ROUND_ROBIN);
                      setSelectedAllocators(s);
                    }}
                  />
                  <StrategyCard
                    label="Available"
                    description="空き容量ベース"
                    selected={selectedAllocators.has(AllocatorStrategy.AVAILABLE)}
                    onClick={() => {
                      const s = new Set(selectedAllocators);
                      s.has(AllocatorStrategy.AVAILABLE) && s.size > 1
                        ? s.delete(AllocatorStrategy.AVAILABLE)
                        : s.add(AllocatorStrategy.AVAILABLE);
                      setSelectedAllocators(s);
                    }}
                  />
                  <StrategyCard
                    label="Random"
                    description="ランダム分散"
                    selected={selectedAllocators.has(AllocatorStrategy.RANDOM)}
                    onClick={() => {
                      const s = new Set(selectedAllocators);
                      s.has(AllocatorStrategy.RANDOM) && s.size > 1
                        ? s.delete(AllocatorStrategy.RANDOM)
                        : s.add(AllocatorStrategy.RANDOM);
                      setSelectedAllocators(s);
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide ml-1">
                  Transmitter Strategy
                </label>
                <div className="space-y-4">
                  <StrategyCard
                    label="One By One"
                    description="1つずつ順次送信"
                    selected={selectedTransmitters.has(TransmitterStrategy.ONE_BY_ONE)}
                    onClick={() => {
                      const s = new Set(selectedTransmitters);
                      s.has(TransmitterStrategy.ONE_BY_ONE) && s.size > 1
                        ? s.delete(TransmitterStrategy.ONE_BY_ONE)
                        : s.add(TransmitterStrategy.ONE_BY_ONE);
                      setSelectedTransmitters(s);
                    }}
                  />
                  <StrategyCard
                    label="Multi Burst"
                    description="並列バースト送信"
                    selected={selectedTransmitters.has(TransmitterStrategy.MULTI_BURST)}
                    onClick={() => {
                      const s = new Set(selectedTransmitters);
                      s.has(TransmitterStrategy.MULTI_BURST) && s.size > 1
                        ? s.delete(TransmitterStrategy.MULTI_BURST)
                        : s.add(TransmitterStrategy.MULTI_BURST);
                      setSelectedTransmitters(s);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 pb-2">
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full bg-primary-green hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center text-xl tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
              ) : (
                <Zap className="w-6 h-6 mr-3" />
              )}{' '}
              シナリオを作成
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

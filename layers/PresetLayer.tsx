
import React, { useState } from 'react';
import { ExperimentPreset, AllocatorStrategy, TransmitterStrategy } from '../types';
import { Trash2, FileText, Clock, Settings2, X, Database, Puzzle, Network, AlertTriangle, ArrowRight, Layers, Hash, ChevronDown, ChevronUp, Monitor } from 'lucide-react';
import { Card, SlideOver, Badge, Modal, ModalHeader } from '../components/Shared';

interface PresetLayerProps {
    presets: ExperimentPreset[];
    onDeletePreset: (id: string) => void;
}

const PresetLayer: React.FC<PresetLayerProps> = ({ presets, onDeletePreset }) => {
    const [selectedPreset, setSelectedPreset] = useState<ExperimentPreset | null>(null);
    
    // 削除モーダル用ステート
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        setDeleteTargetId(id);
    };

    const confirmDelete = () => {
        if (deleteTargetId) {
            onDeletePreset(deleteTargetId);
            if (selectedPreset?.id === deleteTargetId) {
                setSelectedPreset(null);
            }
            setDeleteTargetId(null);
        }
    };

    const getSizeDisplay = (preset: ExperimentPreset) => preset.generatorState ? (preset.generatorState.dataSize.mode === 'range' ? `${preset.generatorState.dataSize.start}-${preset.generatorState.dataSize.end}MB` : `${preset.generatorState.dataSize.fixed}MB`) : `${preset.config.virtualConfig?.sizeMB || 0}MB`;
    const getChunkDisplay = (preset: ExperimentPreset) => preset.generatorState ? (preset.generatorState.chunkSize.mode === 'range' ? `${preset.generatorState.chunkSize.start}-${preset.generatorState.chunkSize.end}KB` : `${preset.generatorState.chunkSize.fixed}KB`) : `${preset.config.virtualConfig?.chunkSizeKB}KB`;
    const getChainCount = (preset: ExperimentPreset) => preset.generatorState ? preset.generatorState.selectedChains.length : preset.config.targetChains.length;

    // 詳細表示用のヘルパーコンポーネント
    const DetailRow = ({ label, value, icon: Icon, subValue }: { label: string, value: React.ReactNode, icon?: any, subValue?: string }) => (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
                {Icon && <div className="p-2 bg-white rounded-md shadow-sm text-slate-500"><Icon className="w-4 h-4" /></div>}
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                    {subValue && <div className="text-[10px] text-slate-400">{subValue}</div>}
                </div>
            </div>
            <div className="font-mono font-bold text-slate-700 text-sm">{value}</div>
        </div>
    );

    const RangeVisualizer = ({ label, start, end, step, unit }: { label: string, start: number, end: number, step: number, unit: string }) => (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {label} Range
                </span>
                <span className="text-xs font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Step: {step}{unit}</span>
            </div>
            <div className="flex items-center justify-between font-mono font-bold text-slate-700 relative z-10">
                <div className="flex flex-col items-center">
                    <span className="text-lg">{start}</span>
                    <span className="text-[10px] text-slate-400">{unit}</span>
                </div>
                <div className="flex-1 mx-4 h-1 bg-slate-200 rounded-full relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-300 to-indigo-500 opacity-50 rounded-full"></div>
                    <ArrowRight className="w-4 h-4 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-lg">{end}</span>
                    <span className="text-[10px] text-slate-400">{unit}</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteTargetId} onClose={() => setDeleteTargetId(null)} className="max-w-sm w-full p-6">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">プリセットを削除しますか？</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        この操作は取り消せません。<br/>保存された設定データは完全に削除されます。
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setDeleteTargetId(null)}
                            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                        >
                            キャンセル
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm shadow-red-200"
                        >
                            削除実行
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="h-full flex gap-8">
                <div className="flex-1 flex flex-col space-y-8 overflow-hidden">
                    <Card className="p-6 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Settings2 className="w-6 h-6" /></div>保存済みプリセット一覧</h2>
                        <Badge color="slate">{presets.length} Presets</Badge>
                    </Card>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 p-1">
                        {presets.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <FileText className="w-12 h-12 mb-3 opacity-50" />
                                <p>保存されたプリセットはありません</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 content-start items-stretch">
                                {presets.map(preset => (
                                    <Card 
                                        key={preset.id} 
                                        onClick={() => setSelectedPreset(preset)} 
                                        className={`p-5 h-full group hover:shadow-md transition-all cursor-pointer relative flex flex-col justify-between ${selectedPreset?.id === preset.id ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-slate-200'}`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${selectedPreset?.id === preset.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}><FileText className="w-5 h-5" /></div>
                                                    <div className="min-w-0">
                                                        <h3 className={`font-bold text-lg truncate ${selectedPreset?.id === preset.id ? 'text-blue-700' : 'text-slate-800'}`} title={preset.name}>{preset.name}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500"><Clock className="w-3 h-3" />{new Date(preset.lastModified).toLocaleString('ja-JP')}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => handleDeleteClick(e, preset.id)} 
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20 relative shadow-sm" 
                                                    title="削除"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-4 pl-1">
                                                <Badge className="flex items-center gap-1"><Database className="w-3 h-3 text-blue-500"/>{getSizeDisplay(preset)}</Badge>
                                                <Badge className="flex items-center gap-1"><Puzzle className="w-3 h-3 text-purple-500"/>{getChunkDisplay(preset)}</Badge>
                                                <Badge className="flex items-center gap-1"><Monitor className="w-3 h-3 text-emerald-500"/>{getChainCount(preset)} Chains</Badge>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* リッチな詳細パネル */}
                <SlideOver isOpen={!!selectedPreset} title="Preset Details" onClose={() => setSelectedPreset(null)} width="w-[500px]">
                    {selectedPreset && (
                        <div className="flex flex-col h-full">
                            {/* Header Banner */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shrink-0">
                                <div className="flex items-center gap-3 mb-2 opacity-80">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs font-mono tracking-wider uppercase">Preset Configuration</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2 leading-tight">{selectedPreset.name}</h2>
                                <div className="flex items-center gap-4 text-xs font-mono opacity-60">
                                    <span>ID: {selectedPreset.id.substring(0, 8)}...</span>
                                    <span>Updated: {new Date(selectedPreset.lastModified).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="p-6 space-y-8 flex-1 overflow-y-auto custom-scrollbar bg-white">
                                {/* Summary Grid */}
                                <section>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Hash className="w-4 h-4"/> Overview Stats</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                            <div className="text-blue-600 mb-1 flex justify-center"><Database className="w-5 h-5" /></div>
                                            <div className="text-xs text-slate-500 font-bold uppercase mb-0.5">Size</div>
                                            <div className="font-bold text-slate-800 text-sm">{getSizeDisplay(selectedPreset)}</div>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-center">
                                            <div className="text-purple-600 mb-1 flex justify-center"><Puzzle className="w-5 h-5" /></div>
                                            <div className="text-xs text-slate-500 font-bold uppercase mb-0.5">Chunk</div>
                                            <div className="font-bold text-slate-800 text-sm">{getChunkDisplay(selectedPreset)}</div>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                            <div className="text-emerald-600 mb-1 flex justify-center"><Monitor className="w-5 h-5" /></div>
                                            <div className="text-xs text-slate-500 font-bold uppercase mb-0.5">Targets</div>
                                            <div className="font-bold text-slate-800 text-sm">{getChainCount(selectedPreset)} Nodes</div>
                                        </div>
                                    </div>
                                </section>

                                {/* Configuration Details */}
                                <section className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Settings2 className="w-4 h-4"/> Configuration</h4>
                                    
                                    <DetailRow 
                                        label="Data Source" 
                                        value={selectedPreset.config.uploadType} 
                                        icon={FileText} 
                                        subValue={selectedPreset.config.uploadType === 'Virtual' ? 'Generated on-the-fly' : 'Physical files'}
                                    />

                                    {/* Range Visualization or Fixed Value */}
                                    {selectedPreset.generatorState?.dataSize.mode === 'range' ? (
                                        <RangeVisualizer 
                                            label="Data Size" 
                                            start={selectedPreset.generatorState.dataSize.start} 
                                            end={selectedPreset.generatorState.dataSize.end} 
                                            step={selectedPreset.generatorState.dataSize.step} 
                                            unit="MB" 
                                        />
                                    ) : (
                                        <DetailRow label="Data Size (Fixed)" value={`${selectedPreset.generatorState?.dataSize.fixed} MB`} icon={Database} />
                                    )}

                                    {selectedPreset.generatorState?.chunkSize.mode === 'range' ? (
                                        <RangeVisualizer 
                                            label="Chunk Size" 
                                            start={selectedPreset.generatorState.chunkSize.start} 
                                            end={selectedPreset.generatorState.chunkSize.end} 
                                            step={selectedPreset.generatorState.chunkSize.step} 
                                            unit="KB" 
                                        />
                                    ) : (
                                        <DetailRow label="Chunk Size (Fixed)" value={`${selectedPreset.generatorState?.chunkSize.fixed} KB`} icon={Puzzle} />
                                    )}
                                </section>

                                {/* Strategies */}
                                <section>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Network className="w-4 h-4"/> Strategies</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors group">
                                            <div className="text-xs text-slate-400 font-bold uppercase mb-2">Allocator</div>
                                            <div className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{selectedPreset.config.allocator}</div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-200 hover:border-purple-400 transition-colors group">
                                            <div className="text-xs text-slate-400 font-bold uppercase mb-2">Transmitter</div>
                                            <div className="text-lg font-bold text-slate-800 group-hover:text-purple-600 transition-colors">{selectedPreset.config.transmitter}</div>
                                        </div>
                                    </div>
                                </section>

                                {/* Target Chains */}
                                <section>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Monitor className="w-4 h-4"/> Target Chains</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedPreset.generatorState?.selectedChains || selectedPreset.config.targetChains).map(chain => (
                                            <span key={chain} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-mono border border-slate-200">
                                                {chain}
                                            </span>
                                        ))}
                                    </div>
                                </section>

                                {/* Raw Config (Collapsible) */}
                                <section className="pt-4 border-t border-slate-100">
                                    <details className="group">
                                        <summary className="flex items-center justify-between cursor-pointer list-none text-slate-400 hover:text-slate-600 transition-colors">
                                            <span className="text-xs font-bold uppercase">Developer Raw Config</span>
                                            <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                                        </summary>
                                        <div className="mt-3 bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner border border-slate-700">
                                            <pre className="text-[10px] font-mono text-slate-300 leading-relaxed">
                                                {JSON.stringify(selectedPreset.generatorState || selectedPreset.config, null, 2)}
                                            </pre>
                                        </div>
                                    </details>
                                </section>
                            </div>
                        </div>
                    )}
                </SlideOver>
            </div>
        </>
    );
};

export default PresetLayer;

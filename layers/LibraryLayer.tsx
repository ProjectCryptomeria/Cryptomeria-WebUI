
import React, { useState, useMemo } from 'react';
import { ExperimentResult, SortConfig, FilterCondition, AllocatorStrategy, TransmitterStrategy } from '../types';
import { Download, Filter, Search, FileText, AlertTriangle, CheckCircle, Clock, X, Database, Server, Network, ChevronDown, ChevronUp, Trash2, Copy, FileJson, FileSpreadsheet } from 'lucide-react';
import { Card, Modal, ModalHeader, Badge, StatusBadge } from '../components/Shared';

interface LibraryLayerProps {
    results: ExperimentResult[];
    onDeleteResult: (id: string) => void;
}

const LibraryLayer: React.FC<LibraryLayerProps> = ({ results, onDeleteResult }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [viewDetailResult, setViewDetailResult] = useState<ExperimentResult | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportFilename, setExportFilename] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'executedAt', direction: 'desc' });
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSort = (key: keyof ExperimentResult) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
  const addFilter = (key: keyof ExperimentResult, value: string, labelPrefix: string) => { if (!filters.some(f => f.key === key && f.value === value)) { setFilters([...filters, { key, value, label: `${labelPrefix}: ${value}` }]); setIsFilterMenuOpen(false); }};
  const removeFilter = (index: number) => setFilters(filters.filter((_, i) => i !== index));
  
  const handleDeleteClick = () => {
      if (selectedResultId) setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
      if (selectedResultId) {
          onDeleteResult(selectedResultId);
          setSelectedResultId(null);
          setShowDeleteConfirm(false);
      }
  };

  const handleOpenExport = () => { if (!selectedResultId) return; const r = results.find(x => x.id === selectedResultId); if(r) { setExportFilename(`${r.id}-${new Date(r.executedAt).toISOString().replace(/[:.]/g, '-')}`); setIsExportModalOpen(true); }};
  
  const getExportContent = () => {
      const r = results.find(x => x.id === selectedResultId);
      if (!r) return "";
      if (exportFormat === 'json') return JSON.stringify(r, null, 2);
      const headers = Object.keys(r).join(',');
      const values = Object.values(r).map(v => typeof v === 'object' ? JSON.stringify(v).replace(/"/g, '""') : `"${v}"`).join(',');
      return `${headers}\n${values}`;
  };

  const processedResults = useMemo(() => {
      let data = [...results];
      if (searchTerm) data = data.filter(r => r.scenarioName.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase()));
      if (filters.length > 0) data = data.filter(item => filters.every(cond => String(item[cond.key]) === cond.value));
      data.sort((a, b) => { const av = a[sortConfig.key], bv = b[sortConfig.key]; return av === undefined || bv === undefined ? 0 : av < bv ? (sortConfig.direction === 'asc' ? -1 : 1) : (sortConfig.direction === 'asc' ? 1 : -1); });
      return data;
  }, [results, searchTerm, filters, sortConfig]);

  const SortIcon = ({ columnKey }: { columnKey: keyof ExperimentResult }) => sortConfig.key !== columnKey ? <span className="w-4 h-4 opacity-0 ml-1">↕</span> : sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative h-full flex flex-col">
        {/* Delete Confirmation Modal */}
        <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} className="max-w-sm w-full p-6">
            <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">完全に削除しますか？</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    この操作は取り消せません。実験結果ログは完全に削除されます。
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                    >
                        キャンセル
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm shadow-red-200"
                    >
                        削除
                    </button>
                </div>
            </div>
        </Modal>

        <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} className="max-w-lg w-full p-6">
            <ModalHeader title="データエクスポート" icon={Download} iconColor="text-blue-600" onClose={() => setIsExportModalOpen(false)} />
            <div className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">出力ファイル名</label><input type="text" value={exportFilename} onChange={(e) => setExportFilename(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" /></div>
                <div className="flex gap-4"><label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer"><input type="radio" name="format" value="csv" checked={exportFormat === 'csv'} onChange={() => setExportFormat('csv')} className="hidden" /><FileSpreadsheet className="w-4 h-4" />CSV</label><label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer"><input type="radio" name="format" value="json" checked={exportFormat === 'json'} onChange={() => setExportFormat('json')} className="hidden" /><FileJson className="w-4 h-4" />JSON</label></div>
                <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 max-h-40 overflow-y-auto font-mono text-xs text-slate-600 custom-scrollbar whitespace-pre-wrap break-all">{getExportContent()}</div>
                <div className="grid grid-cols-2 gap-3 pt-2"><button onClick={() => { navigator.clipboard.writeText(getExportContent()); alert('コピーしました'); }} className="py-2 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium flex items-center justify-center gap-2"><Copy className="w-4 h-4" />コピー</button><button onClick={() => { alert('ダウンロード開始'); setIsExportModalOpen(false); }} className="py-2 px-4 bg-emerald-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"><Download className="w-4 h-4" />エクスポート</button></div>
            </div>
        </Modal>

        {/* Detail Modal - Fixed Header Padding for p-0 Modal */}
        <Modal isOpen={!!viewDetailResult} onClose={() => setViewDetailResult(null)} className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl">
             {viewDetailResult && (
                <div className="flex flex-col max-h-[90vh]">
                    {/* Fixed Header Styling with explicit padding */}
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-slate-800 tracking-tight">{viewDetailResult.scenarioName}</div>
                                <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {viewDetailResult.id}</div>
                            </div>
                        </div>
                        <button onClick={() => setViewDetailResult(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-white">
                        {/* Basic Info Section */}
                        <section>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">基本情報</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 mb-1 font-bold">実行日時</div>
                                    <div className="font-mono text-sm font-medium text-slate-700">{new Date(viewDetailResult.executedAt).toLocaleString()}</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="text-xs text-slate-500 mb-1 font-bold">ステータス</div>
                                    <StatusBadge status={viewDetailResult.status} />
                                </div>
                            </div>
                        </section>

                        {/* Settings Section */}
                        <section>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">設定パラメータ</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between items-center p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors rounded-lg">
                                    <span className="text-sm text-slate-500 font-medium">データサイズ</span>
                                    <span className="font-mono font-bold text-slate-800 text-lg">{viewDetailResult.dataSizeMB} <span className="text-sm font-normal text-slate-400">MB</span></span>
                                </div>
                                <div className="flex justify-between items-center p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors rounded-lg">
                                    <span className="text-sm text-slate-500 font-medium">チャンクサイズ</span>
                                    <span className="font-mono font-bold text-slate-800 text-lg">{viewDetailResult.chunkSizeKB} <span className="text-sm font-normal text-slate-400">KB</span></span>
                                </div>
                                <div className="flex justify-between items-center p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors rounded-lg">
                                    <span className="text-sm text-slate-500 font-medium">Allocator</span>
                                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{viewDetailResult.allocator}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors rounded-lg">
                                    <span className="text-sm text-slate-500 font-medium">Transmitter</span>
                                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{viewDetailResult.transmitter}</span>
                                </div>
                            </div>
                        </section>

                        {/* Performance Section */}
                        <section className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                                <Clock className="w-4 h-4 text-blue-500" /> パフォーマンス指標
                            </h4>
                            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-blue-200/50">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Upload Time</div>
                                    <div className="font-mono font-bold text-xl text-slate-800">{(viewDetailResult.uploadTimeMs/1000).toFixed(2)}<span className="text-sm ml-1 font-medium text-slate-500">s</span></div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Download Time</div>
                                    <div className="font-mono font-bold text-xl text-slate-800">{(viewDetailResult.downloadTimeMs/1000).toFixed(2)}<span className="text-sm ml-1 font-medium text-slate-500">s</span></div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Throughput</div>
                                    <div className="font-mono font-bold text-xl text-blue-600">{(viewDetailResult.throughputBps/1024/1024).toFixed(2)}<span className="text-sm ml-1 font-medium text-blue-400">Mbps</span></div>
                                </div>
                            </div>
                        </section>
                    </div>
                    
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
                        <button onClick={() => setViewDetailResult(null)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
                            閉じる
                        </button>
                    </div>
                </div>
             )}
        </Modal>

        <Card className="p-4 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" /><input type="text" placeholder="検索..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <div className="flex gap-2 relative">
                    <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"><Filter className="w-4 h-4" />フィルター</button>
                    {isFilterMenuOpen && <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-20 p-2 animate-in fade-in zoom-in-95 duration-200">{['SUCCESS', 'FAILED'].map(s => <button key={s} onClick={() => addFilter('status', s, 'Status')} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-50 rounded transition-colors">{s}</button>)}</div>}
                    {selectedResultId && <><button onClick={handleDeleteClick} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" />削除</button><button onClick={handleOpenExport} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"><Download className="w-4 h-4" />エクスポート</button></>}
                </div>
            </div>
            {filters.length > 0 && <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">{filters.map((f, idx) => <Badge key={idx} color="blue" className="flex items-center gap-1">{f.label}<button onClick={() => removeFilter(idx)}><X className="w-3 h-3" /></button></Badge>)}<button onClick={() => setFilters([])} className="text-xs text-slate-400 underline hover:text-slate-600">クリア</button></div>}
        </Card>

        <Card className="overflow-hidden flex-1 flex flex-col border-slate-200 shadow-sm">
            <div className="overflow-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                        <tr>{['executedAt', 'scenarioName', 'status', 'allocator', 'dataSizeMB', 'throughputBps'].map(k => <th key={k} className="px-6 py-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort(k as keyof ExperimentResult)}><div className="flex items-center gap-1">{k} <SortIcon columnKey={k as keyof ExperimentResult} /></div></th>)}<th className="px-6 py-3 text-right">詳細</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {processedResults.map(r => (
                            <tr key={r.id} onClick={() => setSelectedResultId(r.id === selectedResultId ? null : r.id)} className={`group transition-colors cursor-pointer ${selectedResultId === r.id ? 'bg-blue-50/60 border-l-4 border-blue-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
                                <td className="px-6 py-4"><div className="font-mono font-medium text-slate-700">{r.id}</div><div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{new Date(r.executedAt).toLocaleString()}</div></td>
                                <td className="px-6 py-4 font-medium text-slate-800">{r.scenarioName}</td>
                                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                                <td className="px-6 py-4 text-slate-600 text-xs"><div className="font-medium">{r.allocator}</div><div className="text-slate-400">{r.transmitter}</div></td>
                                <td className="px-6 py-4 font-mono text-slate-600">{r.dataSizeMB} MB</td>
                                <td className="px-6 py-4 font-mono font-bold text-slate-800">{(r.throughputBps/1024/1024).toFixed(2)} Mbps</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setViewDetailResult(r); }} 
                                        className="text-slate-400 hover:text-blue-600 p-3 hover:bg-blue-100 rounded-full transition-all"
                                        title="詳細を表示"
                                    >
                                        <FileText className="w-6 h-6" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
  );
};

export default LibraryLayer;

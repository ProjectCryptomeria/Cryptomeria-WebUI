import React, { useState } from 'react';
import { ExperimentResult } from '@/entities/result';
import { Download, Trash2, Copy, FileJson, FileSpreadsheet, Library } from 'lucide-react';
import { Modal, ModalHeader } from '@/shared/ui/Modal';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useTableFilterSort } from '@/features/library/hooks/useTableFilterSort';
import { useGlobalStore } from '@/shared/store';

// 切り出したコンポーネントのインポート
import { ResultToolbar } from '@/features/library/components/ResultToolbar';
import { ResultTable } from '@/features/library/components/ResultTable';
import { DetailViewModal } from '@/features/library/components/DetailViewModal';

/**
 * Library Layer
 *
 * 過去の実験結果をリスト表示し、検索・フィルタリング・エクスポートを行う画面。
 * 3つのコンポーネント（Toolbar, Table, DetailModal）に分割されています。
 */
const LibraryLayer: React.FC = () => {
  const { results, deleteResult } = useGlobalStore();

  // Custom Hook for Table Logic
  const {
    processedData: processedResults,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    filters,
    addFilter,
    removeFilter,
  } = useTableFilterSort(results, { key: 'executedAt', direction: 'desc' });

  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [viewDetailResult, setViewDetailResult] = useState<ExperimentResult | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportFilename, setExportFilename] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    if (selectedResultId) setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedResultId) {
      deleteResult(selectedResultId);
      setSelectedResultId(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleOpenExport = () => {
    if (!selectedResultId) return;
    const r = results.find(x => x.id === selectedResultId);
    if (r) {
      setExportFilename(`${r.id}-${new Date(r.executedAt).toISOString().replace(/[:.]/g, '-')}`);
      setIsExportModalOpen(true);
    }
  };

  const getExportContent = () => {
    const r = results.find(x => x.id === selectedResultId);
    if (!r) return '';
    if (exportFormat === 'json') return JSON.stringify(r, null, 2);
    const headers = Object.keys(r).join(',');
    const values = Object.values(r)
      .map(v => (typeof v === 'object' ? JSON.stringify(v).replace(/"/g, '""') : `"${v}"`))
      .join(',');
    return `${headers}\n${values}`;
  };

  return (
    <div className="space-y-6 pb-20 h-full flex flex-col">
      <PageHeader
        title="Result Archive"
        description="過去の実験データの閲覧、分析、エクスポート"
        icon={Library}
        iconColor="text-purple-500"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        className="max-w-sm w-full p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">レコード削除</h3>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">
          この実験結果ログは完全に削除されます。
          <br />
          元に戻すことはできません。
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            キャンセル
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            削除する
          </Button>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        className="max-w-lg w-full"
      >
        <ModalHeader
          title="Export Data"
          icon={Download}
          iconColor="text-blue-600"
          onClose={() => setIsExportModalOpen(false)}
        />
        <div className="p-6 pt-0 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              ファイル名
            </label>
            <Input value={exportFilename} onChange={e => setExportFilename(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <label
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${exportFormat === 'csv' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <input
                type="radio"
                name="format"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={() => setExportFormat('csv')}
                className="hidden"
              />
              <FileSpreadsheet className="w-5 h-5" />
              <span className="font-bold">CSV</span>
            </label>
            <label
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${exportFormat === 'json' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <input
                type="radio"
                name="format"
                value="json"
                checked={exportFormat === 'json'}
                onChange={() => setExportFormat('json')}
                className="hidden"
              />
              <FileJson className="w-5 h-5" />
              <span className="font-bold">JSON</span>
            </label>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 max-h-40 overflow-y-auto font-mono text-xs text-slate-300 custom-scrollbar whitespace-pre-wrap break-all shadow-inner">
            {getExportContent()}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(getExportContent());
                alert('コピーしました');
              }}
              icon={Copy}
            >
              クリップボードにコピー
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('ダウンロード開始');
                setIsExportModalOpen(false);
              }}
              icon={Download}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
            >
              ダウンロード
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail View Modal */}
      <DetailViewModal result={viewDetailResult} onClose={() => setViewDetailResult(null)} />

      {/* Main Toolbar */}
      <ResultToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        selectedResultId={selectedResultId}
        onDeleteClick={handleDeleteClick}
        onExportClick={handleOpenExport}
      />

      {/* Result Table */}
      <ResultTable
        results={processedResults}
        sortConfig={sortConfig}
        onSort={handleSort}
        selectedResultId={selectedResultId}
        onSelect={setSelectedResultId}
        onViewDetail={setViewDetailResult}
      />
    </div>
  );
};

export default LibraryLayer;

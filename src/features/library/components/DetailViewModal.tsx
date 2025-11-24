import React from 'react';
import { ExperimentResult } from '@/entities/result';
import { FileText, Clock, Coins } from 'lucide-react';
import { Modal, ModalHeader } from '@/shared/ui/Modal';
import { StatusBadge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

interface DetailViewModalProps {
  result: ExperimentResult | null;
  onClose: () => void;
}

export const DetailViewModal: React.FC<DetailViewModalProps> = ({ result, onClose }) => {
  return (
    <Modal
      isOpen={!!result}
      onClose={onClose}
      className="max-w-5xl w-full p-0 overflow-hidden max-h-[90vh] flex flex-col"
    >
      {result && (
        <div className="flex flex-col h-full">
          <div className="shrink-0">
            <ModalHeader
              title={result.scenarioName}
              subTitle={`ID: ${result.id}`}
              icon={FileText}
              iconColor="text-blue-500"
              onClose={onClose}
            />
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar bg-white flex-1">
            {/* Grid Layout: 左右2カラムに分割 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* --- Left Column: Information --- */}
              <div className="space-y-6">
                {/* Basic Info Section */}
                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                    基本情報
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div className="text-xs text-slate-400 font-bold uppercase">実行日時</div>
                      <div className="font-mono text-sm font-bold text-slate-700">
                        {new Date(result.executedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div className="text-xs text-slate-400 font-bold uppercase">ステータス</div>
                      <StatusBadge status={result.status} />
                    </div>
                  </div>
                </section>

                {/* Settings Section */}
                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                    実行パラメータ
                  </h4>
                  <div className="grid grid-cols-1 gap-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    {[
                      { l: 'データサイズ', v: `${result.dataSizeMB} MB` },
                      { l: 'チャンクサイズ', v: `${result.chunkSizeKB} KB` },
                      { l: 'アロケータ', v: result.allocator },
                      { l: 'トランスミッタ', v: result.transmitter },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 border-b border-slate-200/50 last:border-0"
                      >
                        <span className="text-sm text-slate-500 font-medium">{item.l}</span>
                        <span className="font-bold text-slate-700">{item.v}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* --- Right Column: Metrics --- */}
              <div className="space-y-6 flex flex-col">
                {/* Economic Metrics Section */}
                <section className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100 h-full flex flex-col">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
                    <Coins className="w-4 h-4" /> 経済コスト
                  </h4>
                  <div className="grid grid-cols-2 gap-4 flex-1 content-center">
                    <div className="col-span-2 bg-white/60 p-4 rounded-2xl border border-amber-100/50 text-center">
                      <div className="text-xs text-slate-500 mb-1 font-medium">Fee (Total)</div>
                      <div className="font-mono font-bold text-2xl text-amber-600">
                        {result.actualFee !== undefined
                          ? `${result.actualFee.toLocaleString()}`
                          : '-'}
                        <span className="text-sm text-amber-400 ml-1">TKN</span>
                      </div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-2xl border border-amber-100/50 text-center">
                      <div className="text-xs text-slate-500 mb-1 font-medium">Gas Used</div>
                      <div className="font-mono font-bold text-lg text-slate-700">
                        {result.gasUsed !== undefined ? result.gasUsed.toLocaleString() : '-'}
                      </div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-2xl border border-amber-100/50 text-center">
                      <div className="text-xs text-slate-500 mb-1 font-medium">Base Fee</div>
                      <div className="font-mono font-bold text-lg text-slate-700">
                        {result.baseFee !== undefined ? result.baseFee.toFixed(5) : '-'}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Performance Section */}
                <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-3xl border border-blue-100 shadow-inner h-full flex flex-col">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
                    <Clock className="w-4 h-4" /> パフォーマンスメトリクス
                  </h4>
                  <div className="grid grid-cols-1 gap-3 flex-1 content-center">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-blue-100/50">
                      <div className="text-xs text-slate-500 font-medium">アップロード時間</div>
                      <div className="font-mono font-bold text-lg text-slate-800">
                        {(result.uploadTimeMs / 1000).toFixed(2)}s
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-blue-100/50">
                      <div className="text-xs text-slate-500 font-medium">ダウンロード時間</div>
                      <div className="font-mono font-bold text-lg text-slate-800">
                        {(result.downloadTimeMs / 1000).toFixed(2)}s
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl border border-blue-100/50">
                      <div className="text-xs text-slate-500 font-medium">スループット</div>
                      <div className="font-mono font-bold text-lg text-blue-600">
                        {(result.throughputBps / 1024 / 1024).toFixed(2)}
                        <span className="text-xs ml-1">Mbps</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
            <Button variant="secondary" onClick={onClose}>
              閉じる
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

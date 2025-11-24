import React from 'react';
import { ExperimentResult, SortConfig } from '@/entities/result';
import { ChevronDown, ChevronUp, Clock, FileText } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Badge, StatusBadge } from '@/shared/ui/Badge';
import { TableStyles } from '@/shared/ui/Table';

interface ResultTableProps {
  results: ExperimentResult[];
  sortConfig: SortConfig;
  onSort: (key: keyof ExperimentResult) => void;
  selectedResultId: string | null;
  onSelect: (id: string | null) => void;
  onViewDetail: (result: ExperimentResult) => void;
}

// AllocatorとTransmitterのバッジ表示用コンポーネント
const StrategyBadge = ({ value }: { value: string }) => (
  <Badge
    color="slate"
    className="font-mono bg-slate-100 text-slate-700 border-slate-200 justify-center w-20 text-center px-1 py-1"
  >
    {value}
  </Badge>
);

// ソートアイコンコンポーネント
const SortIcon = ({
  columnKey,
  sortConfig,
}: {
  columnKey: keyof ExperimentResult;
  sortConfig: SortConfig;
}) =>
  sortConfig.key !== columnKey ? (
    <span className="w-3 h-3 opacity-0 ml-1">↕</span>
  ) : sortConfig.direction === 'asc' ? (
    <ChevronUp className="w-3 h-3 ml-1" />
  ) : (
    <ChevronDown className="w-3 h-3 ml-1" />
  );

// カラム定義
const columnLabels: { [key: string]: string } = {
  executedAt: '実行日時',
  scenarioName: 'シナリオ名',
  status: 'ステータス',
  allocator: 'アロケータ',
  dataSizeMB: 'データサイズ',
  throughputBps: 'スループット',
  actualFee: 'Fee (TKN)',
  gasUsed: 'Gas Used',
  baseFee: 'Base Fee',
};

export const ResultTable: React.FC<ResultTableProps> = ({
  results,
  sortConfig,
  onSort,
  selectedResultId,
  onSelect,
  onViewDetail,
}) => {
  return (
    <div className={`flex-1 flex flex-col ${TableStyles.Container} shadow-md border-slate-200`}>
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className={`${TableStyles.Header} sticky top-0 z-10 shadow-sm`}>
            <tr>
              {[
                'executedAt',
                'scenarioName',
                'status',
                'allocator',
                'dataSizeMB',
                'throughputBps',
                'actualFee',
                'gasUsed',
                'baseFee',
              ].map(k => (
                <th
                  key={k}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none whitespace-nowrap"
                  onClick={() => onSort(k as keyof ExperimentResult)}
                >
                  <div className="flex items-center gap-1">
                    {columnLabels[k]}
                    <SortIcon columnKey={k as keyof ExperimentResult} sortConfig={sortConfig} />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {results.map(r => (
              <tr
                key={r.id}
                onClick={() => onSelect(r.id === selectedResultId ? null : r.id)}
                className={`group transition-colors cursor-pointer ${
                  selectedResultId === r.id ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <td className="px-6 py-3">
                  <div
                    className={`font-mono font-medium ${
                      selectedResultId === r.id ? 'text-blue-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    {r.id}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(r.executedAt).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-3 font-bold text-slate-800">{r.scenarioName}</td>
                <td className="px-6 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-6 py-3 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <StrategyBadge value={r.allocator} />
                    <StrategyBadge value={r.transmitter} />
                  </div>
                </td>
                <td className="px-6 py-3 font-mono text-slate-600 font-bold">
                  {r.dataSizeMB} <span className="text-[10px] text-slate-400 font-normal">MB</span>
                </td>
                <td className="px-6 py-3 font-mono font-bold text-slate-800">
                  {(r.throughputBps / 1024 / 1024).toFixed(2)}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">Mbps</span>
                </td>
                {/* New Columns */}
                <td className="px-6 py-3 font-mono text-amber-600 font-bold">
                  {r.actualFee !== undefined ? r.actualFee.toFixed(3) : '-'}
                  <span className="text-[10px] text-amber-400 font-normal ml-0.5">TKN</span>
                </td>
                <td className="px-6 py-3 font-mono text-slate-500">
                  {r.gasUsed !== undefined ? r.gasUsed.toLocaleString() : '-'}
                </td>
                <td className="px-6 py-3 font-mono text-slate-500 text-xs">
                  {r.baseFee !== undefined ? r.baseFee.toFixed(7) : '-'}
                </td>

                <td className="px-6 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      onViewDetail(r);
                    }}
                    className="hover:bg-blue-50 hover:text-blue-600 rounded-full w-10 h-10 p-0"
                  >
                    <FileText className="w-5 h-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

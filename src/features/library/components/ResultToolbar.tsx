import React, { useState } from 'react';
import { ExperimentResult } from '@/entities/result';
import { Search, Filter, Trash2, Download, X } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { FilterCondition } from '@/shared/types';

interface ResultToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filters: FilterCondition[];
  onAddFilter: (key: keyof ExperimentResult, value: string, label: string) => void;
  onRemoveFilter: (index: number) => void;
  selectedResultId: string | null;
  onDeleteClick: () => void;
  onExportClick: () => void;
}

export const ResultToolbar: React.FC<ResultToolbarProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onAddFilter,
  onRemoveFilter,
  selectedResultId,
  onDeleteClick,
  onExportClick,
}) => {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  return (
    <Card className="p-4 flex flex-col gap-4 sticky top-0 z-20 shadow-md border-slate-200/80 backdrop-blur-xl bg-white/90">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="シナリオ名またはIDを検索..."
            className="pl-10"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 relative">
          <Button
            variant="secondary"
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            icon={Filter}
          >
            フィルター
          </Button>
          {isFilterMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 z-30 p-2 animate-in fade-in zoom-in-95 duration-200">
              {['SUCCESS', 'FAILED'].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    onAddFilter('status', s, 'ステータス');
                    setIsFilterMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-xl transition-colors font-medium text-slate-600"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {selectedResultId && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <Button variant="danger" onClick={onDeleteClick} icon={Trash2}>
                削除
              </Button>
              <Button
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                onClick={onExportClick}
                icon={Download}
              >
                出力
              </Button>
            </div>
          )}
        </div>
      </div>
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {filters.map((f, idx) => (
            <Badge key={idx} color="blue" className="flex items-center gap-2 pr-1">
              {f.label}: {f.value}
              <button
                onClick={() => onRemoveFilter(idx)}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {/* 将来的な拡張: Clear All button logic could be added here */}
        </div>
      )}
    </Card>
  );
};

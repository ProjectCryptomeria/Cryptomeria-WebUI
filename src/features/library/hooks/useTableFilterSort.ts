import { useState, useMemo } from 'react';
import { ExperimentResult } from '@/entities/result';
import type { FilterCondition, SortConfig } from '@/shared/types';

/**
 * 実験結果のフィルタリングとソートのためのHook
 * Library Layerで実験結果の検索、フィルタリング、ソート機能を提供します
 */
export const useTableFilterSort = (data: ExperimentResult[], initialSort: SortConfig) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);
  const [filters, setFilters] = useState<FilterCondition[]>([]);

  const handleSort = (key: keyof ExperimentResult) =>
    setSortConfig(c => ({
      key: key,
      direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc',
    }));

  const addFilter = (key: keyof ExperimentResult, value: string, labelPrefix: string) => {
    if (!filters.some(f => f.key === key && f.value === value)) {
      setFilters([...filters, { key: key, value, label: `${labelPrefix}: ${value}` }]);
    }
  };

  const removeFilter = (index: number) => setFilters(filters.filter((_, i) => i !== index));

  const processedData = useMemo(() => {
    let processed = [...data];
    const itemAccessor = (item: ExperimentResult, key: keyof ExperimentResult) => item[key];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      processed = processed.filter(item =>
        // item は ExperimentResult 型なので as any を削除し、Object.values() の値は val で文字列化
        Object.values(item).some(val => String(val).toLowerCase().includes(lowerTerm))
      );
    }
    if (filters.length > 0) {
      processed = processed.filter(item =>
        filters.every(cond => {
          // cond.key (string) を keyof ExperimentResult にキャスト
          const key = cond.key as keyof ExperimentResult;
          // item[key] を型安全にアクセス
          return String(itemAccessor(item, key)) === cond.value;
        })
      );
    }
    processed.sort((a, b) => {
      // sortConfig.key (string) を keyof ExperimentResult にキャスト
      const key = sortConfig.key as keyof ExperimentResult;

      // ソート対象の値を型安全に取得
      const av = itemAccessor(a, key);
      const bv = itemAccessor(b, key);

      // undefinedチェックは維持
      if (av === undefined || bv === undefined) return 0;

      // ソートロジック
      return av < bv
        ? sortConfig.direction === 'asc'
          ? -1
          : 1
        : sortConfig.direction === 'asc'
          ? 1
          : -1;
    });
    return processed;
  }, [data, searchTerm, filters, sortConfig]);

  return {
    processedData,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    filters,
    addFilter,
    removeFilter,
  };
};
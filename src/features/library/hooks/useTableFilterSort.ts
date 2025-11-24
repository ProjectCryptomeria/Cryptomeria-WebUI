import { useState, useMemo } from 'react';
import { ExperimentResult, FilterCondition, SortConfig } from '@/entities/result';

/**
 * 実験結果のフィルタリングとソートのためのHook
 * Library Layerで実験結果の検索、フィルタリング、ソート機能を提供します
 */
export const useTableFilterSort = (data: ExperimentResult[], initialSort: SortConfig) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);
  const [filters, setFilters] = useState<FilterCondition[]>([]);

  // 引数の key を keyof ExperimentResult として受け取るように変更されたため、キャストは不要になりますが、
  // 念のため型安全性を維持したまま処理します。
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
        Object.values(item).some(val => String(val).toLowerCase().includes(lowerTerm))
      );
    }
    if (filters.length > 0) {
      processed = processed.filter(item =>
        filters.every(cond => {
          const key = cond.key;
          return String(itemAccessor(item, key)) === cond.value;
        })
      );
    }
    processed.sort((a, b) => {
      const key = sortConfig.key;

      const av = itemAccessor(a, key);
      const bv = itemAccessor(b, key);

      if (av === undefined || bv === undefined) return 0;

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
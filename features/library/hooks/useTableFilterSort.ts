import { useState, useMemo } from 'react';
import { ExperimentResult, SortConfig, FilterCondition } from '../../../types';

export const useTableFilterSort = (data: ExperimentResult[], initialSort: SortConfig) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);
    const [filters, setFilters] = useState<FilterCondition[]>([]);

    const handleSort = (key: keyof ExperimentResult) => setSortConfig(c => ({ key: key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
    
    const addFilter = (key: keyof ExperimentResult, value: string, labelPrefix: string) => {
        if (!filters.some(f => f.key === key && f.value === value)) {
            setFilters([...filters, { key: key, value, label: `${labelPrefix}: ${value}` }]);
        }
    };
    
    const removeFilter = (index: number) => setFilters(filters.filter((_, i) => i !== index));

    const processedData = useMemo(() => {
        let processed = [...data];
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            processed = processed.filter(item => Object.values(item as any).some(val => String(val).toLowerCase().includes(lowerTerm)));
        }
        if (filters.length > 0) {
            processed = processed.filter(item => filters.every(cond => String((item as any)[cond.key]) === cond.value));
        }
        processed.sort((a, b) => {
            const av = (a as any)[sortConfig.key];
            const bv = (b as any)[sortConfig.key];
            if (av === undefined || bv === undefined) return 0;
            return av < bv ? (sortConfig.direction === 'asc' ? -1 : 1) : (sortConfig.direction === 'asc' ? 1 : -1);
        });
        return processed;
    }, [data, searchTerm, filters, sortConfig]);

    return { processedData, searchTerm, setSearchTerm, sortConfig, handleSort, filters, addFilter, removeFilter };
};
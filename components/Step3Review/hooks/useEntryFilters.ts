/**
 * Custom hook for entry filtering and sorting logic
 */

import { useState, useMemo } from 'react';
import { LogbookEntry } from '@/types/logbook';

interface UseEntryFiltersProps {
    entries: LogbookEntry[];
}

interface UseEntryFiltersReturn {
    // Filter states
    searchText: string;
    setSearchText: (text: string) => void;
    filterJenisLog: number | 'all';
    setFilterJenisLog: (filter: number | 'all') => void;
    filterMode: number | 'all';
    setFilterMode: (filter: number | 'all') => void;
    filterDosen: number | 'all';
    setFilterDosen: (filter: number | 'all') => void;
    filterDateFrom: string;
    setFilterDateFrom: (date: string) => void;
    filterDateTo: string;
    setFilterDateTo: (date: string) => void;

    // Sort state
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;

    // Computed values
    filteredIndices: number[];
    sortedFilteredIndices: number[];
    filteredEntries: LogbookEntry[];
    hasActiveFilters: boolean;
}

export const useEntryFilters = ({ entries }: UseEntryFiltersProps): UseEntryFiltersReturn => {
    // Filter states
    const [searchText, setSearchText] = useState('');
    const [filterJenisLog, setFilterJenisLog] = useState<number | 'all'>('all');
    const [filterMode, setFilterMode] = useState<number | 'all'>('all');
    const [filterDosen, setFilterDosen] = useState<number | 'all'>('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Sort state - default: newest to oldest (desc)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Filter entries based on search and filters
    const filteredIndices = useMemo(() => {
        return entries
            .map((entry, idx) => ({ entry, idx }))
            .filter(({ entry }) => {
                // Search text filter (case-insensitive)
                if (searchText.trim()) {
                    const search = searchText.toLowerCase();
                    const matchesLokasi = entry.Lokasi?.toLowerCase().includes(search);
                    const matchesKeterangan = entry.Keterangan?.toLowerCase().includes(search);
                    if (!matchesLokasi && !matchesKeterangan) return false;
                }

                // JenisLog filter
                if (filterJenisLog !== 'all' && entry.JenisLogId !== filterJenisLog) {
                    return false;
                }

                // Mode filter
                if (filterMode !== 'all' && entry.IsLuring !== filterMode) {
                    return false;
                }

                // Dosen filter
                if (filterDosen !== 'all') {
                    const dosenIds = entry.Dosen
                        ? entry.Dosen.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
                        : [];
                    if (!dosenIds.includes(filterDosen as number)) {
                        return false;
                    }
                }

                // Date range filter
                if (filterDateFrom || filterDateTo) {
                    // Convert DD/MM/YYYY to Date for comparison
                    const entryDateParts = entry.Waktu.split('/');
                    if (entryDateParts.length === 3) {
                        const entryDate = new Date(
                            parseInt(entryDateParts[2], 10),
                            parseInt(entryDateParts[1], 10) - 1,
                            parseInt(entryDateParts[0], 10)
                        );

                        if (filterDateFrom) {
                            const fromDate = new Date(filterDateFrom);
                            if (entryDate < fromDate) return false;
                        }

                        if (filterDateTo) {
                            const toDate = new Date(filterDateTo);
                            if (entryDate > toDate) return false;
                        }
                    }
                }

                return true;
            })
            .map(({ idx }) => idx);
    }, [entries, searchText, filterJenisLog, filterMode, filterDosen, filterDateFrom, filterDateTo]);

    // Sort filtered indices by date
    const sortedFilteredIndices = useMemo(() => {
        return [...filteredIndices].sort((idxA, idxB) => {
            const entryA = entries[idxA];
            const entryB = entries[idxB];

            // Parse DD/MM/YYYY to Date for comparison
            const parseDate = (dateStr: string): Date => {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    return new Date(
                        parseInt(parts[2], 10),
                        parseInt(parts[1], 10) - 1,
                        parseInt(parts[0], 10)
                    );
                }
                return new Date(0); // fallback for invalid dates
            };

            const dateA = parseDate(entryA.Waktu);
            const dateB = parseDate(entryB.Waktu);

            // Sort based on sortOrder
            if (sortOrder === 'desc') {
                return dateB.getTime() - dateA.getTime(); // newest first
            } else {
                return dateA.getTime() - dateB.getTime(); // oldest first
            }
        });
    }, [filteredIndices, entries, sortOrder]);

    const filteredEntries = useMemo(() => {
        return sortedFilteredIndices.map(idx => entries[idx]);
    }, [sortedFilteredIndices, entries]);

    const hasActiveFilters = searchText.trim() !== '' ||
        filterJenisLog !== 'all' ||
        filterMode !== 'all' ||
        filterDosen !== 'all' ||
        filterDateFrom !== '' ||
        filterDateTo !== '';

    return {
        searchText,
        setSearchText,
        filterJenisLog,
        setFilterJenisLog,
        filterMode,
        setFilterMode,
        filterDosen,
        setFilterDosen,
        filterDateFrom,
        setFilterDateFrom,
        filterDateTo,
        setFilterDateTo,
        sortOrder,
        setSortOrder,
        filteredIndices,
        sortedFilteredIndices,
        filteredEntries,
        hasActiveFilters
    };
};

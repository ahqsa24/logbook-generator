/**
 * Search and Filter Component
 */

import { Lecturer } from '@/types/logbook';
import { getJenisLogLabel, getModeLabel } from '../utils';

interface SearchFiltersProps {
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
    hasActiveFilters: boolean;
    lecturers: Lecturer[];
}

export const SearchFilters = ({
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
    hasActiveFilters,
    lecturers
}: SearchFiltersProps) => {
    const handleClearFilters = () => {
        setSearchText('');
        setFilterJenisLog('all');
        setFilterMode('all');
        setFilterDosen('all');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            {/* Header with Title and Clear Button */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Search & Filter</h3>
                <button
                    onClick={handleClearFilters}
                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 disabled:hover:shadow-sm"
                    disabled={!hasActiveFilters}
                >
                    Clear Filters
                </button>
            </div>

            {/* Search Input */}
            <div className="mb-3">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Search (Lokasi, Keterangan)
                </label>
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-gray-200"
                />
            </div>

            {/* Row 2: Jenis Log, Dosen, Mode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {/* Jenis Log Filter */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Jenis Log
                    </label>
                    <select
                        value={filterJenisLog}
                        onChange={(e) => setFilterJenisLog(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-2 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value="all">All</option>
                        <option value={1}>Pembimbingan</option>
                        <option value={2}>Ujian</option>
                        <option value={3}>Kegiatan</option>
                    </select>
                </div>

                {/* Dosen Filter */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Dosen Pembimbing
                    </label>
                    <select
                        value={filterDosen}
                        onChange={(e) => setFilterDosen(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-2 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value="all">All</option>
                        {lecturers.map((lecturer) => (
                            <option key={lecturer.id} value={lecturer.id}>
                                {lecturer.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mode Filter */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Mode
                    </label>
                    <select
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-2 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value="all">All</option>
                        <option value={0}>Online</option>
                        <option value={1}>Offline</option>
                        <option value={2}>Hybrid</option>
                    </select>
                </div>
            </div>

            {/* Row 3: Date From, Date To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Date Range - From */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Date From
                    </label>
                    <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        min="1900-01-01"
                        max="2099-12-31"
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-2 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                    />
                </div>

                {/* Date Range - To */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Date To
                    </label>
                    <input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        min="1900-01-01"
                        max="2099-12-31"
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-2 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                    />
                </div>
            </div>

            {/* Active Filters Info */}
            {hasActiveFilters && (
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Active filters:</span>
                    {searchText.trim() && <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">Search: &quot;{searchText}&quot;</span>}
                    {filterJenisLog !== 'all' && <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">Jenis: {getJenisLogLabel(filterJenisLog as number)}</span>}
                    {filterMode !== 'all' && <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">Mode: {getModeLabel(filterMode as number)}</span>}
                    {filterDosen !== 'all' && <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">Dosen: {lecturers.find(l => l.id === filterDosen)?.name || filterDosen}</span>}
                    {filterDateFrom && <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">From: {filterDateFrom}</span>}
                    {filterDateTo && <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">To: {filterDateTo}</span>}
                </div>
            )}
        </div>
    );
};

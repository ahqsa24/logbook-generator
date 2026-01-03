'use client';

import { useState } from 'react';
import { LogbookEntry, Lecturer } from '@/types/logbook';
import { validateLogbookEntry } from '@/lib/validation';

interface Step3ReviewProps {
    entries: LogbookEntry[];
    isSubmitting: boolean;
    hasSubmitted: boolean;
    currentSubmission: number;
    lecturers: Lecturer[];
    onFileUpload: (index: number, file: File) => void;
    onSubmit: () => void;
    onBack: () => void;
    onUpdateEntry: (index: number, updatedEntry: LogbookEntry) => void;
    onAddEntry: (newEntry: LogbookEntry) => void;
    onDeleteEntry: (index: number) => void;
}

const getJenisLogLabel = (id: number) => {
    const labels = { 1: 'Pembimbingan', 2: 'Ujian', 3: 'Kegiatan' };
    return labels[id as keyof typeof labels] || id;
};

const getModeLabel = (mode: number) => {
    const labels = { 0: 'Online', 1: 'Offline', 2: 'Hybrid' };
    return labels[mode as keyof typeof labels] || mode;
};

// Helper: Convert DD/MM/YYYY to YYYY-MM-DD for HTML5 date input
const formatDateForInput = (ddmmyyyy: string): string => {
    if (!ddmmyyyy || !ddmmyyyy.includes('/')) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Helper: Convert YYYY-MM-DD to DD/MM/YYYY for display
const formatDateForDisplay = (yyyymmdd: string): string => {
    if (!yyyymmdd || !yyyymmdd.includes('-')) return yyyymmdd;
    const parts = yyyymmdd.split('-');
    if (parts.length !== 3) return yyyymmdd;
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

// Helper: Auto-format time input (8 → 08:00, 0800 → 08:00, 830 → 08:30)
const formatTimeInput = (input: string): string => {
    if (!input) return '';

    // Remove any non-digit characters except colon
    const cleaned = input.replace(/[^\d:]/g, '');

    // If already in HH:MM format, validate and return
    if (cleaned.includes(':')) {
        const parts = cleaned.split(':');
        if (parts.length === 2) {
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
        }
        return '';
    }

    // Handle numeric-only input
    const digits = cleaned.replace(/:/g, '');

    if (digits.length === 1 || digits.length === 2) {
        // Single or double digit: treat as hours (8 → 08:00, 14 → 14:00)
        const hours = parseInt(digits, 10);
        if (hours >= 0 && hours <= 23) {
            return `${hours.toString().padStart(2, '0')}:00`;
        }
    } else if (digits.length === 3) {
        // Three digits: HMM format (830 → 08:30)
        const hours = parseInt(digits.substring(0, 1), 10);
        const minutes = parseInt(digits.substring(1, 3), 10);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    } else if (digits.length === 4) {
        // Four digits: HHMM format (0830 → 08:30)
        const hours = parseInt(digits.substring(0, 2), 10);
        const minutes = parseInt(digits.substring(2, 4), 10);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }

    return '';
};

// Helper: Validate select value and return default if invalid
const validateSelectValue = (value: number, validValues: number[], defaultValue: number): number => {
    return validValues.includes(value) ? value : defaultValue;
};

// Helper: Validate Dosen input - ensure values are between 1 and maxDosen
const validateDosenInput = (dosenString: string | undefined, maxDosen: number): string => {
    if (!dosenString || dosenString.trim() === '') {
        return ''; // Empty is allowed (optional field)
    }

    // Parse comma-separated IDs
    const ids = dosenString
        .split(',')
        .map(id => {
            const parsed = parseInt(id.trim(), 10);
            return isNaN(parsed) ? null : parsed;
        })
        .filter((id): id is number => id !== null);

    if (ids.length === 0) {
        return '1'; // Default to 1 if no valid IDs
    }

    // Filter to only valid IDs (1 to maxDosen)
    const validIds = ids.filter(id => id >= 1 && id <= maxDosen);

    if (validIds.length === 0) {
        return '1'; // Default to 1 if all IDs are invalid
    }

    // Sort and remove duplicates
    const uniqueIds = Array.from(new Set(validIds)).sort((a, b) => a - b);
    return uniqueIds.join(',');
};


export default function Step3Review({
    entries,
    isSubmitting,
    hasSubmitted,
    currentSubmission,
    lecturers,
    onFileUpload,
    onSubmit,
    onBack,
    onUpdateEntry,
    onAddEntry,
    onDeleteEntry,
}: Step3ReviewProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedEntry, setEditedEntry] = useState<LogbookEntry | null>(null);

    // Add Entry states
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [newEntry, setNewEntry] = useState<LogbookEntry | null>(null);

    // Search and Filter states
    const [searchText, setSearchText] = useState('');
    const [filterJenisLog, setFilterJenisLog] = useState<number | 'all'>('all');
    const [filterMode, setFilterMode] = useState<number | 'all'>('all');
    const [filterDosen, setFilterDosen] = useState<number | 'all'>('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');

    // Sort state - default: newest to oldest (desc)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Delete confirmation state
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    // Validate all entries with maxDosen parameter
    // Use lecturers.length if available, otherwise default to 1 (strict validation)
    const maxDosen = lecturers.length > 0 ? lecturers.length : 1;

    const validationResults = entries.map(entry => {
        const result = validateLogbookEntry(entry, maxDosen);
        if (!result.isValid && entry.Dosen) {
            console.log('❌ Validation failed for entry with Dosen:', entry.Dosen, 'errors:', result.errors);
        }
        return result;
    });
    const hasErrors = validationResults.some(result => !result.isValid);

    // Filter entries based on search and filters
    const filteredIndices = entries
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

    // Sort filtered indices by date
    const sortedFilteredIndices = [...filteredIndices].sort((idxA, idxB) => {
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

    const filteredEntries = sortedFilteredIndices.map(idx => entries[idx]);
    const hasActiveFilters = searchText.trim() !== '' || filterJenisLog !== 'all' || filterMode !== 'all' || filterDosen !== 'all' || filterDateFrom !== '' || filterDateTo !== '';

    // Handler for adding new entry
    const handleStartAddEntry = () => {
        // Create a new empty entry with default values
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();

        const emptyEntry: LogbookEntry = {
            Waktu: `${day}/${month}/${year}`,
            Tstart: '',
            Tend: '',
            JenisLogId: 1,
            IsLuring: 0,
            Lokasi: '',
            Keterangan: '',
            Dosen: lecturers.length > 0 ? '1' : '',
        };

        setNewEntry(emptyEntry);
        setIsAddingEntry(true);
    };

    const handleSaveNewEntry = () => {
        if (newEntry) {
            // Sanitize data before saving
            const sanitizedEntry = { ...newEntry };

            // Ensure time fields are properly formatted
            if (sanitizedEntry.Tstart && !/^\d{2}:\d{2}$/.test(sanitizedEntry.Tstart)) {
                const formatted = formatTimeInput(sanitizedEntry.Tstart);
                if (formatted) {
                    sanitizedEntry.Tstart = formatted;
                }
            }
            if (sanitizedEntry.Tend && !/^\d{2}:\d{2}$/.test(sanitizedEntry.Tend)) {
                const formatted = formatTimeInput(sanitizedEntry.Tend);
                if (formatted) {
                    sanitizedEntry.Tend = formatted;
                }
            }

            // Validate Dosen field
            const maxDosen = lecturers.length > 0 ? lecturers.length : 1;
            sanitizedEntry.Dosen = validateDosenInput(sanitizedEntry.Dosen, maxDosen);

            onAddEntry(sanitizedEntry);
            setIsAddingEntry(false);
            setNewEntry(null);
        }
    };

    const handleCancelAddEntry = () => {
        setIsAddingEntry(false);
        setNewEntry(null);
    };

    // Delete handlers
    const handleDeleteClick = (index: number) => {
        setDeleteConfirmIndex(index);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmIndex !== null) {
            onDeleteEntry(deleteConfirmIndex);
            setDeleteConfirmIndex(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmIndex(null);
    };

    const updateNewEntryField = (field: keyof LogbookEntry, value: any) => {
        if (newEntry) {
            setNewEntry({ ...newEntry, [field]: value });
        }
    };

    const handleEdit = (index: number) => {
        const entry = { ...entries[index] };

        // Validate and sanitize select values
        entry.JenisLogId = validateSelectValue(entry.JenisLogId, [1, 2, 3], 1);
        entry.IsLuring = validateSelectValue(entry.IsLuring, [0, 1, 2], 0);

        // Validate and sanitize date - set to today if invalid
        if (!entry.Waktu || !/^\d{2}\/\d{2}\/\d{4}$/.test(entry.Waktu)) {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            entry.Waktu = `${day}/${month}/${year}`;
        }

        // Validate and sanitize time fields - set to empty if invalid (user must fill)
        if (!entry.Tstart || !/^\d{2}:\d{2}$/.test(entry.Tstart)) {
            entry.Tstart = '';
        }
        if (!entry.Tend || !/^\d{2}:\d{2}$/.test(entry.Tend)) {
            entry.Tend = '';
        }

        setEditingIndex(index);
        setEditedEntry(entry);
    };

    const handleSave = (index: number) => {
        if (editedEntry) {
            // Sanitize data before saving
            const sanitizedEntry = { ...editedEntry };

            // Ensure time fields are properly formatted (HH:MM)
            // Keep the value as-is if it's already in HH:MM format from HTML5 time input
            if (sanitizedEntry.Tstart) {
                // Only format if it's not already in HH:MM format
                if (!/^\d{2}:\d{2}$/.test(sanitizedEntry.Tstart)) {
                    const formatted = formatTimeInput(sanitizedEntry.Tstart);
                    if (formatted) {
                        sanitizedEntry.Tstart = formatted;
                    }
                }
            }
            if (sanitizedEntry.Tend) {
                // Only format if it's not already in HH:MM format
                if (!/^\d{2}:\d{2}$/.test(sanitizedEntry.Tend)) {
                    const formatted = formatTimeInput(sanitizedEntry.Tend);
                    if (formatted) {
                        sanitizedEntry.Tend = formatted;
                    }
                }
            }

            // Validate Dosen field - ensure values are between 1 and lecturers.length
            const maxDosen = lecturers.length > 0 ? lecturers.length : 1;
            sanitizedEntry.Dosen = validateDosenInput(sanitizedEntry.Dosen, maxDosen);

            // console.log('Saving edited entry:', sanitizedEntry);
            onUpdateEntry(index, sanitizedEntry);
            setEditingIndex(null);
            setEditedEntry(null);
        }
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setEditedEntry(null);
    };

    const updateField = (field: keyof LogbookEntry, value: any) => {
        if (editedEntry) {
            setEditedEntry({ ...editedEntry, [field]: value });
        }
    };

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Step 3: Review & Submit
            </h2>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-4 gap-3">
                    <p className="text-gray-700 dark:text-gray-300">
                        {hasActiveFilters ? (
                            <>
                                Showing <strong>{filteredEntries.length}</strong> of <strong>{entries.length}</strong> entries.
                            </>
                        ) : (
                            <>
                                Found <strong>{entries.length}</strong> entries. Please review before submitting.
                            </>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="text-sm bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                            title={sortOrder === 'desc' ? 'Sorted: Newest First' : 'Sorted: Oldest First'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {sortOrder === 'desc' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                )}
                            </svg>
                            <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                        </button>
                        <button
                            onClick={handleStartAddEntry}
                            className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || hasSubmitted || isAddingEntry}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden sm:inline">Add Entry</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                    {/* Header with Title and Clear Button */}
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Search & Filter</h3>
                        <button
                            onClick={() => {
                                setSearchText('');
                                setFilterJenisLog('all');
                                setFilterMode('all');
                                setFilterDosen('all');
                                setFilterDateFrom('');
                                setFilterDateTo('');
                            }}
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

                {hasErrors && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-red-900 dark:text-red-300">
                                    ⚠️ Validation Errors Detected
                                </p>
                                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                                    Some entries have validation errors. Please fix them before submitting. Click &quot;Edit&quot; to modify the entry.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Entries List - Scrollable Container */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50">
                    {/* Add Entry Form - Always visible when adding */}
                    {isAddingEntry && newEntry && (
                        <div className="border-2 border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10 rounded-lg p-4 mb-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                                        New Entry
                                    </span>
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                        Adding...
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveNewEntry}
                                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancelAddEntry}
                                        className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Fields Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {/* Waktu */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Waktu (DD/MM/YYYY)</label>
                                    <input
                                        type="date"
                                        value={formatDateForInput(newEntry.Waktu)}
                                        onChange={(e) => updateNewEntryField('Waktu', formatDateForDisplay(e.target.value))}
                                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                                    />
                                </div>

                                {/* Tstart */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Start Time (HH:MM)</label>
                                    <input
                                        type="time"
                                        value={newEntry.Tstart}
                                        onChange={(e) => updateNewEntryField('Tstart', e.target.value)}
                                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                                    />
                                </div>

                                {/* Tend */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">End Time (HH:MM)</label>
                                    <input
                                        type="time"
                                        value={newEntry.Tend}
                                        onChange={(e) => updateNewEntryField('Tend', e.target.value)}
                                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                                    />
                                </div>

                                {/* JenisLogId */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Jenis Log</label>
                                    <select
                                        value={newEntry.JenisLogId}
                                        onChange={(e) => updateNewEntryField('JenisLogId', Number(e.target.value))}
                                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                    >
                                        <option value={1}>1 - Pembimbingan</option>
                                        <option value={2}>2 - Ujian</option>
                                        <option value={3}>3 - Kegiatan</option>
                                    </select>
                                </div>

                                {/* IsLuring */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mode</label>
                                    <select
                                        value={newEntry.IsLuring}
                                        onChange={(e) => updateNewEntryField('IsLuring', Number(e.target.value))}
                                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                    >
                                        <option value={0}>0 - Online</option>
                                        <option value={1}>1 - Offline</option>
                                        <option value={2}>2 - Hybrid</option>
                                    </select>
                                </div>

                                {/* Lokasi */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Lokasi</label>
                                    <input
                                        type="text"
                                        value={newEntry.Lokasi}
                                        onChange={(e) => updateNewEntryField('Lokasi', e.target.value)}
                                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                    />
                                </div>

                                {/* Keterangan - Full Width */}
                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Keterangan</label>
                                    <textarea
                                        value={newEntry.Keterangan}
                                        onChange={(e) => updateNewEntryField('Keterangan', e.target.value)}
                                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                        rows={2}
                                    />
                                </div>

                                {/* Dosen - Checkbox Group */}
                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                                        Dosen Pembimbing {lecturers.length > 0 && `(${lecturers.length} available)`}
                                    </label>
                                    {lecturers.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                                            {lecturers.map((lecturer) => {
                                                const selectedIds = newEntry.Dosen
                                                    ? newEntry.Dosen.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
                                                    : [];
                                                const isChecked = selectedIds.includes(lecturer.id);

                                                return (
                                                    <label
                                                        key={lecturer.id}
                                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                const currentIds = newEntry.Dosen
                                                                    ? newEntry.Dosen.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
                                                                    : [];

                                                                let newIds: number[];
                                                                if (e.target.checked) {
                                                                    newIds = [...currentIds, lecturer.id].sort((a, b) => a - b);
                                                                } else {
                                                                    newIds = currentIds.filter(id => id !== lecturer.id);
                                                                }

                                                                const dosenString = newIds.length > 0 ? newIds.join(',') : '';
                                                                updateNewEntryField('Dosen', dosenString);
                                                            }}
                                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                        />
                                                        <span className="text-sm text-gray-900 dark:text-gray-200">
                                                            {lecturer.name}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={newEntry.Dosen || ''}
                                            onChange={(e) => updateNewEntryField('Dosen', e.target.value)}
                                            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                            placeholder="Optional (e.g., 1,2)"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Existing Entries */}
                    {sortedFilteredIndices.map((idx) => {
                        const entry = entries[idx];
                        const validation = validationResults[idx];
                        const isEditing = editingIndex === idx;
                        const currentEntry = isEditing ? editedEntry! : entry;

                        return (
                            <div
                                key={idx}
                                className={`border rounded-lg p-4 ${validation.isValid
                                    ? 'border-green-200 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10'
                                    : 'border-red-200 dark:border-red-700 bg-red-50/30 dark:bg-red-900/10'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 dark:text-gray-200">
                                            Entry #{idx + 1}
                                        </span>
                                        {validation.isValid ? (
                                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                                ✓ Valid
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                                                ⚠ {validation.errors.length} Error{validation.errors.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => handleSave(idx)}
                                                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                                    disabled={isSubmitting}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                                                    disabled={isSubmitting}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(idx)}
                                                    className={`text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded ${isSubmitting || hasSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={isSubmitting || hasSubmitted}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(idx)}
                                                    className={`text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded ${isSubmitting || hasSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={isSubmitting || hasSubmitted}
                                                    title="Delete entry"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Validation Errors */}
                                {!validation.isValid && (
                                    <div className="mb-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded p-2">
                                        <p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-1">Errors:</p>
                                        <ul className="text-xs text-red-700 dark:text-red-400 list-disc list-inside space-y-0.5">
                                            {validation.errors.map((error, errorIdx) => (
                                                <li key={errorIdx}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Fields Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {/* Waktu */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Waktu (DD/MM/YYYY)</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={formatDateForInput(currentEntry.Waktu)}
                                                onChange={(e) => updateField('Waktu', formatDateForDisplay(e.target.value))}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Waktu}</p>
                                        )}
                                    </div>

                                    {/* Tstart */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Start Time (HH:MM)</label>
                                        {isEditing ? (
                                            <input
                                                type="time"
                                                value={currentEntry.Tstart}
                                                onChange={(e) => updateField('Tstart', e.target.value)}
                                                onBlur={(e) => {
                                                    const formatted = formatTimeInput(e.target.value);
                                                    if (formatted) updateField('Tstart', formatted);
                                                }}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Tstart}</p>
                                        )}
                                    </div>

                                    {/* Tend */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">End Time (HH:MM)</label>
                                        {isEditing ? (
                                            <input
                                                type="time"
                                                value={currentEntry.Tend}
                                                onChange={(e) => updateField('Tend', e.target.value)}
                                                onBlur={(e) => {
                                                    const formatted = formatTimeInput(e.target.value);
                                                    if (formatted) updateField('Tend', formatted);
                                                }}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Tend}</p>
                                        )}
                                    </div>

                                    {/* JenisLogId */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Jenis Log</label>
                                        {isEditing ? (
                                            <select
                                                value={currentEntry.JenisLogId}
                                                onChange={(e) => updateField('JenisLogId', Number(e.target.value))}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                            >
                                                <option value={1}>1 - Pembimbingan</option>
                                                <option value={2}>2 - Ujian</option>
                                                <option value={3}>3 - Kegiatan</option>
                                            </select>
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-200">{getJenisLogLabel(currentEntry.JenisLogId)}</p>
                                        )}
                                    </div>

                                    {/* IsLuring */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mode</label>
                                        {isEditing ? (
                                            <select
                                                value={currentEntry.IsLuring}
                                                onChange={(e) => updateField('IsLuring', Number(e.target.value))}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                            >
                                                <option value={0}>0 - Online</option>
                                                <option value={1}>1 - Offline</option>
                                                <option value={2}>2 - Hybrid</option>
                                            </select>
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-200">{getModeLabel(currentEntry.IsLuring)}</p>
                                        )}
                                    </div>

                                    {/* Lokasi */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Lokasi</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={currentEntry.Lokasi}
                                                onChange={(e) => updateField('Lokasi', e.target.value)}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Lokasi}</p>
                                        )}
                                    </div>

                                    {/* Keterangan - Full Width */}
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Keterangan</label>
                                        {isEditing ? (
                                            <textarea
                                                value={currentEntry.Keterangan}
                                                onChange={(e) => updateField('Keterangan', e.target.value)}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                                rows={2}
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Keterangan}</p>
                                        )}
                                    </div>

                                    {/* Dosen - Checkbox Group */}
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                                            Dosen Pembimbing {lecturers.length > 0 && `(${lecturers.length} available)`}
                                        </label>
                                        {isEditing ? (
                                            lecturers.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                                                    {lecturers.map((lecturer) => {
                                                        // Parse current Dosen string to check if this lecturer is selected
                                                        const selectedIds = currentEntry.Dosen
                                                            ? currentEntry.Dosen.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
                                                            : [];
                                                        const isChecked = selectedIds.includes(lecturer.id);

                                                        return (
                                                            <label
                                                                key={lecturer.id}
                                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        const currentIds = currentEntry.Dosen
                                                                            ? currentEntry.Dosen.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
                                                                            : [];

                                                                        let newIds: number[];
                                                                        if (e.target.checked) {
                                                                            // Add this lecturer
                                                                            newIds = [...currentIds, lecturer.id].sort((a, b) => a - b);
                                                                        } else {
                                                                            // Remove this lecturer
                                                                            newIds = currentIds.filter(id => id !== lecturer.id);
                                                                        }

                                                                        // Update Dosen field as comma-separated string
                                                                        // If no lecturers selected, use empty string instead of undefined
                                                                        const dosenString = newIds.length > 0 ? newIds.join(',') : '';
                                                                        updateField('Dosen', dosenString);
                                                                    }}
                                                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                                />
                                                                <span className="text-sm text-gray-900 dark:text-gray-200">
                                                                    {lecturer.name}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={currentEntry.Dosen || ''}
                                                    onChange={(e) => updateField('Dosen', e.target.value)} onBlur={(e) => {
                                                        // Validate Dosen input on blur
                                                        const maxDosen = lecturers.length > 0 ? lecturers.length : 1;
                                                        const validated = validateDosenInput(e.target.value, maxDosen);
                                                        if (validated !== e.target.value) {
                                                            updateField('Dosen', validated);
                                                        }
                                                    }} className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                                    placeholder="Optional (e.g., 1,2)"
                                                />
                                            )
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-200">
                                                {currentEntry.Dosen ? (
                                                    lecturers.length > 0 ? (
                                                        // Show lecturer names if available
                                                        currentEntry.Dosen.split(',')
                                                            .map(id => {
                                                                const lecturerId = parseInt(id.trim(), 10);
                                                                const lecturer = lecturers.find(l => l.id === lecturerId);
                                                                return lecturer ? lecturer.name : `Dosen ${id}`;
                                                            })
                                                            .join(', ')
                                                    ) : (
                                                        // Fallback to numbers if lecturers not loaded
                                                        currentEntry.Dosen
                                                    )
                                                ) : '-'}
                                            </p>
                                        )}
                                    </div>

                                    {/* File Upload */}
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Supporting File</label>
                                        <input
                                            type="file"
                                            onChange={(e) =>
                                                e.target.files?.[0] &&
                                                onFileUpload(idx, e.target.files[0])
                                            }
                                            className="w-full text-xs dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            disabled={isSubmitting}
                                        />
                                        {entry.fileName && (
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                ✓ {entry.fileName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State Messages */}
                    {!isAddingEntry && sortedFilteredIndices.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {entries.length === 0 ? (
                                <>
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm font-semibold mb-1">No logbook entries found</p>
                                    <p className="text-xs">The uploaded file contains no entries, or all entries have been deleted.</p>
                                    <p className="text-xs mt-2">Click the &quot;Add Entry&quot; button above to create a new entry manually.</p>
                                </>
                            ) : (
                                <>
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <p className="text-sm font-semibold mb-1">No entries match the current filters</p>
                                    <p className="text-xs mb-3">Try adjusting your search criteria or clear all filters to see all entries.</p>
                                    <button
                                        onClick={() => {
                                            setSearchText('');
                                            setFilterJenisLog('all');
                                            setFilterMode('all');
                                            setFilterDosen('all');
                                            setFilterDateFrom('');
                                            setFilterDateTo('');
                                        }}
                                        className="mt-2 text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Clear all filters
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {
                isSubmitting && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Submitting {currentSubmission} of {entries.length}
                            </span>
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                                {Math.round((currentSubmission / entries.length) * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-purple-100 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(currentSubmission / entries.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )
            }

            <div className="flex gap-4">
                <button
                    className={`btn-secondary flex-1 ${(isSubmitting || hasSubmitted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={onBack}
                    disabled={isSubmitting || hasSubmitted}
                >
                    Back
                </button>
                <button
                    className={`btn-primary flex-1 ${(isSubmitting || hasErrors) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={onSubmit}
                    disabled={isSubmitting || hasErrors}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit All'}
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {
                deleteConfirmIndex !== null && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
                                ⚠️ Confirm Delete
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Are you sure you want to delete this logbook entry?
                            </p>
                            {entries[deleteConfirmIndex] && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                        Entry #{deleteConfirmIndex + 1}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        Date: {entries[deleteConfirmIndex].Waktu}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Description: {entries[deleteConfirmIndex].Keterangan || '-'}
                                    </p>
                                </div>
                            )}
                            <p className="text-xs text-red-600 dark:text-red-400 mb-6">
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

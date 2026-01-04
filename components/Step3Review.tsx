'use client';

import { useState, useRef } from 'react';
import { LogbookEntry } from '@/types/logbook';
import {
    formatDateForInput,
    formatDateForDisplay,
    formatTimeInput,
    getJenisLogLabel,
    getModeLabel,
    validateSelectValue,
    validateDosenInput
} from './Step3Review/utils';
import { useEntryValidation, useJumpToError, useEntryFilters } from './Step3Review/hooks';
import { ProgressIndicator, SearchFilters, ErrorWarning, EmptyWarning, DeleteConfirmModal } from './Step3Review/components';
import type { Step3ReviewProps } from './Step3Review/types';

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

    // Delete confirmation state
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    // Add Entry form ref for auto-scroll
    const addEntryFormRef = useRef<HTMLDivElement | null>(null);

    // File input refs for resetting
    const addEntryFileInputRef = useRef<HTMLInputElement | null>(null);
    const editEntryFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    // Use custom hooks for validation, filters, and jump-to-error
    const {
        validationResults,
        hasErrors,
        allEntriesEmpty,
        isNewEntryValid,
        isEditedEntryValid,
        errorIndices
    } = useEntryValidation({ entries, lecturers, newEntry, editedEntry });

    const {
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
    } = useEntryFilters({ entries });

    const {
        currentErrorIndex,
        setCurrentErrorIndex,
        entryRefs,
        handleJumpToNextError
    } = useJumpToError({ errorIndices });

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

        // Scroll to Add Entry form after a short delay to ensure DOM is updated
        setTimeout(() => {
            addEntryFormRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
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

        // Validate and sanitize Dosen field - filter out out-of-range IDs
        const maxDosen = lecturers.length > 0 ? lecturers.length : 1;
        entry.Dosen = validateDosenInput(entry.Dosen, maxDosen);

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
                <SearchFilters
                    searchText={searchText}
                    setSearchText={setSearchText}
                    filterJenisLog={filterJenisLog}
                    setFilterJenisLog={setFilterJenisLog}
                    filterMode={filterMode}
                    setFilterMode={setFilterMode}
                    filterDosen={filterDosen}
                    setFilterDosen={setFilterDosen}
                    filterDateFrom={filterDateFrom}
                    setFilterDateFrom={setFilterDateFrom}
                    filterDateTo={filterDateTo}
                    setFilterDateTo={setFilterDateTo}
                    hasActiveFilters={hasActiveFilters}
                    lecturers={lecturers}
                />

                <ErrorWarning
                    errorCount={errorIndices.length}
                    currentErrorIndex={currentErrorIndex}
                    onJumpToError={handleJumpToNextError}
                />

                {allEntriesEmpty && <EmptyWarning />}

                {/* Entries List - Scrollable Container */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50">
                    {/* Add Entry Form - Always visible when adding */}
                    {isAddingEntry && newEntry && (
                        <div
                            ref={addEntryFormRef}
                            className="border-2 border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10 rounded-lg p-4 mb-4"
                        >
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
                                        disabled={!isNewEntryValid}
                                        className={`text-xs px-3 py-1 rounded transition-colors ${isNewEntryValid
                                            ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
                                            }`}
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

                                {/* Supporting File */}
                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                                        Supporting File (Optional)
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            ref={addEntryFileInputRef}
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Convert to base64
                                                    const reader = new FileReader();
                                                    reader.onload = () => {
                                                        const base64 = (reader.result as string).split(',')[1];
                                                        setNewEntry({ ...newEntry, fileData: base64, fileName: file.name });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 file:mr-3 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50"
                                        />
                                        {newEntry.fileName && (
                                            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-900 dark:text-gray-200 flex-1">{newEntry.fileName}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        // Reset file input and state
                                                        if (addEntryFileInputRef.current) {
                                                            addEntryFileInputRef.current.value = '';
                                                        }
                                                        setNewEntry({ ...newEntry, fileName: undefined, fileData: undefined });
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
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
                                ref={(el) => { entryRefs.current[idx] = el; }}
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
                                                    disabled={isSubmitting || !isEditedEntryValid}
                                                    className={`text-xs px-3 py-1 rounded transition-colors ${isSubmitting || !isEditedEntryValid
                                                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
                                                        : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                                        }`}
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
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                                            Supporting File (Optional)
                                        </label>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <input
                                                    ref={(el) => { editEntryFileInputRefs.current[idx] = el; }}
                                                    type="file"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            // Convert to base64 and update editedEntry
                                                            const reader = new FileReader();
                                                            reader.onload = () => {
                                                                const base64 = (reader.result as string).split(',')[1];
                                                                updateField('fileData', base64);
                                                                updateField('fileName', file.name);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 file:mr-3 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    disabled={isSubmitting}
                                                />
                                                {currentEntry.fileName && (
                                                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span className="text-sm text-gray-900 dark:text-gray-200 flex-1">{currentEntry.fileName}</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                // Reset file input and update editedEntry
                                                                if (editEntryFileInputRefs.current[idx]) {
                                                                    editEntryFileInputRefs.current[idx]!.value = '';
                                                                }
                                                                if (editedEntry) {
                                                                    setEditedEntry({ ...editedEntry, fileName: undefined, fileData: undefined });
                                                                }
                                                            }}
                                                            disabled={isSubmitting}
                                                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <input
                                                    type="file"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            onFileUpload(idx, file);
                                                        }
                                                    }}
                                                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 file:mr-3 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    disabled={isSubmitting}
                                                />
                                                {entry.fileName && (
                                                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                                                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span className="text-sm text-gray-900 dark:text-gray-200 flex-1">{entry.fileName}</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                // Remove file by updating entry
                                                                const updatedEntry = { ...entry, fileName: undefined, fileData: undefined };
                                                                onUpdateEntry(idx, updatedEntry);
                                                            }}
                                                            disabled={isSubmitting}
                                                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
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
                                    <p className="text-sm font-semibold mb-1">No logbook entries yet</p>
                                    <p className="text-xs">Click the &quot;Add Entry&quot; button above to create your first entry.</p>
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

            <ProgressIndicator
                currentSubmission={currentSubmission}
                totalEntries={entries.length}
                isSubmitting={isSubmitting}
            />

            <div className="flex gap-4">
                <button
                    className={`btn-secondary flex-1 ${(isSubmitting || hasSubmitted) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={onBack}
                    disabled={isSubmitting || hasSubmitted}
                >
                    Back
                </button>
                <button
                    className={`btn-primary flex-1 ${(isSubmitting || hasErrors || allEntriesEmpty) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={onSubmit}
                    disabled={isSubmitting || hasErrors || allEntriesEmpty}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit All'}
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteConfirmIndex !== null}
                entryIndex={deleteConfirmIndex}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div >
    );
}

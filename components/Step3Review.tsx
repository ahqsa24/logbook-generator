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
import { ProgressIndicator, SearchFilters, ErrorWarning, EmptyWarning, DeleteConfirmModal, AddEntryForm, EntryCard } from './Step3Review/components';
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
    onDeleteAll,
}: Step3ReviewProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedEntry, setEditedEntry] = useState<LogbookEntry | null>(null);

    // Add Entry states
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [newEntry, setNewEntry] = useState<LogbookEntry | null>(null);

    // Delete confirmation state
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

    // Add Entry form ref for auto-scroll
    const addEntryFormRef = useRef<HTMLDivElement | null>(null);

    // Use custom hooks for validation, filters, and jump-to-error
    const {
        validationResults,
        hasErrors,
        allEntriesEmpty,
        isNewEntryValid,
        isEditedEntryValid,
        errorIndices,
        newEntryValidation
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

            // DEBUG: Track file data
            console.log('[DEBUG] Saving new entry with file data:', {
                fileName: sanitizedEntry.fileName,
                hasFileData: !!sanitizedEntry.fileData,
                fileDataLength: sanitizedEntry.fileData?.length || 0
            });

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

    const handleDeleteAll = () => {
        setShowDeleteAllConfirm(true);
    };

    const handleConfirmDeleteAll = () => {
        if (onDeleteAll) {
            // Use the dedicated delete all function if provided
            onDeleteAll();
        } else {
            // Fallback: Delete all entries by repeatedly deleting index 0
            const totalEntries = entries.length;
            for (let i = 0; i < totalEntries; i++) {
                onDeleteEntry(0);
            }
        }
        setShowDeleteAllConfirm(false);
    };

    const handleCancelDeleteAll = () => {
        setShowDeleteAllConfirm(false);
    };

    const updateNewEntryField = (field: keyof LogbookEntry, value: any) => {
        if (newEntry) {
            console.log('[DEBUG] Step3Review - updateNewEntryField:', {
                field,
                valueType: typeof value,
                valueLength: typeof value === 'string' ? value.length : 'N/A'
            });
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

            // DEBUG: Track file data
            console.log('[DEBUG] Saving edited entry with file data:', {
                index,
                fileName: sanitizedEntry.fileName,
                hasFileData: !!sanitizedEntry.fileData,
                fileDataLength: sanitizedEntry.fileData?.length || 0
            });

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
            console.log('[DEBUG] Step3Review - updateField (edit mode):', {
                field,
                valueType: typeof value,
                valueLength: typeof value === 'string' ? value.length : 'N/A'
            });
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
                            onClick={handleDeleteAll}
                            className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || hasSubmitted || entries.length === 0}
                            title="Delete all entries"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Delete All</span>
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
                        <AddEntryForm
                            newEntry={newEntry}
                            lecturers={lecturers}
                            isNewEntryValid={isNewEntryValid}
                            validation={newEntryValidation}
                            onFieldChange={updateNewEntryField}
                            onSave={handleSaveNewEntry}
                            onCancel={handleCancelAddEntry}
                            formRef={addEntryFormRef}
                        />
                    )}

                    {/* Existing Entries */}
                    {sortedFilteredIndices.map((idx) => {
                        const entry = entries[idx];
                        const validation = validationResults[idx];
                        const isEditing = editingIndex === idx;

                        return (
                            <EntryCard
                                key={idx}
                                entry={entry}
                                index={idx}
                                validation={validation}
                                isEditing={isEditing}
                                editedEntry={editedEntry}
                                lecturers={lecturers}
                                isSubmitting={isSubmitting}
                                hasSubmitted={hasSubmitted}
                                onEdit={handleEdit}
                                onSave={handleSave}
                                onCancel={handleCancel}
                                onDelete={handleDeleteClick}
                                onFieldChange={updateField}
                                onFileUpload={onFileUpload}
                                onUpdateEntry={onUpdateEntry}
                                isEditedEntryValid={isEditedEntryValid}
                                entryRef={(el) => { entryRefs.current[idx] = el; }}
                            />
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

            {/* Delete All Confirmation Modal */}
            {showDeleteAllConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-red-200 dark:border-red-700">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Delete All Entries?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    You are about to delete <strong className="text-red-600 dark:text-red-400">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</strong>.
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    This action cannot be undone. Are you sure you want to continue?
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelDeleteAll}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDeleteAll}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

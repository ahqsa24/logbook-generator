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
}: Step3ReviewProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedEntry, setEditedEntry] = useState<LogbookEntry | null>(null);
    const [showEditWarning, setShowEditWarning] = useState(false);

    // Validate all entries
    const validationResults = entries.map(entry => validateLogbookEntry(entry));
    const hasErrors = validationResults.some(result => !result.isValid);

    const handleEdit = (index: number) => {
        // Show warning when user clicks edit
        setShowEditWarning(true);

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
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Found <strong>{entries.length}</strong> entries. Please review before submitting.
                </p>

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

                {showEditWarning && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                                    Edit Feature Under Development
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                    The edit feature is still under development. Please ensure your Excel file follows the correct format to avoid errors.
                                </p>
                                <button
                                    onClick={() => setShowEditWarning(false)}
                                    className="mt-2 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Entries List - Scrollable Container */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50">
                    {entries.map((entry, idx) => {
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
                                            <button
                                                onClick={() => handleEdit(idx)}
                                                className={`text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={isSubmitting}
                                            >
                                                Edit
                                            </button>
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
                                                    onChange={(e) => updateField('Dosen', e.target.value)}
                                                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
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
                </div>
            </div>

            {isSubmitting && (
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
            )}

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
        </div>
    );
}

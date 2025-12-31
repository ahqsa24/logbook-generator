'use client';

import { useState } from 'react';
import { LogbookEntry } from '@/types/logbook';
import { validateLogbookEntry } from '@/lib/validation';

interface Step3ReviewProps {
    entries: LogbookEntry[];
    isSubmitting: boolean;
    hasSubmitted: boolean;
    currentSubmission: number;
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

export default function Step3Review({
    entries,
    isSubmitting,
    hasSubmitted,
    currentSubmission,
    onFileUpload,
    onSubmit,
    onBack,
    onUpdateEntry,
}: Step3ReviewProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedEntry, setEditedEntry] = useState<LogbookEntry | null>(null);

    // Validate all entries
    const validationResults = entries.map(entry => validateLogbookEntry(entry));
    const hasErrors = validationResults.some(result => !result.isValid);

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditedEntry({ ...entries[index] });
    };

    const handleSave = (index: number) => {
        if (editedEntry) {
            onUpdateEntry(index, editedEntry);
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
                                    Some entries have validation errors. Please fix them before submitting. Click "Edit" to modify the entry.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Entries List */}
                <div className="space-y-4">
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
                                                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
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
                                                type="text"
                                                value={currentEntry.Waktu}
                                                onChange={(e) => updateField('Waktu', e.target.value)}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                                placeholder="DD/MM/YYYY"
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
                                                type="text"
                                                value={currentEntry.Tstart}
                                                onChange={(e) => updateField('Tstart', e.target.value)}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                                placeholder="HH:MM"
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
                                                type="text"
                                                value={currentEntry.Tend}
                                                onChange={(e) => updateField('Tend', e.target.value)}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                                placeholder="HH:MM"
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

                                    {/* Dosen */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dosen (e.g., "1,2")</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={currentEntry.Dosen || ''}
                                                onChange={(e) => updateField('Dosen', e.target.value || undefined)}
                                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                                                placeholder="Optional"
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Dosen || '-'}</p>
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
                    className="btn-secondary flex-1"
                    onClick={onBack}
                    disabled={isSubmitting || hasSubmitted}
                >
                    Back
                </button>
                <button
                    className="btn-primary flex-1"
                    onClick={onSubmit}
                    disabled={isSubmitting || hasErrors}
                >
                    {isSubmitting ? 'Submitting...' : hasErrors ? 'Fix Errors First' : 'Submit All'}
                </button>
            </div>
        </div>
    );
}

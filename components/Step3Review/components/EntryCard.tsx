'use client';

import { useRef, useState } from 'react';
import { LogbookEntry } from '@/types/logbook';
import { getJenisLogLabel, getModeLabel, validateDosenInput } from '../utils';
import EntryFormFields from './EntryFormFields';
import { FilePreviewModal } from './FilePreviewModal';

interface Lecturer {
    id: number;
    name: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

interface EntryCardProps {
    entry: LogbookEntry;
    index: number;
    validation: ValidationResult;
    isEditing: boolean;
    editedEntry: LogbookEntry | null;
    lecturers: Lecturer[];
    isSubmitting: boolean;
    hasSubmitted: boolean;
    onEdit: (index: number) => void;
    onSave: (index: number) => void;
    onCancel: () => void;
    onDelete: (index: number) => void;
    onFieldChange: (field: keyof LogbookEntry, value: any) => void;
    onFileUpload: (index: number, file: File) => void;
    onUpdateEntry: (index: number, entry: LogbookEntry) => void;
    isEditedEntryValid: boolean;
    entryRef: (el: HTMLDivElement | null) => void;
}

export default function EntryCard({
    entry,
    index,
    validation,
    isEditing,
    editedEntry,
    lecturers,
    isSubmitting,
    hasSubmitted,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onFieldChange,
    onFileUpload,
    onUpdateEntry,
    isEditedEntryValid,
    entryRef,
}: EntryCardProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const currentEntry = isEditing ? editedEntry! : entry;

    const handleFileRemove = () => {
        if (isEditing) {
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            // Clear file data from entry state
            onFieldChange('fileData', undefined);
            onFieldChange('fileName', undefined);
        }
    };

    const handleFileUploadInViewMode = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Clear previous error
            setFileError(null);

            // Validate file size
            const { validateFileSize } = await import('../utils/fileUploadHelper');
            const validation = validateFileSize(file);

            if (!validation.valid) {
                setFileError(validation.error || 'File size exceeds limit');
                e.target.value = ''; // Reset input
                return;
            }

            onFileUpload(index, file);
        }
    };

    const handleFileRemoveInViewMode = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const updatedEntry = { ...entry, fileName: undefined, fileData: undefined };
        onUpdateEntry(index, updatedEntry);
    };

    return (
        <div
            ref={entryRef}
            className={`border rounded-lg p-4 ${validation.isValid
                ? 'border-green-200 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10'
                : 'border-red-200 dark:border-red-700 bg-red-50/30 dark:bg-red-900/10'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                        Entry #{index + 1}
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
                                onClick={() => onSave(index)}
                                disabled={isSubmitting || !isEditedEntryValid}
                                className={`text-xs px-3 py-1 rounded transition-colors ${isSubmitting || !isEditedEntryValid
                                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
                                    : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                    }`}
                            >
                                Save
                            </button>
                            <button
                                onClick={onCancel}
                                className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => onEdit(index)}
                                className={`text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded ${isSubmitting || hasSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting || hasSubmitted}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(index)}
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

            {/* Fields - Use EntryFormFields for both edit and view mode */}
            {isEditing ? (
                <EntryFormFields
                    entry={currentEntry}
                    lecturers={lecturers}
                    isEditing={true}
                    onFieldChange={onFieldChange}
                    fileInputRef={fileInputRef}
                    isSubmitting={isSubmitting}
                    onFileRemove={handleFileRemove}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Waktu */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Waktu (DD/MM/YYYY)</label>
                        <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Waktu}</p>
                    </div>

                    {/* Tstart */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Start Time (HH:MM)</label>
                        <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Tstart}</p>
                    </div>

                    {/* Tend */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">End Time (HH:MM)</label>
                        <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Tend}</p>
                    </div>

                    {/* JenisLogId */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Jenis Log</label>
                        <p className="text-sm text-gray-900 dark:text-gray-200">{getJenisLogLabel(currentEntry.JenisLogId)}</p>
                    </div>

                    {/* IsLuring */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mode</label>
                        <p className="text-sm text-gray-900 dark:text-gray-200">{getModeLabel(currentEntry.IsLuring)}</p>
                    </div>

                    {/* Lokasi */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Lokasi</label>
                        <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Lokasi}</p>
                    </div>

                    {/* Keterangan - Full Width */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Keterangan</label>
                        <p className="text-sm text-gray-900 dark:text-gray-200">{currentEntry.Keterangan}</p>
                    </div>

                    {/* Dosen */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                            Dosen Pembimbing {lecturers.length > 0 && `(${lecturers.length} available)`}
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-200">
                            {currentEntry.Dosen ? (
                                lecturers.length > 0 ? (
                                    currentEntry.Dosen.split(',')
                                        .map(id => {
                                            const lecturerId = parseInt(id.trim(), 10);
                                            const lecturer = lecturers.find(l => l.id === lecturerId);
                                            return lecturer ? lecturer.name : `Dosen ${id}`;
                                        })
                                        .join(', ')
                                ) : (
                                    currentEntry.Dosen
                                )
                            ) : '-'}
                        </p>
                    </div>

                    {/* File Upload */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                            Supporting File (Optional)
                        </label>
                        <div className="space-y-2">
                            <input
                                type="file"
                                onChange={handleFileUploadInViewMode}
                                className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 file:mr-3 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                disabled={isSubmitting}
                            />
                            {fileError && (
                                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-red-800 dark:text-red-300">File Too Large</p>
                                            <p className="text-xs text-red-700 dark:text-red-400 mt-1">{fileError}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFileError(null)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {entry.fileName && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-900 dark:text-gray-200 flex-1">{entry.fileName}</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(true)}
                                        disabled={isSubmitting}
                                        className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFileRemoveInViewMode}
                                        disabled={isSubmitting}
                                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* File Preview Modal */}
            {entry.fileName && entry.fileData && (
                <FilePreviewModal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    fileName={entry.fileName}
                    fileData={entry.fileData}
                />
            )}
        </div>
    );
}

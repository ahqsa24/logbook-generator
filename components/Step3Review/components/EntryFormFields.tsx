'use client';

import { useState } from 'react';
import { LogbookEntry } from '@/types/logbook';
import { formatDateForInput, formatDateForDisplay, formatTimeInput } from '../utils';
import { FilePreviewModal } from './FilePreviewModal';

interface Lecturer {
    id: number;
    name: string;
}

interface EntryFormFieldsProps {
    entry: LogbookEntry;
    lecturers: Lecturer[];
    isEditing: boolean;
    onFieldChange: (field: keyof LogbookEntry, value: any) => void;
    fileInputRef?: React.RefObject<HTMLInputElement>;
    isSubmitting?: boolean;
    onFileRemove?: () => void;
}

export default function EntryFormFields({
    entry,
    lecturers,
    isEditing,
    onFieldChange,
    fileInputRef,
    isSubmitting = false,
    onFileRemove,
}: EntryFormFieldsProps) {
    const [fileError, setFileError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [fileLoading, setFileLoading] = useState(false);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Waktu */}
            <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Waktu (DD/MM/YYYY)</label>
                {isEditing ? (
                    <input
                        type="date"
                        value={formatDateForInput(entry.Waktu)}
                        onChange={(e) => onFieldChange('Waktu', formatDateForDisplay(e.target.value))}
                        min="1900-01-01"
                        max="2099-12-31"
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                    />
                ) : (
                    <p className="text-sm text-gray-900 dark:text-gray-200">{entry.Waktu}</p>
                )}
            </div>

            {/* Tstart */}
            <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Start Time (HH:MM)</label>
                {isEditing ? (
                    <input
                        type="time"
                        value={entry.Tstart}
                        onChange={(e) => onFieldChange('Tstart', e.target.value)}
                        onBlur={(e) => {
                            const formatted = formatTimeInput(e.target.value);
                            if (formatted) onFieldChange('Tstart', formatted);
                        }}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                    />
                ) : (
                    <p className="text-sm text-gray-900 dark:text-gray-200">{entry.Tstart}</p>
                )}
            </div>

            {/* Tend */}
            <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">End Time (HH:MM)</label>
                {isEditing ? (
                    <input
                        type="time"
                        value={entry.Tend}
                        onChange={(e) => onFieldChange('Tend', e.target.value)}
                        onBlur={(e) => {
                            const formatted = formatTimeInput(e.target.value);
                            if (formatted) onFieldChange('Tend', formatted);
                        }}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200 dark:[color-scheme:dark]"
                    />
                ) : (
                    <p className="text-sm text-gray-900 dark:text-gray-200">{entry.Tend}</p>
                )}
            </div>

            {/* JenisLogId */}
            <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Jenis Log</label>
                {isEditing ? (
                    <select
                        value={entry.JenisLogId}
                        onChange={(e) => onFieldChange('JenisLogId', Number(e.target.value))}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value={1}>1 - Pembimbingan</option>
                        <option value={2}>2 - Ujian</option>
                        <option value={3}>3 - Kegiatan</option>
                    </select>
                ) : (
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                        {entry.JenisLogId === 1 ? '1 - Pembimbingan' : entry.JenisLogId === 2 ? '2 - Ujian' : '3 - Kegiatan'}
                    </p>
                )}
            </div>

            {/* IsLuring */}
            <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mode</label>
                {isEditing ? (
                    <select
                        value={entry.IsLuring}
                        onChange={(e) => onFieldChange('IsLuring', Number(e.target.value))}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value={0}>0 - Online</option>
                        <option value={1}>1 - Offline</option>
                        <option value={2}>2 - Hybrid</option>
                    </select>
                ) : (
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                        {entry.IsLuring === 0 ? '0 - Online' : entry.IsLuring === 1 ? '1 - Offline' : '2 - Hybrid'}
                    </p>
                )}
            </div>

            {/* Lokasi */}
            <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Lokasi</label>
                {isEditing ? (
                    <input
                        type="text"
                        value={entry.Lokasi}
                        onChange={(e) => onFieldChange('Lokasi', e.target.value)}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                    />
                ) : (
                    <p className="text-sm text-gray-900 dark:text-gray-200">{entry.Lokasi}</p>
                )}
            </div>

            {/* Keterangan - Full Width */}
            <div className="md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Keterangan</label>
                {isEditing ? (
                    <textarea
                        value={entry.Keterangan}
                        onChange={(e) => onFieldChange('Keterangan', e.target.value)}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                        rows={2}
                    />
                ) : (
                    <p className="text-sm text-gray-900 dark:text-gray-200">{entry.Keterangan}</p>
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
                                const selectedIds = entry.Dosen
                                    ? entry.Dosen.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
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
                                                const currentIds = entry.Dosen
                                                    ? entry.Dosen.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
                                                    : [];

                                                let newIds: number[];
                                                if (e.target.checked) {
                                                    newIds = [...currentIds, lecturer.id].sort((a, b) => a - b);
                                                } else {
                                                    newIds = currentIds.filter(id => id !== lecturer.id);
                                                }

                                                const dosenString = newIds.length > 0 ? newIds.join(',') : '';
                                                onFieldChange('Dosen', dosenString);
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
                            value={entry.Dosen || ''}
                            onChange={(e) => onFieldChange('Dosen', e.target.value)}
                            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
                            placeholder="Optional (e.g., 1,2)"
                        />
                    )
                ) : (
                    <p className="text-sm text-gray-900 dark:text-gray-200">
                        {entry.Dosen ? (
                            lecturers.length > 0 ? (
                                entry.Dosen.split(',')
                                    .map(id => {
                                        const lecturerId = parseInt(id.trim(), 10);
                                        const lecturer = lecturers.find(l => l.id === lecturerId);
                                        return lecturer ? lecturer.name : `Dosen ${id}`;
                                    })
                                    .join(', ')
                            ) : (
                                entry.Dosen
                            )
                        ) : '-'}
                    </p>
                )}
            </div>

            {/* Supporting File */}
            <div className="md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                    Supporting File (Optional)
                </label>

                <div className="space-y-2">
                    {/* Caution Message */}
                    <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-200">
                        <strong>⚠️ Caution:</strong> File upload when adding/editing entries may be unstable. For reliable results, please attach files in your <strong>ZIP upload</strong> or add them in the <strong>Review step without editing</strong>.
                    </div>

                    {isEditing && (
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFileError(null);
                                    setFileLoading(true);

                                    try {
                                        const { validateFileSize } = await import('../utils/fileUploadHelper');
                                        const validation = validateFileSize(file);

                                        if (!validation.valid) {
                                            setFileError(validation.error || 'File size exceeds limit');
                                            e.target.value = '';
                                            setFileLoading(false);
                                            return;
                                        }

                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            const base64 = (reader.result as string).split(',')[1];
                                            console.log('[DEBUG] File read complete:', {
                                                fileName: file.name,
                                                base64Length: base64.length
                                            });
                                            onFieldChange('fileData', base64);
                                            onFieldChange('fileName', file.name);
                                            setFileLoading(false);
                                        };
                                        reader.onerror = () => {
                                            setFileError('Failed to read file. Please try again.');
                                            setFileLoading(false);
                                            e.target.value = '';
                                        };
                                        reader.readAsDataURL(file);
                                    } catch (error) {
                                        setFileError('An error occurred while processing the file.');
                                        setFileLoading(false);
                                        e.target.value = '';
                                    }
                                }
                            }}
                            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 file:mr-3 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                            disabled={isSubmitting}
                        />
                    )}

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

                    {fileLoading && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
                            <svg className="animate-spin h-4 w-4 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm text-blue-800 dark:text-blue-200">Processing file...</span>
                        </div>
                    )}

                    {entry.fileName && !fileLoading && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-900 dark:text-gray-200 flex-1">
                                {entry.fileName}
                                {entry.fileData && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Ready</span>
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (entry.fileData) {
                                        setShowPreview(true);
                                    } else {
                                        setFileError('File data not ready. Please wait or re-upload.');
                                    }
                                }}
                                disabled={isSubmitting || !entry.fileData}
                                className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!entry.fileData ? 'File data not ready' : 'Preview file'}
                            >
                                View
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (onFileRemove) {
                                            onFileRemove();
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

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

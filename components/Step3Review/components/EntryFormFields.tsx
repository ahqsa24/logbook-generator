'use client';

import { LogbookEntry } from '@/types/logbook';
import { formatDateForInput, formatDateForDisplay, formatTimeInput } from '../utils';

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
                {isEditing ? (
                    <div className="space-y-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        const base64 = (reader.result as string).split(',')[1];
                                        onFieldChange('fileData', base64);
                                        onFieldChange('fileName', file.name);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 file:mr-3 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white file:text-gray-700 file:border file:border-gray-300 hover:file:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
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
                                        if (onFileRemove) {
                                            onFileRemove();
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
                        {entry.fileName && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm text-gray-900 dark:text-gray-200 flex-1">{entry.fileName}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

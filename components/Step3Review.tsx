'use client';

import { LogbookEntry } from '@/types/logbook';

interface Step3ReviewProps {
    entries: LogbookEntry[];
    isSubmitting: boolean;
    currentSubmission: number;
    onFileUpload: (index: number, file: File) => void;
    onSubmit: () => void;
    onBack: () => void;
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
    currentSubmission,
    onFileUpload,
    onSubmit,
    onBack,
}: Step3ReviewProps) {
    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Step 3: Review & Submit
            </h2>

            <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Found <strong>{entries.length}</strong> entries. Please review before submitting.
                </p>

                {/* Scrollable table with full content */}
                <div className="overflow-auto max-h-[500px] border border-purple-200 dark:border-gray-700 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-purple-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2 text-left text-gray-900 dark:text-gray-200 whitespace-nowrap">#</th>
                                <th className="px-3 py-2 text-left text-gray-900 dark:text-gray-200 whitespace-nowrap">Waktu</th>
                                <th className="px-3 py-2 text-left text-gray-900 dark:text-gray-200 whitespace-nowrap">Tstart</th>
                                <th className="px-3 py-2 text-left text-gray-900 dark:text-gray-200 whitespace-nowrap">Tend</th>
                                <th className="px-3 py-2 text-left text-gray-900 dark:text-gray-200 whitespace-nowrap">Jenis Log</th>
                                <th className="px-3 py-2 text-left text-gray-900 dark:text-gray-200 whitespace-nowrap">Mode</th>
                                <th className="px-3 py-2 text-left text-gray-900 dark:text-gray-200 whitespace-nowrap">Lokasi</th>
                                <th className="px-3 py-2 text-left text-gray-900 dark:text-gray-200 min-w-[300px]">Keterangan</th>
                                <th className="px-3 py-2 text-left text-gray-900 dark:text-gray-200 whitespace-nowrap">File</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, idx) => (
                                <tr key={idx} className="border-t border-purple-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300">{idx + 1}</td>
                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300 whitespace-nowrap">{entry.Waktu}</td>
                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300 whitespace-nowrap">{entry.Tstart}</td>
                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300 whitespace-nowrap">{entry.Tend}</td>
                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300 whitespace-nowrap">{getJenisLogLabel(entry.JenisLogId)}</td>
                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300 whitespace-nowrap">{getModeLabel(entry.IsLuring)}</td>
                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-300 whitespace-nowrap">{entry.Lokasi}</td>
                                    <td className="px-3 py-2 text-gray-700 dark:text-gray-400">
                                        <div className="max-w-md whitespace-normal break-words">
                                            {entry.Keterangan}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="file"
                                            onChange={(e) =>
                                                e.target.files?.[0] &&
                                                onFileUpload(idx, e.target.files[0])
                                            }
                                            className="text-xs dark:text-gray-300"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        />
                                        {entry.fileName && (
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                ✓ {entry.fileName}
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                    disabled={isSubmitting}
                >
                    Back
                </button>
                <button
                    className="btn-primary flex-1"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit All'}
                </button>
            </div>
        </div>
    );
}

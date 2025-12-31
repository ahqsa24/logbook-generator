'use client';

import { SubmissionResult } from '@/types/logbook';

interface Step4ResultsProps {
    results: SubmissionResult[];
    onDownload: () => void;
    onStartOver: () => void;
}

const getJenisLogLabel = (id: number) => {
    const labels = { 1: 'Pembimbingan', 2: 'Ujian', 3: 'Kegiatan' };
    return labels[id as keyof typeof labels] || id;
};

const getModeLabel = (mode: number) => {
    const labels = { 0: 'Online', 1: 'Offline', 2: 'Hybrid' };
    return labels[mode as keyof typeof labels] || mode;
};

export default function Step4Results({
    results,
    onDownload,
    onStartOver,
}: Step4ResultsProps) {
    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'error').length;

    // Calculate total duration from successful entries
    const totalDuration = results
        .filter((r) => r.status === 'success' && r.entry)
        .reduce((total, r) => {
            const entry = r.entry!;
            if (entry.Tstart && entry.Tend) {
                // Parse time strings (HH:MM format)
                const [startHour, startMin] = entry.Tstart.split(':').map(Number);
                const [endHour, endMin] = entry.Tend.split(':').map(Number);

                // Convert to minutes
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;

                // Calculate duration in hours
                const durationMinutes = endMinutes - startMinutes;
                const durationHours = durationMinutes / 60;

                return total + durationHours;
            }
            return total;
        }, 0);

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Submission Results
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Entries</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                        {results.length}
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Successful</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                        {successCount}
                    </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">Failed</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                        {failureCount}
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 text-center">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Duration</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                        {totalDuration.toFixed(1)}h
                    </p>
                </div>
            </div>

            {/* Results Table - Scrollable (Vertical & Horizontal for mobile) */}
            <div className="max-h-[600px] overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
                <table className="w-full text-sm min-w-[1200px]">
                    <thead className="bg-purple-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 border-b dark:border-gray-600 whitespace-nowrap">No</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 border-b dark:border-gray-600 whitespace-nowrap">Waktu</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 border-b dark:border-gray-600 whitespace-nowrap">Keterangan</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 border-b dark:border-gray-600 whitespace-nowrap">Durasi</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 border-b dark:border-gray-600 whitespace-nowrap">Media</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 border-b dark:border-gray-600 whitespace-nowrap">Jenis Kegiatan</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 border-b dark:border-gray-600 whitespace-nowrap">Dosen Penggerak</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 border-b dark:border-gray-600 whitespace-nowrap">Dokumen</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 border-b dark:border-gray-600 whitespace-nowrap">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result, idx) => {
                            const entry = result.entry;
                            const isSuccess = result.status === 'success';

                            return (
                                <tr
                                    key={idx}
                                    className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${isSuccess ? 'bg-white dark:bg-gray-900' : 'bg-red-50/30 dark:bg-red-900/10'
                                        }`}
                                >
                                    {/* No */}
                                    <td className="px-3 py-3 text-gray-900 dark:text-gray-300 align-top">
                                        {idx + 1}
                                    </td>

                                    {/* Waktu */}
                                    <td className="px-3 py-3 text-gray-900 dark:text-gray-300 align-top whitespace-nowrap">
                                        {entry?.Waktu || '-'}
                                    </td>

                                    {/* Keterangan - Full text */}
                                    <td className="px-3 py-3 text-gray-900 dark:text-gray-300 align-top min-w-[300px] max-w-[400px]">
                                        {entry?.Keterangan || '-'}
                                    </td>

                                    {/* Durasi */}
                                    <td className="px-3 py-3 text-gray-900 dark:text-gray-300 align-top whitespace-nowrap">
                                        {entry ? `${entry.Tstart} - ${entry.Tend}` : '-'}
                                    </td>

                                    {/* Media */}
                                    <td className="px-3 py-3 text-gray-900 dark:text-gray-300 align-top whitespace-nowrap">
                                        {entry ? getModeLabel(entry.IsLuring) : '-'}
                                    </td>

                                    {/* Jenis Kegiatan */}
                                    <td className="px-3 py-3 text-gray-900 dark:text-gray-300 align-top whitespace-nowrap">
                                        {entry ? getJenisLogLabel(entry.JenisLogId) : '-'}
                                    </td>

                                    {/* Dosen Penggerak */}
                                    <td className="px-3 py-3 text-gray-900 dark:text-gray-300 align-top whitespace-nowrap">
                                        {entry?.Dosen || '-'}
                                    </td>

                                    {/* Dokumen - Clickable */}
                                    <td className="px-3 py-3 text-gray-900 dark:text-gray-300 align-top whitespace-nowrap">
                                        {entry?.fileName ? (
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    alert(`File: ${entry.fileName}\n\nNote: Download functionality requires backend implementation.`);
                                                }}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                title={entry.fileName}
                                            >
                                                📎 {entry.fileName}
                                            </a>
                                        ) : '-'}
                                    </td>

                                    {/* Status - Full text */}
                                    <td className="px-3 py-3 align-top min-w-[150px]">
                                        <div className="flex flex-col gap-1">
                                            {isSuccess ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 w-fit whitespace-nowrap">
                                                    ✓ Success
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 w-fit whitespace-nowrap">
                                                        ✗ Error
                                                    </span>
                                                    {result.error && (
                                                        <span className="text-xs text-red-600 dark:text-red-400">
                                                            {result.error}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    className="btn-secondary flex-1"
                    onClick={onDownload}
                >
                    Download CSV
                </button>
                <button
                    className="btn-primary flex-1"
                    onClick={onStartOver}
                >
                    Start Over
                </button>
            </div>
        </div>
    );
}

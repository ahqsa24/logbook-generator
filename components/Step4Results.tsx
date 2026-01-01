'use client';

import { useState } from 'react';
import { SubmissionResult, Lecturer } from '@/types/logbook';

interface Step4ResultsProps {
    results: SubmissionResult[];
    lecturers: Lecturer[];
    onDownloadCSV: () => void;
    onDownloadXLSX: () => void;
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
    lecturers,
    onDownloadCSV,
    onDownloadXLSX,
    onStartOver,
}: Step4ResultsProps) {
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
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

    const handleDownloadFormat = (format: 'csv' | 'xlsx') => {
        setShowDownloadMenu(false);
        if (format === 'csv') {
            onDownloadCSV();
        } else if (format === 'xlsx') {
            onDownloadXLSX();
        }
    };

    // Helper function to convert Dosen IDs to names
    const getDosenNames = (dosenStr: string | undefined): string => {
        if (!dosenStr || dosenStr.trim() === '') return '-';

        if (lecturers.length === 0) {
            // Fallback to numbers if lecturers not loaded
            return dosenStr;
        }

        // Parse comma-separated IDs and convert to names
        return dosenStr
            .split(',')
            .map(id => {
                const lecturerId = parseInt(id.trim(), 10);
                const lecturer = lecturers.find(l => l.id === lecturerId);
                return lecturer ? lecturer.name : `Dosen ${id}`;
            })
            .join(', ');
    };

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
                                        {getDosenNames(entry?.Dosen)}
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
                {/* Download Button with Dropdown */}
                <div className="relative flex-1">
                    <button
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    >
                        <span>Download</span>
                        <svg className={`w-4 h-4 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showDownloadMenu && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
                            <button
                                onClick={() => handleDownloadFormat('csv')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center gap-2"
                            >
                                <span>📄</span>
                                <span>CSV Format</span>
                            </button>
                            <button
                                onClick={() => handleDownloadFormat('xlsx')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center gap-2"
                            >
                                <span>📊</span>
                                <span>Excel (XLSX)</span>
                            </button>
                        </div>
                    )}
                </div>

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

/**
 * Results Table Component - Display submission results in table format
 */

import { SubmissionResult, Lecturer } from '@/types/logbook';
import { getJenisLogLabel, getModeLabel, getDosenNames } from '../utils';

interface ResultsTableProps {
    results: SubmissionResult[];
    lecturers: Lecturer[];
}

export const ResultsTable = ({ results, lecturers }: ResultsTableProps) => {
    return (
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
                                    {getDosenNames(entry?.Dosen, lecturers)}
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
    );
};

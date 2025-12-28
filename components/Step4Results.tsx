'use client';

import { SubmissionResult } from '@/types/logbook';

interface Step4ResultsProps {
    results: SubmissionResult[];
    onDownload: () => void;
    onStartOver: () => void;
}

export default function Step4Results({
    results,
    onDownload,
    onStartOver,
}: Step4ResultsProps) {
    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'error').length;

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Submission Results
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Successful</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                        {successCount}
                    </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">Failed</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                        {failureCount}
                    </p>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-purple-200 dark:border-gray-700 rounded-lg mb-6">
                <table className="w-full text-sm">
                    <thead className="bg-purple-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-200">Row</th>
                            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-200">Status</th>
                            <th className="px-4 py-2 text-left text-gray-900 dark:text-gray-200">Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result, idx) => (
                            <tr key={idx} className="border-t border-purple-100 dark:border-gray-700">
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-300">{(result.row ?? idx) + 1}</td>
                                <td className="px-4 py-2">
                                    <span
                                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${result.status === 'success'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                            }`}
                                    >
                                        {result.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                    {result.error || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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

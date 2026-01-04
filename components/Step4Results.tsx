'use client';

import { useExport } from './Step4Results/hooks';
import { StatusSummary, DownloadButton, ResultsTable } from './Step4Results/components';
import { calculateTotalDuration } from './Step4Results/utils';
import type { Step4ResultsProps } from './Step4Results/types';

export default function Step4Results({
    results,
    lecturers,
    onDownloadCSV,
    onDownloadXLSX,
    onStartOver,
}: Step4ResultsProps) {
    // Use custom hooks
    const {
        showDownloadMenu,
        handleDownloadFormat,
        toggleDownloadMenu
    } = useExport(onDownloadCSV, onDownloadXLSX);

    // Calculate statistics
    const successCount = results.filter((r) => r.status === 'success').length;
    const failureCount = results.filter((r) => r.status === 'error').length;
    const totalDuration = calculateTotalDuration(results);

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Submission Results
            </h2>

            {/* Summary Cards */}
            <StatusSummary
                totalCount={results.length}
                successCount={successCount}
                failureCount={failureCount}
                totalDuration={totalDuration}
            />

            {/* Results Table - Scrollable (Vertical & Horizontal for mobile) */}
            <ResultsTable results={results} lecturers={lecturers} />

            {/* Action Buttons */}
            <div className="flex gap-4">
                {/* Download Button with Dropdown */}
                <DownloadButton
                    showMenu={showDownloadMenu}
                    onToggleMenu={toggleDownloadMenu}
                    onSelectFormat={handleDownloadFormat}
                />

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

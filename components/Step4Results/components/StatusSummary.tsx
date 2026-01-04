/**
 * Status Summary Component - Display success/error/total counts
 */

interface StatusSummaryProps {
    totalCount: number;
    successCount: number;
    failureCount: number;
    totalDuration: number;
}

export const StatusSummary = ({
    totalCount,
    successCount,
    failureCount,
    totalDuration
}: StatusSummaryProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Entries</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {totalCount}
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
    );
};

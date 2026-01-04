/**
 * Progress Indicator Component for submission progress
 */

interface ProgressIndicatorProps {
    currentSubmission: number;
    totalEntries: number;
    isSubmitting: boolean;
}

export const ProgressIndicator = ({
    currentSubmission,
    totalEntries,
    isSubmitting
}: ProgressIndicatorProps) => {
    if (!isSubmitting) return null;

    const percentage = Math.round((currentSubmission / totalEntries) * 100);
    const isRefreshing = currentSubmission > 0 && currentSubmission % 25 === 0 && currentSubmission < totalEntries;

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Submitting {currentSubmission} of {totalEntries}
                </span>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                    {percentage}%
                </span>
            </div>
            <div className="w-full bg-purple-100 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div
                    className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {isRefreshing && (
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium animate-pulse mt-3">
                    Refreshing session cookies...
                </div>
            )}
        </div>
    );
};

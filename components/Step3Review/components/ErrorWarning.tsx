/**
 * Error Warning Component
 */

interface ErrorWarningProps {
    errorCount: number;
    currentErrorIndex: number;
    onJumpToError: () => void;
}

export const ErrorWarning = ({
    errorCount,
    currentErrorIndex,
    onJumpToError
}: ErrorWarningProps) => {
    if (errorCount === 0) return null;

    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2 flex-1">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-red-900 dark:text-red-300">
                            Validation Errors Detected
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                            Some entries have validation errors. Please fix them before submitting. Click &quot;Edit&quot; to modify the entry.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={onJumpToError}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm whitespace-nowrap"
                    >
                        Jump to Error
                    </button>
                    <span className="text-xs text-red-700 dark:text-red-400 font-medium">
                        Error {currentErrorIndex + 1} of {errorCount}
                    </span>
                </div>
            </div>
        </div>
    );
};

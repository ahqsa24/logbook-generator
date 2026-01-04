/**
 * Empty Warning Component
 */

export const EmptyWarning = () => {
    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                    <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                        Empty Entries Detected
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        All entries are empty. Please fill in the required fields before submitting.
                    </p>
                </div>
            </div>
        </div>
    );
};

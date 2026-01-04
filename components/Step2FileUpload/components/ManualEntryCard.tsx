/**
 * Manual Entry Card Component - Option to create logbook manually
 */

interface ManualEntryCardProps {
    onManualEntry: () => void;
}

export const ManualEntryCard = ({ onManualEntry }: ManualEntryCardProps) => {
    return (
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                        Don&apos;t have a file and want to create logbook manually?
                    </p>
                    <button
                        onClick={onManualEntry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Manually
                    </button>
                </div>
            </div>
        </div>
    );
};

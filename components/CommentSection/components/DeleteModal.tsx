/**
 * Delete Confirmation Modal Component (reusable from Step3Review)
 */

import type { DeleteTarget } from '../types';

interface DeleteModalProps {
    isOpen: boolean;
    deleteTarget: DeleteTarget | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteModal = ({
    isOpen,
    deleteTarget,
    onConfirm,
    onCancel
}: DeleteModalProps) => {
    if (!isOpen || !deleteTarget) return null;

    const isReply = deleteTarget.replyId !== undefined;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Delete {isReply ? 'Reply' : 'Comment'}?
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete this {isReply ? 'reply' : 'comment'}? This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors shadow-sm hover:shadow-md"
                    >
                        Delete {isReply ? 'Reply' : 'Comment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

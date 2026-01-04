/**
 * Reply Form Component - For adding replies to comments
 */

interface ReplyFormProps {
    replyName: string;
    setReplyName: (name: string) => void;
    replyText: string;
    setReplyText: (text: string) => void;
    replyNameError: string;
    isAdminMode: boolean;
    onSubmit: () => void;
    onCancel: () => void;
    onNameChange: (value: string) => void;
}

export const ReplyForm = ({
    replyName,
    setReplyName,
    replyText,
    setReplyText,
    replyNameError,
    isAdminMode,
    onSubmit,
    onCancel,
    onNameChange
}: ReplyFormProps) => {
    return (
        <div className="mb-4">
            <div className="space-y-3">
                <input
                    type="text"
                    value={isAdminMode && !replyName ? 'Admin' : replyName}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder={isAdminMode ? 'Admin' : 'Your name'}
                    className={`w-full px-3 py-2 text-sm rounded-lg border-b-2 ${replyNameError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors`}
                />
                {replyNameError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-fadeIn">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {replyNameError}
                    </p>
                )}
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add a reply..."
                    rows={2}
                    className="w-full px-3 py-1 text-sm rounded-lg border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors resize-none"
                />
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!(isAdminMode || replyName.trim()) || !replyText.trim() || !!replyNameError}
                        className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Reply
                    </button>
                </div>
            </div>
        </div>
    );
};

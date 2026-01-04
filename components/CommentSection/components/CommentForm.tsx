/**
 * Comment Form Component - For adding new comments
 */

interface CommentFormProps {
    commentName: string;
    setCommentName: (name: string) => void;
    commentText: string;
    setCommentText: (text: string) => void;
    nameError: string;
    isAdminMode: boolean;
    onSubmit: () => void;
    onNameChange: (value: string) => void;
}

export const CommentForm = ({
    commentName,
    setCommentName,
    commentText,
    setCommentText,
    nameError,
    isAdminMode,
    onSubmit,
    onNameChange
}: CommentFormProps) => {
    return (
        <div className="space-y-4">
            {/* Name Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={commentName}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Your name"
                    className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm ${nameError ? 'border-red-500 dark:border-red-500' : ''
                        }`}
                />
                {nameError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-fadeIn">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {nameError}
                    </p>
                )}
            </div>

            {/* Comment Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write your comment here..."
                    rows={4}
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm resize-none"
                />
            </div>

            {/* Submit Button */}
            <button
                onClick={onSubmit}
                disabled={!commentName.trim() || !commentText.trim() || !!nameError}
                className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Post Comment
            </button>
        </div>
    );
};

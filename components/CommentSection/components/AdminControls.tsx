/**
 * Admin Controls Component - Pin and Delete buttons for admin
 */

interface AdminControlsProps {
    commentId: string;
    isPinned: boolean;
    onPin: (commentId: string) => void;
    onDelete: (commentId: string) => void;
    showDelete?: boolean;
}

export const AdminControls = ({
    commentId,
    isPinned,
    onPin,
    onDelete,
    showDelete = true
}: AdminControlsProps) => {
    return (
        <>
            {/* Pin Button */}
            <button
                onClick={() => onPin(commentId)}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${isPinned
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                    }`}
            >
                <svg className="w-4 h-4" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 16 16" strokeWidth="1.5">
                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                </svg>
                {isPinned ? 'Unpin' : 'Pin'}
            </button>

            {/* Delete Button */}
            {showDelete && (
                <button
                    onClick={() => onDelete(commentId)}
                    className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                    title="Delete comment"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
        </>
    );
};

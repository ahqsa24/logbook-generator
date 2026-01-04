/**
 * Reply Card Component - Individual reply display
 */

import { formatDate, formatTime } from '../utils';

interface Reply {
    id: string;
    name: string;
    comment: string;
    timestamp: Date | string;
    is_admin?: boolean;
}

interface ReplyCardProps {
    reply: Reply;
    commentId: string;
    isAdminMode: boolean;
    onDelete: (commentId: string, replyId: string) => void;
}

export const ReplyCard = ({
    reply,
    commentId,
    isAdminMode,
    onDelete
}: ReplyCardProps) => {
    return (
        <div className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center text-white text-xs font-semibold">
                {reply.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-200">
                        {reply.name}
                    </span>
                    {(reply.is_admin || reply.name.toLowerCase() === 'admin') && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700">
                            Admin
                        </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(reply.timestamp)} {formatTime(reply.timestamp)}
                    </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {reply.comment}
                </p>

                {/* Delete button for admin */}
                {isAdminMode && (
                    <button
                        onClick={() => onDelete(commentId, reply.id)}
                        className="mt-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};

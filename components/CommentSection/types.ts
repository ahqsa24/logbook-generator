/**
 * Local types for CommentSection module
 */

export interface Reply {
    id: string;
    name: string;
    comment: string;
    timestamp: Date | string;
    is_admin?: boolean;
}

export interface Comment {
    id: string;
    name: string;
    comment: string;
    timestamp: Date | string;
    replies?: Reply[];
    likes?: number;
    is_admin?: boolean;
    is_pinned?: boolean;
    pinned_at?: Date | string;
}

export type SortOption = 'most-liked' | 'newest' | 'oldest';

export interface DeleteTarget {
    commentId: string;
    replyId?: string;
}

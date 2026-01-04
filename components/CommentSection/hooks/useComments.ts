/**
 * Custom hook for managing comments data and operations
 */

import { useState, useEffect } from 'react';
import type { Comment, Reply, SortOption } from '../types';

export const useComments = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('most-liked');

    // Fetch comments from API
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch('/api/comments');
                const data = await response.json();
                if (data.success) {
                    if (data.comments && data.comments.length > 0) {
                        console.log('First comment from API:', data.comments[0]);
                        console.log('Has is_admin?', 'is_admin' in data.comments[0]);
                        console.log('Has is_pinned?', 'is_pinned' in data.comments[0]);
                    }
                    setComments(data.comments);
                }
            } catch (error) {
                console.error('Failed to load comments:', error);
            }
        };

        fetchComments();
    }, []);

    // Add new comment
    const addComment = async (name: string, comment: string, isAdmin: boolean) => {
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    comment,
                    is_admin: isAdmin
                })
            });

            const data = await response.json();
            if (data.success) {
                console.log('New comment from API:', data.comment);
                console.log('is_admin field:', data.comment.is_admin);

                setComments([{
                    ...data.comment,
                    timestamp: new Date(data.comment.timestamp),
                    replies: []
                }, ...comments]);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add comment:', error);
            return false;
        }
    };

    // Add reply to comment
    const addReply = async (commentId: string, name: string, comment: string, isAdmin: boolean) => {
        try {
            const response = await fetch(`/api/comments/${commentId}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    comment,
                    is_admin: isAdmin
                })
            });

            const data = await response.json();
            if (data.success) {
                const updatedComments = comments.map(c => {
                    if (c.id === commentId) {
                        return {
                            ...c,
                            replies: [
                                ...(c.replies || []),
                                {
                                    ...data.reply,
                                    timestamp: new Date(data.reply.timestamp)
                                }
                            ]
                        };
                    }
                    return c;
                });
                setComments(updatedComments);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add reply:', error);
            return false;
        }
    };

    // Delete comment or reply
    const deleteItem = async (commentId: string, replyId?: string) => {
        try {
            if (replyId) {
                // Delete reply
                const response = await fetch(`/api/comments/${commentId}/replies/${replyId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                if (data.success) {
                    const updatedComments = comments.map(c => {
                        if (c.id === commentId) {
                            return {
                                ...c,
                                replies: c.replies?.filter(r => r.id !== replyId)
                            };
                        }
                        return c;
                    });
                    setComments(updatedComments);
                    return true;
                }
            } else {
                // Delete comment
                const response = await fetch(`/api/comments/${commentId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                if (data.success) {
                    setComments(comments.filter(c => c.id !== commentId));
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Failed to delete:', error);
            return false;
        }
    };

    // Pin/unpin comment
    const togglePin = async (commentId: string) => {
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return false;

        const isPinned = comment.is_pinned;
        const currentPinnedCount = comments.filter(c => c.is_pinned).length;

        // Check if trying to pin and already have 3 pinned
        if (!isPinned && currentPinnedCount >= 3) {
            alert('Maximum 3 comments can be pinned. Please unpin another comment first.');
            return false;
        }

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_pinned: !isPinned,
                    pinned_at: !isPinned ? new Date().toISOString() : null
                })
            });

            const data = await response.json();
            if (data.success) {
                const updatedComments = comments.map(c => {
                    if (c.id === commentId) {
                        return {
                            ...c,
                            is_pinned: !isPinned,
                            pinned_at: !isPinned ? new Date() : undefined
                        };
                    }
                    return c;
                });
                setComments(updatedComments);
                return true;
            } else if (data.error) {
                alert(data.error);
            }
            return false;
        } catch (error) {
            console.error('Failed to pin comment:', error);
            return false;
        }
    };

    // Get sorted comments
    const getSortedComments = () => {
        const commentsCopy = [...comments];

        // Separate pinned and unpinned comments
        const pinnedComments = commentsCopy.filter(c => c.is_pinned);
        const unpinnedComments = commentsCopy.filter(c => !c.is_pinned);

        // Sort pinned comments by pinned_at (most recently pinned first)
        pinnedComments.sort((a, b) => {
            const dateA = a.pinned_at ? new Date(a.pinned_at).getTime() : 0;
            const dateB = b.pinned_at ? new Date(b.pinned_at).getTime() : 0;
            return dateB - dateA;
        });

        // Sort unpinned comments based on selected sort option
        let sortedUnpinned = unpinnedComments;
        switch (sortBy) {
            case 'most-liked':
                sortedUnpinned = unpinnedComments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case 'newest':
                sortedUnpinned = unpinnedComments;
                break;
            case 'oldest':
                sortedUnpinned = [...unpinnedComments].reverse();
                break;
            default:
                sortedUnpinned = unpinnedComments;
        }

        return [...pinnedComments, ...sortedUnpinned];
    };

    return {
        comments,
        setComments,
        sortBy,
        setSortBy,
        addComment,
        addReply,
        deleteItem,
        togglePin,
        getSortedComments
    };
};

/**
 * Custom hook for managing comment likes
 */

import { useState, useEffect } from 'react';
import type { Comment } from '../types';

const LIKES_STORAGE_KEY = 'ipb-logbook-likes';

export const useLikes = (comments: Comment[], setComments: (comments: Comment[]) => void) => {
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

    // Load liked comments from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
            if (savedLikes) {
                try {
                    const parsed = JSON.parse(savedLikes);
                    setLikedComments(new Set(parsed));
                } catch (e) {
                    console.error('Failed to load likes:', e);
                }
            }
        }
    }, []);

    const handleLike = async (commentId: string) => {
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;

        const isLiked = likedComments.has(commentId);
        const newLikes = isLiked ? Math.max(0, (comment.likes || 0) - 1) : (comment.likes || 0) + 1;

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ likes: newLikes })
            });

            const data = await response.json();
            if (data.success) {
                // Update local state
                const updatedComments = comments.map(c => {
                    if (c.id === commentId) {
                        return { ...c, likes: newLikes };
                    }
                    return c;
                });
                setComments(updatedComments);

                // Update liked state in localStorage
                const newLiked = new Set(likedComments);
                if (isLiked) {
                    newLiked.delete(commentId);
                } else {
                    newLiked.add(commentId);
                }
                setLikedComments(newLiked);
                localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify([...newLiked]));
            }
        } catch (error) {
            console.error('Failed to update like:', error);
        }
    };

    return {
        likedComments,
        handleLike
    };
};

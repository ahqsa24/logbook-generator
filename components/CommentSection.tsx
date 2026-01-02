'use client';

import { useState, useEffect } from 'react';

interface Comment {
    name: string;
    comment: string;
    timestamp: Date;
}

const COMMENTS_STORAGE_KEY = 'ipb-logbook-comments';

export default function CommentSection() {
    const [commentName, setCommentName] = useState('');
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);

    // Load comments from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Convert timestamp strings back to Date objects
                    const commentsWithDates = parsed.map((c: any) => ({
                        ...c,
                        timestamp: new Date(c.timestamp)
                    }));
                    setComments(commentsWithDates);
                } catch (e) {
                    console.error('Failed to load comments:', e);
                }
            }
        }
    }, []);

    // Save comments to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined' && comments.length > 0) {
            try {
                localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
            } catch (e) {
                console.error('Failed to save comments:', e);
            }
        }
    }, [comments]);

    const handleAddComment = () => {
        if (commentName.trim() && commentText.trim()) {
            setComments([...comments, {
                name: commentName,
                comment: commentText,
                timestamp: new Date()
            }]);
            setCommentName('');
            setCommentText('');
        }
    };

    return (
        <div className="mt-12">
            <div className="card dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-2">
                    Leave a Comment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Share your thoughts or feedback about this tool
                </p>

                <div className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={commentName}
                            onChange={(e) => setCommentName(e.target.value)}
                            placeholder="Your name"
                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm"
                        />
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
                        onClick={handleAddComment}
                        disabled={!commentName.trim() || !commentText.trim()}
                        className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Post Comment
                    </button>
                </div>

                {/* Display Comments */}
                {comments.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
                            Comments ({comments.length})
                        </h4>
                        <div className="space-y-3">
                            {comments.map((comment, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900 dark:text-gray-200 text-sm">
                                            {comment.name}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {comment.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


'use client';

import { useState, useEffect } from 'react';

interface Reply {
  name: string;
  comment: string;
  timestamp: Date;
}

interface Comment {
  name: string;
  comment: string;
  timestamp: Date;
  replies?: Reply[];
  likes?: number;
}

const COMMENTS_STORAGE_KEY = 'ipb-logbook-comments';
const LIKES_STORAGE_KEY = 'ipb-logbook-likes';
const ADMIN_MODE_KEY = 'ipb-admin-mode';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

type SortOption = 'most-liked' | 'newest' | 'oldest';

export default function CommentSection() {
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  // Validation states
  const [nameError, setNameError] = useState('');
  const [replyNameError, setReplyNameError] = useState('');

  // Reply states
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyText, setReplyText] = useState('');

  // Like states
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('most-liked');

  // Reply visibility state
  const [viewReplies, setViewReplies] = useState<Set<number>>(new Set());

  // Show more replies state (tracks which comments show all replies)
  const [showMoreReplies, setShowMoreReplies] = useState<Set<number>>(new Set());

  // Admin mode states
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Password modal states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ commentIndex: number; replyIndex?: number } | null>(null);

  // Load comments and admin mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load comments
      const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const commentsWithDates = parsed.map((c: any) => ({
            ...c,
            timestamp: new Date(c.timestamp),
            likes: c.likes || 0,
            replies: c.replies?.map((r: any) => ({
              ...r,
              timestamp: new Date(r.timestamp)
            })) || []
          }));
          setComments(commentsWithDates);
        } catch (e) {
          console.error('Failed to load comments:', e);
        }
      }

      // Load liked comments
      const savedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
      if (savedLikes) {
        try {
          const parsed = JSON.parse(savedLikes);
          setLikedComments(new Set(parsed));
        } catch (e) {
          console.error('Failed to load likes:', e);
        }
      }

      // Load admin mode
      const adminMode = localStorage.getItem(ADMIN_MODE_KEY);
      if (adminMode === 'true') {
        setIsAdminMode(true);
      }
    }
  }, []);

  // Save comments to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (comments.length > 0) {
          localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
        } else {
          localStorage.removeItem(COMMENTS_STORAGE_KEY);
        }
      } catch (e) {
        console.error('Failed to save comments:', e);
      }
    }
  }, [comments]);

  const handleAddComment = () => {
    // Validation already handled by real-time check
    if (nameError) return;

    if (commentName.trim() && commentText.trim()) {
      setComments([...comments, {
        name: commentName,
        comment: commentText,
        timestamp: new Date(),
        replies: [],
        likes: 0
      }]);
      setCommentName('');
      setCommentText('');
      setNameError('');
    }
  };

  const handleCommentNameChange = (value: string) => {
    setCommentName(value);
    // Real-time validation
    if (!isAdminMode && value.trim().toLowerCase() === 'admin') {
      setNameError('The name "Admin" is reserved. Please choose a different name.');
    } else {
      setNameError('');
    }
  };

  const handleAddReply = (commentIndex: number) => {
    const finalReplyName = isAdminMode && !replyName.trim() ? 'Admin' : replyName;

    // Validation already handled by real-time check
    if (replyNameError) return;

    if (finalReplyName.trim() && replyText.trim()) {
      const updatedComments = [...comments];
      if (!updatedComments[commentIndex].replies) {
        updatedComments[commentIndex].replies = [];
      }
      updatedComments[commentIndex].replies!.push({
        name: finalReplyName,
        comment: replyText,
        timestamp: new Date()
      });
      setComments(updatedComments);
      setReplyName('');
      setReplyText('');
      setReplyNameError('');
      setReplyingTo(null);
    }
  };

  const handleReplyNameChange = (value: string) => {
    setReplyName(value);
    // Real-time validation
    if (!isAdminMode && value.trim().toLowerCase() === 'admin') {
      setReplyNameError('The name "Admin" is reserved. Please choose a different name.');
    } else {
      setReplyNameError('');
    }
  };

  const handleAdminLogin = () => {
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      localStorage.setItem(ADMIN_MODE_KEY, 'true');
      setShowAdminModal(false);
      setAdminPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    localStorage.removeItem(ADMIN_MODE_KEY);
  };

  const handleDeleteClick = (commentIndex: number, replyIndex?: number) => {
    setDeleteTarget({ commentIndex, replyIndex });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      const updatedComments = [...comments];

      if (deleteTarget.replyIndex !== undefined) {
        // Delete reply
        updatedComments[deleteTarget.commentIndex].replies?.splice(deleteTarget.replyIndex, 1);
      } else {
        // Delete comment
        updatedComments.splice(deleteTarget.commentIndex, 1);
      }

      setComments(updatedComments);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const handleLike = (commentIndex: number) => {
    if (likedComments.has(commentIndex)) {
      // Unlike
      const updatedComments = [...comments];
      updatedComments[commentIndex].likes = (updatedComments[commentIndex].likes || 0) - 1;
      setComments(updatedComments);

      const newLiked = new Set(likedComments);
      newLiked.delete(commentIndex);
      setLikedComments(newLiked);
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify([...newLiked]));
    } else {
      // Like
      const updatedComments = [...comments];
      updatedComments[commentIndex].likes = (updatedComments[commentIndex].likes || 0) + 1;
      setComments(updatedComments);

      const newLiked = new Set(likedComments);
      newLiked.add(commentIndex);
      setLikedComments(newLiked);
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify([...newLiked]));
    }
  };

  const getSortedComments = () => {
    const commentsCopy = [...comments];

    switch (sortBy) {
      case 'most-liked':
        return commentsCopy.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'newest':
        return commentsCopy.reverse();
      case 'oldest':
        return commentsCopy;
      default:
        return commentsCopy;
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="mt-12">
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-semibold text-purple-900 dark:text-purple-300">
            Leave a Comment
          </h3>
          {/* Admin Toggle Button */}
          {isAdminMode ? (
            <button
              onClick={handleAdminLogout}
              className="text-xs px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              🔓 Admin Mode (Logout)
            </button>
          ) : (
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              🔒 Admin Login
            </button>
          )}
        </div>
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
              onChange={(e) => handleCommentNameChange(e.target.value)}
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
            onClick={handleAddComment}
            disabled={!commentName.trim() || !commentText.trim() || !!nameError}
            className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Comment
          </button>
        </div>

        {/* Display Comments */}
        {comments.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                Comments ({comments.length})
              </h4>
              {/* Filter Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm px-4 py-2 mr-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 cursor-pointer transition-all duration-200 ease-in-out"
              >
                <option value="most-liked">Most Liked</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            {/* Scrollable Comments Container - Max 5 comments visible */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {getSortedComments().map((comment, index) => {
                const commentIndex = comments.findIndex(c => c === comment);
                return (
                  <div key={commentIndex} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    {/* Main Comment - Horizontal Layout */}
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 flex items-center justify-center text-white text-sm font-semibold">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Header - Horizontal */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-900 dark:text-gray-200">
                                {comment.name}
                              </span>
                              {/* Admin Badge */}
                              {comment.name.toLowerCase() === 'admin' && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700">
                                  Admin
                                </span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(comment.timestamp)} {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Comment Text */}
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-2">
                              {comment.comment}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4">
                              {/* Love Button */}
                              <button
                                onClick={() => handleLike(commentIndex)}
                                className={`flex items-center gap-1 text-xs font-medium transition-colors ${likedComments.has(commentIndex)
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                                  }`}
                              >
                                <svg className="w-4 h-4" fill={likedComments.has(commentIndex) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {comment.likes || 0}
                              </button>

                              {/* Reply Button */}
                              <button
                                onClick={() => {
                                  const newViewReplies = new Set<number>();
                                  if (!viewReplies.has(commentIndex)) {
                                    newViewReplies.add(commentIndex);
                                    setReplyingTo(commentIndex);
                                  } else {
                                    setReplyingTo(null);
                                  }
                                  setViewReplies(newViewReplies);
                                }}
                                className={`flex items-center gap-1 text-xs font-medium transition-colors ${viewReplies.has(commentIndex)
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                                  }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {comment.replies?.length || 0}
                              </button>
                            </div>
                          </div>

                          {/* Delete Button - Top Right */}
                          {isAdminMode && (
                            <button
                              onClick={() => handleDeleteClick(commentIndex)}
                              className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                              title="Delete comment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reply Section - Below Main Comment */}
                    <div className="ml-14 mt-3 transition-all duration-300 ease-in-out">
                      {/* Reply Form */}
                      {replyingTo === commentIndex && (
                        <div className="mb-4">
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={isAdminMode && !replyName ? 'Admin' : replyName}
                              onChange={(e) => handleReplyNameChange(e.target.value)}
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
                              className="w-full px-3 py-2 text-sm rounded-lg border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-colors resize-none"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyName('');
                                  setReplyText('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAddReply(commentIndex)}
                                disabled={!(isAdminMode || replyName.trim()) || !replyText.trim() || !!replyNameError}
                                className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display Replies */}
                      {viewReplies.has(commentIndex) && comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-4">
                          {comment.replies
                            .slice(0, showMoreReplies.has(commentIndex) ? comment.replies.length : 5)
                            .map((reply, replyIndex) => (
                              <div key={replyIndex} className="flex gap-3">
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center text-white text-xs font-semibold">
                                  {reply.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-gray-900 dark:text-gray-200">
                                      {reply.name}
                                    </span>
                                    {reply.name.toLowerCase() === 'admin' && (
                                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700">
                                        Admin
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(reply.timestamp)} {reply.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {reply.comment}
                                  </p>

                                  {/* Text-based Delete button for Replies */}
                                  {isAdminMode && (
                                    <button
                                      onClick={() => handleDeleteClick(commentIndex, replyIndex)}
                                      className="mt-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                          {/* Show More Button */}
                          {comment.replies.length > 5 && (
                            <button
                              onClick={() => {
                                const newShowMore = new Set(showMoreReplies);
                                if (showMoreReplies.has(commentIndex)) {
                                  newShowMore.delete(commentIndex);
                                } else {
                                  newShowMore.add(commentIndex);
                                }
                                setShowMoreReplies(newShowMore);
                              }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                              {showMoreReplies.has(commentIndex) ? (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  Show More ({comment.replies.length - 5} more)
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Admin Login Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
                🔐 Admin Login
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter admin password to manage comments
              </p>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  setPasswordError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Enter password"
                className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm mb-4 ${passwordError ? 'border-red-500 dark:border-red-500' : ''}`}
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {passwordError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleAdminLogin}
                  className="btn-primary flex-1"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminPasswordInput('');
                    setPasswordError('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
                ⚠️ Confirm Delete
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this {deleteTarget?.replyIndex !== undefined ? 'reply' : 'comment'}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

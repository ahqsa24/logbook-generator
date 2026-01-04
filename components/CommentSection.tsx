'use client';

import { useState } from 'react';
import { useAdminMode, useComments, useLikes } from './CommentSection/hooks';
import { DeleteModal, CommentForm, ReplyForm, ReplyCard } from './CommentSection/components';
import { formatDate, formatTime } from './CommentSection/utils';
import type { Comment, DeleteTarget } from './CommentSection/types';

type SortOption = 'most-liked' | 'newest' | 'oldest';

export default function CommentSection() {
  // Form states
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [nameError, setNameError] = useState('');
  const [replyNameError, setReplyNameError] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyText, setReplyText] = useState('');

  // Reply visibility states
  const [viewReplies, setViewReplies] = useState<Set<string>>(new Set());
  const [showMoreReplies, setShowMoreReplies] = useState<Set<string>>(new Set());

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Use custom hooks
  const {
    isAdminMode,
    showAdminModal,
    adminPasswordInput,
    setAdminPasswordInput,
    passwordError,
    setPasswordError,
    showPassword,
    setShowPassword,
    handleAdminLogin,
    handleAdminLogout,
    openAdminModal,
    closeAdminModal
  } = useAdminMode();

  const {
    comments,
    setComments,
    sortBy,
    setSortBy,
    addComment,
    addReply,
    deleteItem,
    togglePin,
    getSortedComments
  } = useComments();

  const { likedComments, handleLike } = useLikes(comments, setComments);


  const handleAddComment = async () => {
    if (nameError) return;

    if (commentName.trim() && commentText.trim()) {
      const success = await addComment(commentName, commentText, isAdminMode);
      if (success) {
        setCommentName('');
        setCommentText('');
        setNameError('');
      }
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

  const handleAddReply = async (commentId: string) => {
    const finalReplyName = isAdminMode && !replyName.trim() ? 'Admin' : replyName;

    if (replyNameError) return;

    if (finalReplyName.trim() && replyText.trim()) {
      const success = await addReply(commentId, finalReplyName, replyText, isAdminMode);
      if (success) {
        setReplyName('');
        setReplyText('');
        setReplyNameError('');
      }
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

  const handleDeleteClick = (commentId: string, replyId?: string) => {
    setDeleteTarget({ commentId, replyId });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      const success = await deleteItem(deleteTarget.commentId, deleteTarget.replyId);
      if (success) {
        setShowDeleteModal(false);
        setDeleteTarget(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
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
              onClick={() => openAdminModal()}
              className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              🔒 Admin Login
            </button>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Share your thoughts or feedback about this tool
        </p>

        <CommentForm
          commentName={commentName}
          setCommentName={setCommentName}
          commentText={commentText}
          setCommentText={setCommentText}
          nameError={nameError}
          isAdminMode={isAdminMode}
          onSubmit={handleAddComment}
          onNameChange={handleCommentNameChange}
        />

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
              {getSortedComments().map((comment) => {
                return (
                  <div key={comment.id} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
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
                              {(comment.is_admin || comment.name.toLowerCase() === 'admin') && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700">
                                  Admin
                                </span>
                              )}
                              {/* Pinned Badge */}
                              {comment.is_pinned && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full border border-yellow-200 dark:border-yellow-700 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                                  </svg>
                                  Pinned
                                </span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(comment.timestamp)} {formatTime(comment.timestamp)}
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
                                onClick={() => handleLike(comment.id)}
                                className={`flex items-center gap-1 text-xs font-medium transition-colors ${likedComments.has(comment.id)
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                                  }`}
                              >
                                <svg className="w-4 h-4" fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {comment.likes || 0}
                              </button>

                              {/* Reply Button */}
                              <button
                                onClick={() => {
                                  const newViewReplies = new Set<string>();
                                  if (!viewReplies.has(comment.id)) {
                                    newViewReplies.add(comment.id);
                                    setReplyingTo(comment.id);
                                  } else {
                                    setReplyingTo(null);
                                  }
                                  setViewReplies(newViewReplies);
                                }}
                                className={`flex items-center gap-1 text-xs font-medium transition-colors ${viewReplies.has(comment.id)
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                                  }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {comment.replies?.length || 0}
                              </button>

                              {/* Pin Button - Admin Only */}
                              {isAdminMode && (
                                <button
                                  onClick={() => togglePin(comment.id)}
                                  className={`flex items-center gap-1 text-xs font-medium transition-colors ${comment.is_pinned
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                                    }`}
                                >
                                  <svg className="w-4 h-4" fill={comment.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 16 16" strokeWidth="1.5">
                                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                                  </svg>
                                  {comment.is_pinned ? 'Unpin' : 'Pin'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Delete Button - Top Right */}
                          {isAdminMode && (
                            <button
                              onClick={() => handleDeleteClick(comment.id)}
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
                      {replyingTo === comment.id && (
                        <ReplyForm
                          replyName={replyName}
                          setReplyName={setReplyName}
                          replyText={replyText}
                          setReplyText={setReplyText}
                          replyNameError={replyNameError}
                          isAdminMode={isAdminMode}
                          onSubmit={() => handleAddReply(comment.id)}
                          onCancel={() => {
                            setReplyingTo(null);
                            setReplyName('');
                            setReplyText('');
                          }}
                          onNameChange={handleReplyNameChange}
                        />
                      )}

                      {/* Display Replies */}
                      {viewReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-4">
                          {comment.replies
                            .slice(0, showMoreReplies.has(comment.id) ? comment.replies.length : 5)
                            .map((reply) => (
                              <ReplyCard
                                key={reply.id}
                                reply={reply}
                                commentId={comment.id}
                                isAdminMode={isAdminMode}
                                onDelete={handleDeleteClick}
                              />
                            ))}

                          {/* Show More Button */}
                          {comment.replies.length > 5 && (
                            <button
                              onClick={() => {
                                const newShowMore = new Set(showMoreReplies);
                                if (showMoreReplies.has(comment.id)) {
                                  newShowMore.delete(comment.id);
                                } else {
                                  newShowMore.add(comment.id);
                                }
                                setShowMoreReplies(newShowMore);
                              }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                              {showMoreReplies.has(comment.id) ? (
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
              <div className="relative mb-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="Enter password"
                  className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm pr-10 ${passwordError ? 'border-red-500 dark:border-red-500' : ''}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-600 dark:text-red-400 -mt-2 mb-4 flex items-center gap-2">
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
                  onClick={closeAdminModal}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={showDeleteModal}
          deleteTarget={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    </div>
  );
}

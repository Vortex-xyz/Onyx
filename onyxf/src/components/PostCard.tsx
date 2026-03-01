// src/components/PostCard.tsx — FIXED: Removed post.tags (not in Post type from postService)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../services/postService';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  isLoading?: boolean;
  error?: string | null;
  likedPostIds?: Set<string>;
  savedPostIds?: Set<string>;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onSave,
  onComment,
  isLoading = false,
  error = null,
  likedPostIds = new Set(),
  savedPostIds = new Set(),
}) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const isLiked = likedPostIds.has(post.id);
  const isSaved = savedPostIds.has(post.id);
  const authorUsername = post.author?.username || 'Anonymous';
  const authorAvatar = post.author?.avatar_url || `https://i.pravatar.cc/150?u=${post.user_id}`;
  const authorInitial = authorUsername[0]?.toUpperCase() || '?';
  const mediaUrl = post.media_url;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      {isLoading ? (
        <div className="p-4 animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-purple-600 hover:text-purple-700 font-medium">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Post Header */}
          <div className="p-4 flex items-center">
            <Link to={`/profile/${post.user_id}`} className="flex items-center">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorUsername} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="text-lg font-medium text-purple-700 dark:text-purple-300">{authorInitial}</span>
                </div>
              )}
              <span className="ml-3 font-medium text-gray-900 dark:text-white">{authorUsername}</span>
            </Link>
          </div>

          {/* Post Media */}
          {mediaUrl && (
            <img src={mediaUrl} alt={`Post by ${authorUsername}`} className="w-full aspect-square object-cover" />
          )}

          {/* Actions */}
          <div className="p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike(post.id)}
                className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likes}</span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.comments_count}</span>
              </button>

              <button
                onClick={() => onSave(post.id)}
                className={`flex items-center gap-1 ${isSaved ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>

            {/* Post Content */}
            <div className="mt-4">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{post.content}</p>

              {/* ✅ tags block REMOVED — Post type from postService has no tags field.
                  If you add tags to your DB + Post interface later, re-add this block. */}

              {/* Comments */}
              {showComments && (
                <div className="mt-4 border-t dark:border-gray-700">
                  <form onSubmit={handleSubmitComment} className="mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostCard;
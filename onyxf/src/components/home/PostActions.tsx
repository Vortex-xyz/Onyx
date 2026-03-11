// src/components/home/PostActions.tsx
import React from 'react';
import { FaHeart, FaComment, FaPaperPlane, FaBookmark } from 'react-icons/fa';

interface PostActionsProps {
  darkMode: boolean;
  postId: string;
  likes: number;
  commentsCount: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  isOptimistic: boolean;
  showComments: boolean;
  onLike: () => void;
  onToggleComments: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  formatCount: (count: number) => string;
}

export const PostActions: React.FC<PostActionsProps> = ({
  darkMode,
  likes,
  commentsCount,
  shares,
  isLiked,
  isSaved,
  isOptimistic,
  showComments,
  onLike,
  onToggleComments,
  onShare,
  onToggleSave,
  formatCount
}) => {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={onLike}
            disabled={isOptimistic}
            className={`flex items-center space-x-2 transition-all ${
              isOptimistic ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              isLiked
                ? 'text-purple-600'
                : darkMode ? 'text-gray-600 hover:text-purple-500' : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <FaHeart className={`text-lg ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-semibold text-sm">{formatCount(likes)}</span>
          </button>

          <button
            onClick={onToggleComments}
            disabled={isOptimistic}
            className={`flex items-center space-x-2 transition-all ${
              isOptimistic ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              showComments
                ? 'text-purple-600'
                : darkMode ? 'text-gray-600 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FaComment className="text-lg" />
            <span className="font-semibold text-sm">{formatCount(commentsCount)}</span>
          </button>

          <button
            onClick={onShare}
            disabled={isOptimistic}
            className={`flex items-center space-x-2 transition-all ${
              isOptimistic ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              darkMode ? 'text-gray-600 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FaPaperPlane className="text-lg" />
            <span className="font-semibold text-sm">{formatCount(shares)}</span>
          </button>
        </div>

        <button
          onClick={onToggleSave}
          disabled={isOptimistic}
          className={`transition-all ${
            isOptimistic ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            isSaved
              ? 'text-purple-600'
              : darkMode ? 'text-gray-600 hover:text-purple-500' : 'text-gray-500 hover:text-purple-600'
          }`}
        >
          <FaBookmark className={`text-lg ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
};
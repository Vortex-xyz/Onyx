// src/components/home/PostHeader.tsx
import React from 'react';
import { FaStar, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { Author } from './types';

interface PostHeaderProps {
  darkMode: boolean;
  author: Author | undefined;
  createdAt: string;
  isOwnPost: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  onFollow: () => void;
  formatTime: (isoString: string) => string;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  darkMode,
  author,
  createdAt,
  isOwnPost,
  isFollowing,
  followLoading,
  onFollow,
  formatTime
}) => {
  return (
    <div className="flex items-center space-x-3 flex-1 min-w-0">
      <div className="relative">
        <img
          src={author?.avatar_url || 'https://i.pravatar.cc/150'}
          alt={author?.username || 'User'}
          className={`w-11 h-11 rounded-full border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
        />
        {author?.isPremium && (
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center border-2 ${darkMode ? 'border-gray-900' : 'border-white'}`}>
            <FaStar className="text-white text-[7px]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {author?.username || 'Anonymous'}
          </h3>
          <span className={darkMode ? 'text-gray-700' : 'text-gray-400'}>•</span>
          <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
            {formatTime(createdAt)}
          </span>
        </div>
        <div className="flex items-center space-x-2 mt-0.5">
          <span className={`text-[10px] ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
            Lvl {author?.level || 1}
          </span>
        </div>
      </div>

      {!isOwnPost && (
        <button
          onClick={onFollow}
          disabled={followLoading}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
            followLoading ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            isFollowing
              ? darkMode
                ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300'
              : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-sm'
          }`}
        >
          {followLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
          ) : isFollowing ? (
            <><FaUserCheck className="text-[10px]" /><span>Following</span></>
          ) : (
            <><FaUserPlus className="text-[10px]" /><span>Follow</span></>
          )}
        </button>
      )}
    </div>
  );
};
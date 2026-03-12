// src/components/home/PostMenu.tsx
import React from 'react';
import { FaEllipsisH, FaLink, FaTrash, FaFlag } from 'react-icons/fa';

interface PostMenuProps {
  darkMode: boolean;
  postId: string;
  isOwnPost: boolean;
  isOptimistic: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onShare: () => void;
  onDelete: () => void;
  onReport: () => void;
}

export const PostMenu: React.FC<PostMenuProps> = ({
  darkMode,
  isOwnPost,
  isOptimistic,
  isOpen,
  onToggle,
  onShare,
  onDelete,
  onReport
}) => {
  return (
    <div className="relative ml-2" data-post-menu>
      <button
        onClick={onToggle}
        className={`p-2 rounded-lg transition-all ${
          darkMode
            ? 'text-gray-600 hover:text-gray-400 hover:bg-gray-800'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}
      >
        <FaEllipsisH className="text-sm" />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl overflow-hidden z-10 ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={onShare}
            className={`w-full flex items-center space-x-3 px-4 py-3 transition-all ${
              darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FaLink className="text-sm" />
            <span className="font-medium text-sm">Copy Link</span>
          </button>

          {!isOwnPost && (
            <button
              onClick={onReport}
              className={`w-full flex items-center space-x-3 px-4 py-3 transition-all ${
                darkMode ? 'hover:bg-gray-800 text-yellow-500' : 'hover:bg-gray-100 text-yellow-600'
              }`}
            >
              <FaFlag className="text-sm" />
              <span className="font-medium text-sm">Report Post</span>
            </button>
          )}

          {isOwnPost && !isOptimistic && (
            <button
              onClick={onDelete}
              className="w-full flex items-center space-x-3 px-4 py-3 transition-all text-red-500 hover:bg-red-500/10"
            >
              <FaTrash className="text-sm" />
              <span className="font-medium text-sm">Delete Post</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
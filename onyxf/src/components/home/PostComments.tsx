// src/components/home/PostComments.tsx - WITH CLICKABLE USERNAMES
import React from 'react';
import { Link } from 'react-router-dom';
import { Comment, UserData } from './types';

interface PostCommentsProps {
  darkMode: boolean;
  postId: string;
  comments: Comment[];
  commentText: string;
  loading: boolean;
  userData: UserData;
  onCommentChange: (text: string) => void;
  onSubmitComment: () => void;
  formatTime: (isoString: string) => string;
}

export const PostComments: React.FC<PostCommentsProps> = ({
  darkMode,
  comments,
  commentText,
  loading,
  userData,
  onCommentChange,
  onSubmitComment,
  formatTime
}) => {
  return (
    <div className={`border-t px-5 py-4 ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'}`}>
      <div className="flex items-start space-x-3 mb-4">
        <img src={userData.photoURL} alt={userData.username} className="w-8 h-8 rounded-full" />
        <div className="flex-1">
          <textarea
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Add a comment..."
            className={`w-full p-3 border rounded-lg resize-none text-sm focus:outline-none ${
              darkMode
                ? 'bg-black border-gray-800 text-white placeholder-gray-600 focus:border-purple-600/50'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-400'
            }`}
            rows={2}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={onSubmitComment}
              disabled={!commentText.trim()}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <Link to={comment.author?.username ? `/profile/${comment.author.username}` : '#'}>
                <img
                  src={comment.author?.avatar_url || 'https://i.pravatar.cc/150'}
                  alt={comment.author?.username || 'User'}
                  className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
              <div className="flex-1">
                <div className={`rounded-lg p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Link 
                      to={comment.author?.username ? `/profile/${comment.author.username}` : '#'}
                      className={`text-sm font-semibold hover:underline transition-all ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      {comment.author?.username || 'Anonymous'}
                    </Link>
                    <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                      {formatTime(comment.created_at)}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className={`text-center text-sm py-4 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
};
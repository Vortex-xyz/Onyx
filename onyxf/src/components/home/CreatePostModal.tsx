// src/components/home/CreatePostModal.tsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { ImageUpload } from '../ImageUpload';

interface CreatePostModalProps {
  darkMode: boolean;
  isOpen: boolean;
  postContent: string;
  postMediaUrl: string;
  isSubmitting: boolean;
  onContentChange: (content: string) => void;
  onMediaUpload: (url: string, type: 'image' | 'video') => void;
  onMediaRemove: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  darkMode,
  isOpen,
  postContent,
  postMediaUrl,
  isSubmitting,
  onContentChange,
  onMediaUpload,
  onMediaRemove,
  onSubmit,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-2xl max-w-lg w-full p-6 border transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Post</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all ${
              darkMode ? 'text-gray-600 hover:text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <textarea
          value={postContent}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Share something with the community..."
          className={`w-full h-32 p-4 border rounded-xl focus:outline-none resize-none text-sm transition-all ${
            darkMode
              ? 'bg-black border-gray-800 text-white placeholder-gray-600 focus:border-purple-600/50'
              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-400'
          }`}
        />

        <div className="mt-4">
          <ImageUpload
            onUploadComplete={onMediaUpload}
            onRemove={onMediaRemove}
            currentPreview={postMediaUrl}
            darkMode={darkMode}
          />
        </div>

        <div className="flex items-center justify-end mt-5">
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !postContent.trim()}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Posting...
              </span>
            ) : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};
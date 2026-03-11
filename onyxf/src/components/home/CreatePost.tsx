// src/components/home/CreatePost.tsx
import React, { useState } from 'react';
import { ImageUpload } from '../ImageUpload';
import { FaImage, FaSpinner, FaPaperPlane } from 'react-icons/fa';

interface CreatePostProps {
  darkMode: boolean;
  userAvatar: string | undefined;
  username: string | undefined;
  onSubmit: (content: string, mediaUrl: string, mediaType: 'image' | 'video') => Promise<void>;
}

export const CreatePost: React.FC<CreatePostProps> = ({
  darkMode,
  userAvatar,
  username,
  onSubmit
}) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(content, mediaUrl, mediaType);
      setContent('');
      setMediaUrl('');
      setShowImageUpload(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl p-6 mb-6 ${darkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start space-x-3">
          <img
            src={userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={username}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className={`w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 ${
                darkMode
                  ? 'bg-gray-800 text-white placeholder-gray-500 focus:ring-orange-500'
                  : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-cyan-500'
              }`}
              rows={3}
            />
          </div>
        </div>

        {showImageUpload && (
          <ImageUpload
            onUploadComplete={(url, type) => {
              setMediaUrl(url);
              setMediaType(type);
              setShowImageUpload(false);
            }}
            onRemove={() => {
              setMediaUrl('');
              setShowImageUpload(false);
            }}
            currentPreview={mediaUrl}
            darkMode={darkMode}
          />
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowImageUpload(!showImageUpload)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? 'hover:bg-gray-800 text-gray-400 hover:text-purple-500'
                : 'hover:bg-gray-100 text-gray-600 hover:text-purple-500'
            }`}
          >
            <FaImage className="text-xl" />
          </button>

          <button
            type="submit"
            disabled={loading || (!content.trim() && !mediaUrl)}
            className={`px-6 py-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-orange-600 hover:to-orange-700 text-white'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-cyan-600 hover:to-cyan-700 text-white'
            }`}
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <span className="flex items-center space-x-2">
                <span>Post</span>
                <FaPaperPlane className="text-sm" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
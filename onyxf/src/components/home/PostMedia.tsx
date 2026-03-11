// src/components/home/PostMedia.tsx
import React from 'react';

interface PostMediaProps {
  darkMode: boolean;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
}

export const PostMedia: React.FC<PostMediaProps> = ({ darkMode, mediaUrl, mediaType }) => {
  if (!mediaUrl) return null;

  return (
    <div className={`relative group ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
      {mediaType === 'video' ? (
        <div className="relative">
          <video 
            src={mediaUrl}
            controls
            preload="metadata"
            className="w-full h-auto bg-black"
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <img src={mediaUrl} alt="Post media" className="w-full h-auto" />
      )}
    </div>
  );
};
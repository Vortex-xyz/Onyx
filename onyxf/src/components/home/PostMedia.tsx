// src/components/home/PostMedia.tsx
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface PostMediaProps {
  darkMode: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export const PostMedia: React.FC<PostMediaProps> = ({ darkMode, mediaUrl, mediaType }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!mediaUrl) return null;

  const handleImageClick = () => {
    setIsZoomed(true);
  };

  const handleCloseZoom = () => {
    setIsZoomed(false);
  };

  return (
    <>
      {/* Standard Size Media */}
      <div className="relative w-full overflow-hidden bg-black/5">
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            controls
            className="w-full max-h-[400px] object-contain bg-black"
            style={{ maxHeight: '400px' }}
          />
        ) : (
          <div 
            className="relative cursor-zoom-in group"
            onClick={handleImageClick}
          >
            <img
              src={mediaUrl}
              alt="Post media"
              className="w-full max-h-[400px] object-contain bg-black transition-transform group-hover:scale-[1.02]"
              style={{ maxHeight: '400px' }}
              loading="lazy"
            />
            
            {/* Zoom hint overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                🔍 Click to zoom
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zoomed Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleCloseZoom}
        >
          {/* Close button */}
          <button
            onClick={handleCloseZoom}
            className="absolute top-4 right-4 z-[10000] bg-gray-900/90 hover:bg-gray-800 text-white p-3 rounded-full transition-all shadow-2xl"
            aria-label="Close zoom"
          >
            <FaTimes className="text-xl" />
          </button>

          {/* Zoomed image */}
          <div 
            className="relative max-w-7xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={mediaUrl}
              alt="Post media zoomed"
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Tap to close hint */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
            Tap anywhere to close
          </div>
        </div>
      )}
    </>
  );
};
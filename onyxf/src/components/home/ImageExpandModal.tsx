// src/components/home/ImageExpandModal.tsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { Post } from '../../services/postService';

interface ImageExpandModalProps {
  darkMode: boolean;
  expandedPostId: string | null;
  posts: Post[];
  onClose: () => void;
}

export const ImageExpandModal: React.FC<ImageExpandModalProps> = ({
  darkMode,
  expandedPostId,
  posts,
  onClose
}) => {
  if (!expandedPostId) return null;

  const post = posts.find(p => p.id === expandedPostId);
  if (!post) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 p-3 rounded-full transition-all z-10 ${
          darkMode 
            ? 'bg-purple-500/20 hover:bg-orange-500/30' 
            : 'bg-purple-500/20 hover:bg-cyan-500/30'
        } text-white`}
      >
        <FaTimes className="text-xl" />
      </button>
      <img
        src={post.media_url}
        alt="Expanded"
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
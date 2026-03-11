// src/components/home/PostContent.tsx
import React from 'react';

interface PostContentProps {
  darkMode: boolean;
  content: string;
}

export const PostContent: React.FC<PostContentProps> = ({ darkMode, content }) => {
  return (
    <div className="px-5 pb-4">
      <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {content}
      </p>
    </div>
  );
};
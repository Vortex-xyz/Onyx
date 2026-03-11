// src/components/home/SpotlightCarousel.tsx
import React from 'react';
import { FaFire, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SpotlightPost } from './types';

interface SpotlightCarouselProps {
  darkMode: boolean;
  posts: SpotlightPost[];
  currentIndex: number;
  spotlightRef: React.RefObject<HTMLDivElement>;
  onIndexChange: (index: number) => void;
}

export const SpotlightCarousel: React.FC<SpotlightCarouselProps> = ({
  darkMode,
  posts,
  currentIndex,
  spotlightRef,
  onIndexChange
}) => {
  return (
    <div className="mb-8 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaFire className="text-purple-600 text-xl" />
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Spotlight</h2>
        </div>
        <div className="flex items-center space-x-2">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === index
                  ? 'w-6 bg-purple-600'
                  : darkMode ? 'w-1.5 bg-gray-700' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative group">
        <div ref={spotlightRef} className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth">
          {posts.map((spotlight) => (
            <div key={spotlight.id} className="w-full flex-shrink-0 snap-center">
              <div className={`relative rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                darkMode ? 'border-gray-800 hover:border-purple-600/50' : 'border-gray-200 hover:border-purple-400'
              }`}>
                <img src={spotlight.image} alt={spotlight.title} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">{spotlight.badge}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-2">{spotlight.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={`https://i.pravatar.cc/40?u=${spotlight.author}`} alt={spotlight.author} className="w-6 h-6 rounded-full border-2 border-white/50" />
                      <span className="text-white/90 text-sm font-medium">{spotlight.author}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-white/80 text-sm">
                      <FaFire className="text-xs" />
                      <span>{spotlight.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onIndexChange((currentIndex - 1 + posts.length) % posts.length)}
          className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all ${
            darkMode ? 'bg-black/50 hover:bg-black/70 text-white' : 'bg-white/50 hover:bg-white/70 text-gray-900'
          }`}
        >
          <FaChevronLeft />
        </button>
        <button
          onClick={() => onIndexChange((currentIndex + 1) % posts.length)}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all ${
            darkMode ? 'bg-black/50 hover:bg-black/70 text-white' : 'bg-white/50 hover:bg-white/70 text-gray-900'
          }`}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};
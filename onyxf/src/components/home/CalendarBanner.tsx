// src/components/home/CalendarBanner.tsx
import React from 'react';

interface CalendarBannerProps {
  darkMode: boolean;
  currentIndex: number;
  messages: string[];
}

export const CalendarBanner: React.FC<CalendarBannerProps> = ({
  darkMode,
  currentIndex,
  messages
}) => {
  return (
    <div className="relative h-16 overflow-hidden mb-6">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
            index === currentIndex
              ? 'opacity-100 translate-y-0'
              : index < currentIndex
                ? 'opacity-0 -translate-y-full'
                : 'opacity-0 translate-y-full'
          }`}
          style={{
            transformOrigin: 'top',
            transform: index === currentIndex 
              ? 'rotateX(0deg)' 
              : index < currentIndex 
                ? 'rotateX(-90deg)' 
                : 'rotateX(90deg)'
          }}
        >
          <div className={`px-6 py-3 rounded-xl ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20' 
              : 'bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20'
          }`}>
            <p className={`text-sm font-medium ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
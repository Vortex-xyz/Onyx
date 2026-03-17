// src/components/home/TopNav.tsx
import React from 'react';
import { FaBolt, FaSearch, FaSun, FaMoon } from 'react-icons/fa';
import NotificationBell from '../NotificationBell'; // ← ADD THIS IMPORT
import { UserData } from './types';

interface TopNavProps {
  darkMode: boolean;
  showExplore: boolean;
  userData: UserData;
  onToggleDarkMode: () => void;
  onToggleExplore: () => void;
  onProfileClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  darkMode,
  showExplore,
  userData,
  onToggleDarkMode,
  onToggleExplore,
  onProfileClick
}) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 backdrop-blur-md border-b z-50 transition-colors ${
      darkMode ? 'bg-black/95 border-gray-800' : 'bg-white/95 border-gray-200'
    }`}>
      <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <FaBolt className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">ONYX</h1>
            <p className="text-[9px] tracking-wider -mt-0.5 text-white">ANIME NETWORK</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleExplore}
            className={`p-2 rounded-lg transition-all ${
              showExplore
                ? 'bg-purple-600 text-white'
                : darkMode
                  ? 'text-gray-400 hover:text-purple-500 hover:bg-gray-900'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
            }`}
          >
            <FaSearch className="text-lg" />
          </button>

          {/* REPLACED OLD BELL BUTTON WITH NotificationBell COMPONENT */}
          <NotificationBell />

          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-lg transition-all ${
              darkMode ? 'text-gray-400 hover:text-purple-500 hover:bg-gray-900' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
            }`}
          >
            {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
          </button>

          <button
            onClick={onProfileClick}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-900/50 transition-all"
          >
            <img
              src={userData.photoURL}
              alt={userData.username}
              className="w-8 h-8 rounded-full border-2 border-purple-600/50"
            />
          </button>
        </div>
      </div>
    </nav>
  );
};
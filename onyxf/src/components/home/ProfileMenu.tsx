// src/components/home/ProfileMenu.tsx
import React from 'react';
import { FaUser, FaBookmark, FaSignOutAlt, FaStar } from 'react-icons/fa';
import { UserData } from './types';

interface ProfileMenuProps {
  darkMode: boolean;
  userData: UserData;
  isOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement>;
  onViewProfile: () => void;
  onLogout: () => void;
  formatCount: (count: number) => string;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  darkMode,
  userData,
  isOpen,
  menuRef,
  onViewProfile,
  onLogout,
  formatCount
}) => {
  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl overflow-hidden z-50 ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="relative p-6 bg-gradient-to-br from-purple-600 to-violet-600">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={userData.photoURL}
              alt={userData.username}
              className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
            />
            {userData.isPremium && (
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1.5 border-2 border-white">
                <FaStar className="text-yellow-900 text-xs" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">{userData.username}</h3>
            <p className="text-white/80 text-sm">{userData.email}</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                Level {userData.level}
              </span>
              {userData.isPremium && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                  PRO
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-4 p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="text-center">
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.posts}</div>
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Posts</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCount(userData.followers)}</div>
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Followers</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCount(userData.following)}</div>
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Following</div>
        </div>
      </div>

      <div className="p-2">
        <button
          onClick={onViewProfile}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <FaUser className="text-lg" />
          <span className="font-medium">View Profile</span>
        </button>
        <button className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
          darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
        }`}>
          <FaBookmark className="text-lg" />
          <span className="font-medium">Saved Posts</span>
        </button>
      </div>

      <div className={`p-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-red-500 hover:bg-red-500/10 font-medium"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
// src/components/home/Sidebar.tsx
import React from 'react';
import { FaStar, FaSignOutAlt } from 'react-icons/fa';
import { UserData, NavItem } from './types';

interface SidebarProps {
  darkMode: boolean;
  userData: UserData;
  navItems: NavItem[];
  activeTab: string;
  currentXP: number;
  nextLevelXP: number;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  darkMode,
  userData,
  navItems,
  activeTab,
  currentXP,
  nextLevelXP,
  onTabChange,
  onLogout
}) => {
  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 backdrop-blur-md border-r p-5 overflow-y-auto hidden lg:flex lg:flex-col transition-colors ${
      darkMode ? 'bg-black/95 border-gray-800' : 'bg-white/95 border-gray-200'
    }`}>
      <div className={`mb-6 p-4 rounded-xl border transition-colors ${
        darkMode ? 'bg-gradient-to-br from-gray-900 to-black border-purple-900/30' : 'bg-gradient-to-br from-purple-50 to-white border-purple-200/50'
      }`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <img src={userData.photoURL} alt="User" className="w-11 h-11 rounded-full border-2 border-purple-600/50" />
            {userData.isPremium && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center border-2 border-black">
                <FaStar className="text-white text-[8px]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userData.username}</h3>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Level {userData.level}</span>
          </div>
        </div>
        <div className={`w-full rounded-full h-1.5 overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
        </div>
        <p className={`text-[10px] mt-1.5 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
          {Math.floor(currentXP)} / {nextLevelXP} XP to Level {userData.level + 1}
        </p>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? darkMode
                    ? 'bg-purple-600/10 text-purple-500 border-l-2 border-purple-600'
                    : 'bg-purple-100 text-purple-700 border-l-2 border-purple-600'
                  : darkMode
                    ? 'text-gray-500 hover:text-white hover:bg-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="text-lg" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={onLogout}
        className={`w-full mt-4 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all border ${
          darkMode
            ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/5 border-gray-800 hover:border-red-500/20'
            : 'text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-200'
        }`}
      >
        <FaSignOutAlt />
        <span className="text-sm">Logout</span>
      </button>
    </aside>
  );
};
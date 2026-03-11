// src/components/home/MobileBottomNav.tsx
import React from 'react';
import { NavItem } from './types';

interface MobileBottomNavProps {
  darkMode: boolean;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  darkMode,
  navItems,
  activeTab,
  onTabChange
}) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-md border-t lg:hidden z-50 transition-colors ${
      darkMode ? 'bg-black/95 border-gray-800' : 'bg-white/95 border-gray-200'
    }`}>
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive ? 'text-purple-600' : darkMode ? 'text-gray-600' : 'text-gray-500'
              }`}
            >
              <Icon className="text-xl" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-purple-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
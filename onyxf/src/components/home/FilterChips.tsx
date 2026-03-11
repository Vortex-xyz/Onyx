// src/components/home/FilterChips.tsx
import React from 'react';
import { FilterChip } from './types';

interface FilterChipsProps {
  darkMode: boolean;
  chips: FilterChip[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  darkMode,
  chips,
  activeFilter,
  onFilterChange
}) => {
  return (
    <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      {chips.map((chip) => {
        const Icon = chip.icon;
        return (
          <button
            key={chip.id}
            onClick={() => onFilterChange(chip.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              activeFilter === chip.id
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                : darkMode
                  ? 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
          >
            <Icon className="text-xs" />
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
};
/**
 * FilterTags Component
 * Provides tag selection checkboxes for filtering todos
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';

interface FilterTagsProps {
  availableTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export const FilterTags: React.FC<FilterTagsProps> = ({
  availableTags,
  selectedTags,
  onTagToggle,
}) => {
  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 flex items-center space-x-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span>Tags</span>
      </label>
      <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
        {availableTags.map(tag => (
          <label key={tag} className="
            flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 
            cursor-pointer transition-colors duration-200 min-h-[44px] active:bg-slate-100
          ">
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => onTagToggle(tag)}
              className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
            />
            <span className={`text-sm ${
              selectedTags.includes(tag) 
                ? 'font-medium text-slate-700' 
                : 'text-slate-600'
            }`}>
              {tag}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

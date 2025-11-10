/**
 * FilterSearch Component
 * Provides search input for filtering todos by title, memo, and tags
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';

interface FilterSearchProps {
  searchText: string;
  onSearchChange: (value: string) => void;
}

export const FilterSearch: React.FC<FilterSearchProps> = ({
  searchText,
  onSearchChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="search-input" className="block text-sm font-medium text-slate-700 flex items-center space-x-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search</span>
      </label>
      <input
        id="search-input"
        type="text"
        value={searchText}
        onChange={handleChange}
        placeholder="Search by title, memo, tags..."
        className="
          w-full px-3 sm:px-4 py-3 rounded-lg border border-slate-200 text-sm sm:text-base
          focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400
          transition-all duration-200 min-h-[48px]
        "
      />
    </div>
  );
};

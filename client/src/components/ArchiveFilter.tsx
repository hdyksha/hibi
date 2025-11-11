/**
 * ArchiveFilter Component
 * Provides filtering controls for archive view with collapsible advanced options
 * Requirements: 9.1, 9.2, 9.3
 */

import React, { useState, useCallback } from 'react';
import { TodoFilter, Priority, isPriority } from '../types';

interface ArchiveFilterProps {
  filter: TodoFilter;
  availableTags: string[];
  onFilterChange: (filter: TodoFilter) => void;
  className?: string;
  'data-testid'?: string;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const ArchiveFilter: React.FC<ArchiveFilterProps> = ({
  filter,
  availableTags,
  onFilterChange,
  className,
  'data-testid': testId,
}) => {
  const [searchText, setSearchText] = useState(filter.searchText || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePriorityChange = useCallback((priority: string) => {
    const newFilter = { ...filter };
    if (priority === '') {
      delete newFilter.priority;
    } else if (isPriority(priority)) {
      newFilter.priority = priority;
    }
    onFilterChange(newFilter);
  }, [filter, onFilterChange]);

  const handleTagToggle = useCallback((tag: string) => {
    const newFilter = { ...filter };
    const currentTags = newFilter.tags || [];
    
    if (currentTags.includes(tag)) {
      // Remove tag
      newFilter.tags = currentTags.filter(t => t !== tag);
      if (newFilter.tags.length === 0) {
        delete newFilter.tags;
      }
    } else {
      // Add tag
      newFilter.tags = [...currentTags, tag];
    }
    
    onFilterChange(newFilter);
  }, [filter, onFilterChange]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchText(searchValue);
    
    const newFilter = { ...filter };
    if (searchValue.trim() === '') {
      delete newFilter.searchText;
    } else {
      newFilter.searchText = searchValue;
    }
    onFilterChange(newFilter);
  }, [filter, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setSearchText('');
    onFilterChange({});
  }, [onFilterChange]);

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const hasActiveFilters = Object.keys(filter).length > 0;
  const hasAdvancedFilters = filter.priority || (filter.tags && filter.tags.length > 0);

  return (
    <div className={`flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden mb-6 ${className || ''}`} data-testid={testId}>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2 items-stretch">
          <div className="flex-1">
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="w-full px-3 py-3 border border-slate-300 rounded text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={toggleAdvanced}
            className={`px-4 py-3 border rounded text-sm transition-all duration-200 min-w-12 flex items-center justify-center ${
              hasAdvancedFilters 
                ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700' 
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200 hover:border-slate-400 hover:text-slate-700'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/25`}
            aria-expanded={showAdvanced}
            aria-label={showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}
          >
            {showAdvanced ? '▲' : '▼'}
          </button>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 bg-transparent text-slate-600 border border-slate-300 rounded text-sm cursor-pointer transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {showAdvanced && (
        <div className="border-t border-slate-200 bg-slate-50 p-4 flex flex-col gap-4 animate-fade-in">
          <div className="mb-2">
            <h3 className="text-base font-semibold text-slate-700 m-0">Advanced Filters</h3>
          </div>

          {/* Priority Filter */}
          <div className="flex flex-col gap-2">
            <label htmlFor="archive-priority-select" className="font-semibold text-slate-700 text-sm">
              Priority
            </label>
            <select
              id="archive-priority-select"
              value={filter.priority || ''}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="px-3 py-3 border border-slate-300 rounded text-base bg-white cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-slate-700 text-sm">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <label key={tag} className={`flex items-center gap-1 px-3 py-2 bg-white border rounded-2xl cursor-pointer text-sm transition-all duration-200 select-none ${
                    (filter.tags || []).includes(tag)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={(filter.tags || []).includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="m-0 cursor-pointer"
                    />
                    <span className="font-medium">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-2 p-3 bg-white border border-slate-200 rounded">
              <div className="text-sm font-semibold text-slate-700 mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {filter.priority && (
                  <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded-xl text-xs font-medium">
                    Priority: {PRIORITY_OPTIONS.find(opt => opt.value === filter.priority)?.label}
                  </span>
                )}
                {filter.tags && filter.tags.length > 0 && (
                  <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded-xl text-xs font-medium">
                    Tags: {filter.tags.join(', ')}
                  </span>
                )}
                {filter.searchText && (
                  <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded-xl text-xs font-medium">
                    Search: "{filter.searchText}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
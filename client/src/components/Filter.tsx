/**
 * Filter Component
 * Provides filtering controls for todo items
 * Requirements: 7.2, 8.4
 */

import React, { useState, useCallback } from 'react';
import { TodoFilter, FilterStatus, Priority } from '../types';

interface FilterProps {
  filter: TodoFilter;
  availableTags: string[];
  onFilterChange: (filter: TodoFilter) => void;
  className?: string;
  hideStatusFilter?: boolean;
}

const FILTER_STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const Filter: React.FC<FilterProps> = ({
  filter,
  availableTags,
  onFilterChange,
  className,
  hideStatusFilter = false,
}) => {
  const [searchText, setSearchText] = useState(filter.searchText || '');

  const handleStatusChange = useCallback((status: FilterStatus) => {
    const newFilter = { ...filter };
    newFilter.status = status;
    onFilterChange(newFilter);
  }, [filter, onFilterChange]);

  const handlePriorityChange = useCallback((priority: Priority | '') => {
    const newFilter = { ...filter };
    if (priority === '') {
      delete newFilter.priority;
    } else {
      newFilter.priority = priority as Priority;
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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    const newFilter = { ...filter };
    if (value.trim() === '') {
      delete newFilter.searchText;
    } else {
      newFilter.searchText = value;
    }
    onFilterChange(newFilter);
  }, [filter, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setSearchText('');
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = Object.keys(filter).length > 0;

  return (
    <div className={`bg-white/95 backdrop-blur-xl rounded-lg shadow-md border border-slate-200/50 p-6 space-y-6 animate-slide-in-right ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-slate-800 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="
              px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium
              hover:bg-slate-200 transition-colors duration-200
            "
          >
            Clear
          </button>
        )}
      </div>

      {/* Search Box */}
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
          onChange={handleSearchChange}
          placeholder="Search by title, memo, tags..."
          className="
            w-full px-4 py-3 rounded-lg border border-slate-200 
            focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400
            transition-all duration-200
          "
        />
      </div>

      {/* Status Filter */}
      {!hideStatusFilter && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Status</span>
          </label>
          <div className="space-y-2">
            {FILTER_STATUS_OPTIONS.map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={(filter.status || 'pending') === option.value}
                  onChange={() => handleStatusChange(option.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Priority Filter */}
      <div className="space-y-2">
        <label htmlFor="priority-select" className="block text-sm font-medium text-slate-700 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span>Priority</span>
        </label>
        <select
          id="priority-select"
          value={filter.priority || ''}
          onChange={(e) => handlePriorityChange(e.target.value as Priority | '')}
          className="
            w-full px-4 py-3 rounded-lg border border-slate-200 bg-white
            focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400
            transition-all duration-200
          "
        >
          <option value="">All Priorities</option>
          <option value="high">● 高</option>
          <option value="medium">● 中</option>
          <option value="low">● 低</option>
        </select>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Tags</span>
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableTags.map(tag => (
              <label key={tag} className="
                flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 
                cursor-pointer transition-colors duration-200
              ">
                <input
                  type="checkbox"
                  checked={(filter.tags || []).includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                  className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                />
                <span className={`text-sm ${
                  (filter.tags || []).includes(tag) 
                    ? 'font-medium text-slate-700' 
                    : 'text-slate-600'
                }`}>
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <div className="text-sm font-medium text-slate-700 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {!hideStatusFilter && filter.status && filter.status !== 'all' && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                Status: {FILTER_STATUS_OPTIONS.find(opt => opt.value === filter.status)?.label}
              </span>
            )}
            {filter.priority && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                Priority: {PRIORITY_OPTIONS.find(opt => opt.value === filter.priority)?.label}
              </span>
            )}
            {filter.tags && filter.tags.length > 0 && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                Tags: {filter.tags.join(', ')}
              </span>
            )}
            {filter.searchText && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                Search: "{filter.searchText}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


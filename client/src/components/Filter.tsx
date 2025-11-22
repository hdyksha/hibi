/**
 * Filter Component
 * Provides filtering controls for todo items
 * Requirements: 2.1, 2.2, 5.1
 */

import React, { useState, useCallback } from 'react';
import { TodoFilter, FilterStatus, Priority, isPriority } from '../types';
import { Button } from './common/Button';
import { FilterSearch } from './Filter/FilterSearch';
import { FilterStatus as FilterStatusComponent } from './Filter/FilterStatus';
import { FilterPriority } from './Filter/FilterPriority';
import { FilterTags } from './Filter/FilterTags';
import { useTodoContext } from '../contexts';
import { DEFAULT_TODO_FILTER } from '../constants/filters';

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
  const { clearFilter } = useTodoContext();
  const [searchText, setSearchText] = useState(filter.searchText || '');

  const handleStatusChange = useCallback((status: FilterStatus) => {
    const newFilter = { ...filter };
    newFilter.status = status;
    onFilterChange(newFilter);
  }, [filter, onFilterChange]);

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

  const handleSearchChange = useCallback((value: string) => {
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
    clearFilter();
  }, [clearFilter]);

  const hasActiveFilters = Object.keys(filter).length > 0;

  return (
    <div 
      className={`backdrop-blur-xl rounded-lg shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6 animate-slide-in-right bg-card border border-border ${className || ''}`}
    >
      {/* Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 
          className="text-lg sm:text-xl font-medium flex items-center space-x-2 text-text"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            className="self-start sm:self-auto"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Search Box */}
      <FilterSearch
        searchText={searchText}
        onSearchChange={handleSearchChange}
      />

      {/* Status Filter */}
      {!hideStatusFilter && (
        <FilterStatusComponent
          status={filter.status || DEFAULT_TODO_FILTER.status!}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Priority Filter */}
      <FilterPriority
        priority={filter.priority}
        onPriorityChange={handlePriorityChange}
      />

      {/* Tags Filter */}
      <FilterTags
        availableTags={availableTags}
        selectedTags={filter.tags || []}
        onTagToggle={handleTagToggle}
      />

      {/* Active Filters Summary - Mobile responsive */}
      {hasActiveFilters && (
        <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3 border-t border-border">
          <div className="text-sm font-medium flex items-center space-x-1 text-text">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {!hideStatusFilter && filter.status && filter.status !== 'all' && (
              <span className="px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-background-secondary text-text">
                Status: {FILTER_STATUS_OPTIONS.find(opt => opt.value === filter.status)?.label}
              </span>
            )}
            {filter.priority && (
              <span className="px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-background-secondary text-text">
                Priority: {PRIORITY_OPTIONS.find(opt => opt.value === filter.priority)?.label}
              </span>
            )}
            {filter.tags && filter.tags.length > 0 && (
              <span className="px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-background-secondary text-text">
                Tags: {filter.tags.join(', ')}
              </span>
            )}
            {filter.searchText && (
              <span className="px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-background-secondary text-text">
                Search: "{filter.searchText}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


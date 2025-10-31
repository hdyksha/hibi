/**
 * Filter Component
 * Provides filtering controls for todo items
 * Requirements: 7.2, 8.4
 */

import React, { useState, useCallback } from 'react';
import { TodoFilter, FilterStatus, Priority } from '../types';
import './Filter.css';

interface FilterProps {
  filter: TodoFilter;
  availableTags: string[];
  onFilterChange: (filter: TodoFilter) => void;
  className?: string;
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
}) => {
  const [searchText, setSearchText] = useState(filter.searchText || '');

  const handleStatusChange = useCallback((status: FilterStatus) => {
    const newFilter = { ...filter };
    if (status === 'all') {
      delete newFilter.status;
    } else {
      newFilter.status = status;
    }
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
    <div className={`filter ${className || ''}`}>
      <div className="filter__header">
        <h3 className="filter__title">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="filter__clear-button"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Box */}
      <div className="filter__section">
        <label htmlFor="search-input" className="filter__label">
          Search
        </label>
        <input
          id="search-input"
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Search in title, memo, and tags..."
          className="filter__search-input"
        />
      </div>

      {/* Status Filter */}
      <div className="filter__section">
        <label className="filter__label">Status</label>
        <div className="filter__radio-group">
          {FILTER_STATUS_OPTIONS.map(option => (
            <label key={option.value} className="filter__radio-label">
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={(filter.status || 'all') === option.value}
                onChange={() => handleStatusChange(option.value)}
                className="filter__radio-input"
              />
              <span className="filter__radio-text">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="filter__section">
        <label htmlFor="priority-select" className="filter__label">
          Priority
        </label>
        <select
          id="priority-select"
          value={filter.priority || ''}
          onChange={(e) => handlePriorityChange(e.target.value as Priority | '')}
          className="filter__select"
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
        <div className="filter__section">
          <label className="filter__label">Tags</label>
          <div className="filter__tags">
            {availableTags.map(tag => (
              <label key={tag} className="filter__tag-label">
                <input
                  type="checkbox"
                  checked={(filter.tags || []).includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                  className="filter__tag-checkbox"
                />
                <span className="filter__tag-text">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="filter__summary">
          <div className="filter__summary-title">Active Filters:</div>
          <div className="filter__summary-items">
            {filter.status && filter.status !== 'all' && (
              <span className="filter__summary-item">
                Status: {FILTER_STATUS_OPTIONS.find(opt => opt.value === filter.status)?.label}
              </span>
            )}
            {filter.priority && (
              <span className="filter__summary-item">
                Priority: {PRIORITY_OPTIONS.find(opt => opt.value === filter.priority)?.label}
              </span>
            )}
            {filter.tags && filter.tags.length > 0 && (
              <span className="filter__summary-item">
                Tags: {filter.tags.join(', ')}
              </span>
            )}
            {filter.searchText && (
              <span className="filter__summary-item">
                Search: "{filter.searchText}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


/**
 * ArchiveFilter Component
 * Provides filtering controls for archive view with collapsible advanced options
 * Requirements: 9.1, 9.2, 9.3
 */

import React, { useState, useCallback } from 'react';
import { TodoFilter, Priority } from '../types';
import './ArchiveFilter.css';

interface ArchiveFilterProps {
  filter: TodoFilter;
  availableTags: string[];
  onFilterChange: (filter: TodoFilter) => void;
  className?: string;
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
}) => {
  const [searchText, setSearchText] = useState(filter.searchText || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const hasActiveFilters = Object.keys(filter).length > 0;
  const hasAdvancedFilters = filter.priority || (filter.tags && filter.tags.length > 0);

  return (
    <div className={`archive-filter ${className || ''}`}>
      <div className="archive-filter__main">
        <div className="archive-filter__search-row">
          <div className="archive-filter__search-field">
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="タスクを検索..."
              className="archive-filter__search-input"
            />
          </div>
          <button
            type="button"
            onClick={toggleAdvanced}
            className={`archive-filter__toggle ${hasAdvancedFilters ? 'archive-filter__toggle--active' : ''}`}
            aria-expanded={showAdvanced}
            aria-label={showAdvanced ? '詳細フィルターを隠す' : '詳細フィルターを表示'}
          >
            {showAdvanced ? '▲' : '▼'}
          </button>
        </div>

        {hasActiveFilters && (
          <div className="archive-filter__actions">
            <button
              type="button"
              onClick={handleClearFilters}
              className="archive-filter__clear-button"
            >
              フィルターをクリア
            </button>
          </div>
        )}
      </div>

      {showAdvanced && (
        <div className="archive-filter__advanced">
          <div className="archive-filter__advanced-header">
            <h3 className="archive-filter__advanced-title">詳細フィルター</h3>
          </div>

          {/* Priority Filter */}
          <div className="archive-filter__field">
            <label htmlFor="archive-priority-select" className="archive-filter__label">
              優先度
            </label>
            <select
              id="archive-priority-select"
              value={filter.priority || ''}
              onChange={(e) => handlePriorityChange(e.target.value as Priority | '')}
              className="archive-filter__select"
            >
              <option value="">すべての優先度</option>
              {PRIORITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="archive-filter__field">
              <label className="archive-filter__label">タグ</label>
              <div className="archive-filter__tags">
                {availableTags.map(tag => (
                  <label key={tag} className="archive-filter__tag-label">
                    <input
                      type="checkbox"
                      checked={(filter.tags || []).includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="archive-filter__tag-checkbox"
                    />
                    <span className="archive-filter__tag-text">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="archive-filter__summary">
              <div className="archive-filter__summary-title">適用中のフィルター:</div>
              <div className="archive-filter__summary-items">
                {filter.priority && (
                  <span className="archive-filter__summary-item">
                    優先度: {PRIORITY_OPTIONS.find(opt => opt.value === filter.priority)?.label}
                  </span>
                )}
                {filter.tags && filter.tags.length > 0 && (
                  <span className="archive-filter__summary-item">
                    タグ: {filter.tags.join(', ')}
                  </span>
                )}
                {filter.searchText && (
                  <span className="archive-filter__summary-item">
                    検索: "{filter.searchText}"
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
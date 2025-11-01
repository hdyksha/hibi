/**
 * Common filter hook for managing filter state and operations
 * Provides reusable filtering functionality across different views
 */

import { useState, useCallback, useMemo } from 'react';
import { TodoFilter, TodoItem } from '../types';

export interface UseFilterOptions {
  storageKey?: string;
  defaultFilter?: TodoFilter;
}

export interface UseFilterReturn {
  filter: TodoFilter;
  setFilter: (filter: TodoFilter) => void;
  clearFilter: () => void;
  hasActiveFilter: boolean;
  applyFilter: (items: TodoItem[]) => TodoItem[];
}

const getInitialFilter = (storageKey?: string, defaultFilter: TodoFilter = {}): TodoFilter => {
  if (!storageKey) return defaultFilter;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return { ...defaultFilter, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn(`Failed to load filter from localStorage (${storageKey}):`, error);
  }
  return defaultFilter;
};

const saveFilter = (filter: TodoFilter, storageKey?: string) => {
  if (!storageKey) return;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(filter));
  } catch (error) {
    console.warn(`Failed to save filter to localStorage (${storageKey}):`, error);
  }
};

export const useFilter = (options: UseFilterOptions = {}): UseFilterReturn => {
  const { storageKey, defaultFilter = {} } = options;
  
  const [filter, setFilterState] = useState<TodoFilter>(() => 
    getInitialFilter(storageKey, defaultFilter)
  );

  const setFilter = useCallback((newFilter: TodoFilter) => {
    setFilterState(newFilter);
    saveFilter(newFilter, storageKey);
  }, [storageKey]);

  const clearFilter = useCallback(() => {
    setFilter(defaultFilter);
  }, [setFilter, defaultFilter]);

  const hasActiveFilter = useMemo(() => {
    const activeKeys = Object.keys(filter).filter(key => {
      const value = filter[key as keyof TodoFilter];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== undefined && value !== null;
    });
    return activeKeys.length > 0;
  }, [filter]);

  const applyFilter = useCallback((items: TodoItem[]): TodoItem[] => {
    if (!hasActiveFilter) return items;

    return items.filter(item => {
      // Status filter
      if (filter.status) {
        if (filter.status === 'completed' && !item.completed) return false;
        if (filter.status === 'pending' && item.completed) return false;
      }

      // Priority filter
      if (filter.priority && item.priority !== filter.priority) {
        return false;
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(filterTag => 
          item.tags.includes(filterTag)
        );
        if (!hasMatchingTag) return false;
      }

      // Search text filter
      if (filter.searchText && filter.searchText.trim()) {
        const searchLower = filter.searchText.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const memoMatch = item.memo?.toLowerCase().includes(searchLower) || false;
        const tagMatch = item.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
        
        if (!titleMatch && !memoMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [filter, hasActiveFilter]);

  return {
    filter,
    setFilter,
    clearFilter,
    hasActiveFilter,
    applyFilter,
  };
};
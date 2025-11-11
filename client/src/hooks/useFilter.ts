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
    const storedFilterJson = localStorage.getItem(storageKey);
    if (storedFilterJson) {
      return { ...defaultFilter, ...JSON.parse(storedFilterJson) };
    }
  } catch (error) {
    console.warn(`Failed to load filter from localStorage (${storageKey}):`, error);
  }
  return defaultFilter;
};

const saveFilterToStorage = (filter: TodoFilter, storageKey?: string) => {
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
    saveFilterToStorage(newFilter, storageKey);
  }, [storageKey]);

  const clearFilter = useCallback(() => {
    setFilter(defaultFilter);
  }, [setFilter, defaultFilter]);

  const hasActiveFilter = useMemo(() => {
    const activeFilterKeys = (Object.keys(filter) as Array<keyof TodoFilter>).filter(key => {
      const value = filter[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== undefined && value !== null;
    });
    return activeFilterKeys.length > 0;
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
        const itemHasMatchingTag = filter.tags.some(filterTag => 
          item.tags.includes(filterTag)
        );
        if (!itemHasMatchingTag) return false;
      }

      // Search text filter
      if (filter.searchText && filter.searchText.trim()) {
        const searchTextLowerCase = filter.searchText.toLowerCase();
        const titleMatches = item.title.toLowerCase().includes(searchTextLowerCase);
        const memoMatches = item.memo?.toLowerCase().includes(searchTextLowerCase) || false;
        const tagMatches = item.tags.some(tag => 
          tag.toLowerCase().includes(searchTextLowerCase)
        );
        
        if (!titleMatches && !memoMatches && !tagMatches) {
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
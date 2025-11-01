/**
 * Custom hook for managing archive state and operations
 * Provides archive-specific functionality separate from main todos
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ArchiveGroup, TodoFilter } from '../types';
import { todoApiClient } from '../services';

export interface UseArchiveReturn {
  archiveGroups: ArchiveGroup[];
  loading: boolean;
  error: string | null;
  filter: TodoFilter;
  availableTags: string[];
  filteredGroups: ArchiveGroup[];
  totalTasks: number;
  filteredTasks: number;
  hasActiveFilter: boolean;
  setFilter: (filter: TodoFilter) => void;
  refreshArchive: () => Promise<void>;
  clearFilter: () => void;
}

const ARCHIVE_FILTER_STORAGE_KEY = 'todo-app-archive-filter';

const getInitialArchiveFilter = (): TodoFilter => {
  try {
    const stored = localStorage.getItem(ARCHIVE_FILTER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load archive filter from localStorage:', error);
  }
  return {};
};

const saveArchiveFilter = (filter: TodoFilter) => {
  try {
    localStorage.setItem(ARCHIVE_FILTER_STORAGE_KEY, JSON.stringify(filter));
  } catch (error) {
    console.warn('Failed to save archive filter to localStorage:', error);
  }
};

export const useArchive = (): UseArchiveReturn => {
  const [archiveGroups, setArchiveGroups] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<TodoFilter>(getInitialArchiveFilter);

  const setFilter = useCallback((newFilter: TodoFilter) => {
    setFilterState(newFilter);
    saveArchiveFilter(newFilter);
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({});
  }, [setFilter]);

  const refreshArchive = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoApiClient.getArchive();
      setArchiveGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load archive data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Extract available tags from archive data
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    archiveGroups.forEach(group => {
      group.tasks.forEach(task => {
        task.tags.forEach(tag => tagSet.add(tag));
      });
    });
    return Array.from(tagSet).sort();
  }, [archiveGroups]);

  // Apply filters to archive groups
  const filteredGroups = useMemo(() => {
    if (Object.keys(filter).length === 0) {
      return archiveGroups;
    }

    return archiveGroups.map(group => {
      const filteredTasks = group.tasks.filter(task => {
        // Priority filter
        if (filter.priority && task.priority !== filter.priority) {
          return false;
        }

        // Tags filter
        if (filter.tags && filter.tags.length > 0) {
          const hasMatchingTag = filter.tags.some(filterTag => 
            task.tags.includes(filterTag)
          );
          if (!hasMatchingTag) {
            return false;
          }
        }

        // Search text filter
        if (filter.searchText) {
          const searchLower = filter.searchText.toLowerCase();
          const titleMatch = task.title.toLowerCase().includes(searchLower);
          const memoMatch = task.memo?.toLowerCase().includes(searchLower) || false;
          const tagMatch = task.tags.some(tag => 
            tag.toLowerCase().includes(searchLower)
          );
          
          if (!titleMatch && !memoMatch && !tagMatch) {
            return false;
          }
        }

        return true;
      });

      return {
        ...group,
        tasks: filteredTasks,
        count: filteredTasks.length
      };
    }).filter(group => group.tasks.length > 0);
  }, [archiveGroups, filter]);

  // Calculate totals
  const totalTasks = useMemo(() => 
    archiveGroups.reduce((total, group) => total + group.count, 0), 
    [archiveGroups]
  );

  const filteredTasks = useMemo(() => 
    filteredGroups.reduce((total, group) => total + group.count, 0), 
    [filteredGroups]
  );

  const hasActiveFilter = useMemo(() => 
    Object.keys(filter).length > 0, 
    [filter]
  );

  // Load archive data on mount
  useEffect(() => {
    refreshArchive();
  }, [refreshArchive]);

  return {
    archiveGroups,
    loading,
    error,
    filter,
    availableTags,
    filteredGroups,
    totalTasks,
    filteredTasks,
    hasActiveFilter,
    setFilter,
    refreshArchive,
    clearFilter,
  };
};
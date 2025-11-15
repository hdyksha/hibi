/**
 * Custom hook for managing archive state and operations
 * Provides archive-specific functionality separate from main todos
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ArchiveGroup, TodoFilter } from '../types';
import { todoApi } from '../services';
import { useFilter } from './useFilter';
import { useErrorHandler } from './useErrorHandler';
import { DEFAULT_ARCHIVE_FILTER } from '../constants/filters';

/**
 * Return value from useArchive hook
 */
export interface UseArchiveReturn {
  /** All archive groups (unfiltered) */
  archiveGroups: ArchiveGroup[];
  /** Whether archive data is currently loading (initial load only) */
  loading: boolean;
  /** Whether archive data is being refreshed in the background */
  isRefreshing: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Current filter state */
  filter: TodoFilter;
  /** All available tags from archived tasks */
  availableTags: string[];
  /** Archive groups after applying filters */
  filteredGroups: ArchiveGroup[];
  /** Total number of archived tasks (unfiltered) */
  totalTasks: number;
  /** Number of tasks after applying filters */
  filteredTasks: number;
  /** Whether any filter is currently active */
  hasActiveFilter: boolean;
  /** Update the filter state */
  setFilter: (filter: TodoFilter) => void;
  /** Refresh archive data from the server */
  refreshArchive: (silent?: boolean) => Promise<void>;
  /** Clear all filters and reset to default */
  clearFilter: () => void;
  /** Retry the last failed action */
  retryLastAction: () => Promise<void>;
  /** Whether a retry is currently in progress */
  isRetrying: boolean;
}

/**
 * Custom hook for managing archive state and operations
 * Handles loading, filtering, and managing completed todo items
 * 
 * @returns Archive state and operations
 * 
 * @example
 * ```tsx
 * const { 
 *   filteredGroups, 
 *   loading, 
 *   error, 
 *   setFilter,
 *   refreshArchive 
 * } = useArchive();
 * ```
 */
export const useArchive = (): UseArchiveReturn => {
  const [archiveGroups, setArchiveGroups] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use enhanced error handler
  const { 
    error: errorState, 
    setError, 
    clearError, 
    retryLastAction, 
    isRetrying 
  } = useErrorHandler();

  // Use common filter hook for archive
  const { 
    filter, 
    setFilter, 
    clearFilter, 
    hasActiveFilter,
    applyFilter 
  } = useFilter({
    storageKey: 'todo-app-archive-filter',
    defaultFilter: DEFAULT_ARCHIVE_FILTER
  });

  const refreshArchive = useCallback(async (silent?: boolean) => {
    try {
      // Don't show any loading indicators for silent refresh
      if (!silent) {
        // For non-silent refresh, use isRefreshing state
        // Initial loading state is managed separately
        setIsRefreshing(true);
      }
      
      clearError();
      const archiveData = await todoApi.getArchive();
      setArchiveGroups(archiveData);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('Failed to load archive data');
      setError(normalizedError);
      // Don't rethrow - error is already set in state
    } finally {
      if (!silent) {
        setIsRefreshing(false);
      }
    }
  }, [clearError, setError]);

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

  // Apply filters to archive groups using common filter logic
  const filteredGroups = useMemo(() => {
    if (!hasActiveFilter) {
      return archiveGroups;
    }

    return archiveGroups.map(group => {
      const filteredTasks = applyFilter(group.tasks);

      return {
        ...group,
        tasks: filteredTasks,
        count: filteredTasks.length
      };
    }).filter(group => group.tasks.length > 0);
  }, [archiveGroups, hasActiveFilter, applyFilter]);

  // Calculate totals
  const totalTasks = useMemo(() => 
    archiveGroups.reduce((total, group) => total + group.count, 0), 
    [archiveGroups]
  );

  const filteredTasks = useMemo(() => 
    filteredGroups.reduce((total, group) => total + group.count, 0), 
    [filteredGroups]
  );



  // Load archive data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await refreshArchive(true); // silent=true for initial load
      } catch (error) {
        // Error is already handled in refreshArchive
      } finally {
        setLoading(false); // Complete initial loading regardless of success/failure
      }
    };
    
    initializeData();
  }, [refreshArchive]);

  return {
    archiveGroups,
    loading,
    isRefreshing,
    error: errorState?.message || null,
    filter,
    availableTags,
    filteredGroups,
    totalTasks,
    filteredTasks,
    hasActiveFilter,
    setFilter,
    refreshArchive,
    clearFilter,
    retryLastAction,
    isRetrying,
  };
};
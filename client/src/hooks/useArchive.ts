/**
 * Custom hook for managing archive state and operations
 * Provides archive-specific functionality separate from main todos
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ArchiveGroup, TodoFilter } from '../types';
import { todoApiClient } from '../services';
import { useFilter } from './useFilter';
import { useErrorHandler } from './useErrorHandler';

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
  retryLastAction: () => Promise<void>;
  isRetrying: boolean;
}

export const useArchive = (): UseArchiveReturn => {
  const [archiveGroups, setArchiveGroups] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    defaultFilter: {}
  });

  const refreshArchive = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const data = await todoApiClient.getArchive();
      setArchiveGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load archive data'));
    } finally {
      setLoading(false);
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
    refreshArchive();
  }, [refreshArchive]);

  return {
    archiveGroups,
    loading,
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
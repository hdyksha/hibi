/**
 * Custom hook for managing todo state and operations
 * 
 * Responsibilities:
 * - Manages todo list state and loading state
 * - Provides CRUD operations for todos
 * - Integrates filtering functionality
 * - Handles errors consistently across all operations
 * - Manages available tags for the application
 * 
 * @returns {UseTodosReturn} Todo state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { TodoItem, CreateTodoItemInput, UpdateTodoItemInput, TodoFilter } from '../types';
import { todoApi } from '../services';
import { useFilter } from './useFilter';
import { useErrorHandler } from './useErrorHandler';
import { DEFAULT_TODO_FILTER } from '../constants/filters';

/**
 * Return type for useTodos hook
 */
export interface UseTodosReturn {
    /** List of todos based on current filter */
    todos: TodoItem[];
    /** Loading state for initial data load only */
    loading: boolean;
    /** Loading state for background refresh operations */
    isRefreshing: boolean;
    /** Current error message, if any */
    error: string | null;
    /** Current filter settings */
    filter: TodoFilter;
    /** List of all available tags across todos */
    availableTags: string[];
    /** Whether any filter is currently active */
    hasActiveFilter: boolean;
    /** Refresh todos from server */
    refreshTodos: (silent?: boolean) => Promise<void>;
    /** Update current filter */
    setFilter: (filter: TodoFilter) => void;
    /** Clear all filters */
    clearFilter: () => void;
    /** Create a new todo */
    createTodo: (input: CreateTodoItemInput) => Promise<TodoItem>;
    /** Update an existing todo */
    updateTodo: (id: string, input: UpdateTodoItemInput) => Promise<TodoItem>;
    /** Toggle completion status of a todo */
    toggleTodoCompletion: (id: string) => Promise<TodoItem>;
    /** Delete a todo */
    deleteTodo: (id: string) => Promise<void>;
    /** Retry the last failed action */
    retryLastAction: () => Promise<void>;
    /** Whether a retry is currently in progress */
    isRetrying: boolean;
}

/**
 * Normalizes an error into a consistent Error object
 */
const normalizeError = (caughtError: unknown, defaultMessage: string): Error => {
    return caughtError instanceof Error ? caughtError : new Error(defaultMessage);
};

/**
 * Main hook for managing todos
 * 
 * This hook coordinates:
 * - Todo data fetching and state management
 * - CRUD operations with consistent error handling
 * - Filter integration for todo list
 * - Tag management for the application
 */
export const useTodos = (): UseTodosReturn => {
    // Local state
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    
    // Integrated hooks for cross-cutting concerns
    const { 
        error: errorState, 
        setError, 
        clearError, 
        retryLastAction, 
        isRetrying 
    } = useErrorHandler();

    const { 
        filter, 
        setFilter, 
        clearFilter, 
        hasActiveFilter 
    } = useFilter({
        storageKey: 'todo-app-filter',
        defaultFilter: DEFAULT_TODO_FILTER
    });

    /**
     * Fetches todos from the server with current filter applied
     * @param silent - If true, performs a silent refresh without showing loading indicators
     */
    const refreshTodos = useCallback(async (silent?: boolean) => {
        try {
            // Don't show any loading indicators for silent refresh
            if (!silent) {
                // For non-silent refresh, use isRefreshing state
                // Initial loading state is managed separately
                setIsRefreshing(true);
            }
            
            clearError();
            const todoItems = await todoApi.getTodos(filter);
            setTodos(todoItems);
        } catch (error) {
            setError(normalizeError(error, 'Failed to load todos'));
        } finally {
            if (!silent) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [filter, clearError, setError]);

    /**
     * Fetches available tags from the server
     * Non-critical operation - failures are logged but don't block functionality
     */
    const refreshTags = useCallback(async () => {
        try {
            const tags = await todoApi.getTags();
            setAvailableTags(tags);
        } catch (error) {
            console.warn('Failed to load tags:', error);
        }
    }, []);

    /**
     * Creates a new todo and refreshes the list
     */
    const createTodo = useCallback(async (input: CreateTodoItemInput): Promise<TodoItem> => {
        try {
            clearError();
            const newTodo = await todoApi.createTodo(input);
            await Promise.all([refreshTodos(), refreshTags()]);
            return newTodo;
        } catch (caughtError) {
            const error = normalizeError(caughtError, 'Failed to create todo');
            setError(error);
            throw error;
        }
    }, [refreshTodos, refreshTags, clearError, setError]);

    /**
     * Updates an existing todo and refreshes the list
     */
    const updateTodo = useCallback(async (id: string, input: UpdateTodoItemInput): Promise<TodoItem> => {
        try {
            clearError();
            const updatedTodo = await todoApi.updateTodo(id, input);
            await Promise.all([refreshTodos(), refreshTags()]);
            return updatedTodo;
        } catch (caughtError) {
            const error = normalizeError(caughtError, 'Failed to update todo');
            setError(error);
            throw error;
        }
    }, [refreshTodos, refreshTags, clearError, setError]);

    /**
     * Toggles the completion status of a todo
     */
    const toggleTodoCompletion = useCallback(async (id: string): Promise<TodoItem> => {
        try {
            clearError();
            const updatedTodo = await todoApi.toggleTodoCompletion(id);
            await refreshTodos();
            return updatedTodo;
        } catch (caughtError) {
            const error = normalizeError(caughtError, 'Failed to toggle todo completion');
            setError(error);
            throw error;
        }
    }, [refreshTodos, clearError, setError]);

    /**
     * Deletes a todo and refreshes the list
     */
    const deleteTodo = useCallback(async (id: string): Promise<void> => {
        try {
            clearError();
            await todoApi.deleteTodo(id);
            await refreshTodos();
        } catch (caughtError) {
            const error = normalizeError(caughtError, 'Failed to delete todo');
            setError(error);
            throw error;
        }
    }, [refreshTodos, clearError, setError]);

    // Initialize: Load todos and tags on mount
    useEffect(() => {
        refreshTodos();
        refreshTags();
    }, [refreshTodos, refreshTags]);

    return {
        todos,
        loading,
        isRefreshing,
        error: errorState?.message || null,
        filter,
        availableTags,
        hasActiveFilter,
        refreshTodos,
        setFilter,
        clearFilter,
        createTodo,
        updateTodo,
        toggleTodoCompletion,
        deleteTodo,
        retryLastAction,
        isRetrying,
    };
};
/**
 * Custom hook for managing todo state
 * Provides a single source of truth for todo operations
 */

import { useState, useCallback, useEffect } from 'react';
import { TodoItem, CreateTodoItemInput, UpdateTodoItemInput, TodoFilter } from '../types';
import { todoApi } from '../services';
import { useFilter } from './useFilter';
import { useErrorHandler } from './useErrorHandler';
import { DEFAULT_TODO_FILTER } from '../constants/filters';

export interface UseTodosReturn {
    todos: TodoItem[];
    loading: boolean;
    error: string | null;
    filter: TodoFilter;
    availableTags: string[];
    hasActiveFilter: boolean;
    refreshTodos: () => Promise<void>;
    setFilter: (filter: TodoFilter) => void;
    clearFilter: () => void;
    createTodo: (input: CreateTodoItemInput) => Promise<TodoItem>;
    updateTodo: (id: string, input: UpdateTodoItemInput) => Promise<TodoItem>;
    toggleTodoCompletion: (id: string) => Promise<TodoItem>;
    deleteTodo: (id: string) => Promise<void>;
    retryLastAction: () => Promise<void>;
    isRetrying: boolean;
}

export const useTodos = (): UseTodosReturn => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    
    // Use enhanced error handler
    const { 
        error: errorState, 
        setError, 
        clearError, 
        retryLastAction, 
        isRetrying 
    } = useErrorHandler();

    // Use common filter hook with default to show only pending tasks
    const { 
        filter, 
        setFilter, 
        clearFilter, 
        hasActiveFilter 
    } = useFilter({
        storageKey: 'todo-app-filter',
        defaultFilter: DEFAULT_TODO_FILTER
    });

    const refreshTodos = useCallback(async () => {
        try {
            setLoading(true);
            clearError();
            const todoItems = await todoApi.getTodos(filter);
            setTodos(todoItems);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load todos'));
        } finally {
            setLoading(false);
        }
    }, [filter, clearError, setError]);

    const refreshTags = useCallback(async () => {
        try {
            const tags = await todoApi.getTags();
            setAvailableTags(tags);
        } catch (err) {
            // Tags loading failure shouldn't block the main functionality
            console.warn('Failed to load tags:', err);
        }
    }, []);

    const createTodo = useCallback(async (input: CreateTodoItemInput): Promise<TodoItem> => {
        try {
            clearError();
            const newTodo = await todoApi.createTodo(input);
            await refreshTodos(); // Refresh to get the latest state from server
            await refreshTags(); // Refresh tags in case new tags were added
            return newTodo;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to create todo');
            setError(error);
            throw error;
        }
    }, [refreshTodos, refreshTags, clearError, setError]);

    const updateTodo = useCallback(async (id: string, input: UpdateTodoItemInput): Promise<TodoItem> => {
        try {
            clearError();
            const updatedTodo = await todoApi.updateTodo(id, input);
            await refreshTodos(); // Refresh to get the latest state from server
            await refreshTags(); // Refresh tags in case tags were modified
            return updatedTodo;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update todo');
            setError(error);
            throw error;
        }
    }, [refreshTodos, refreshTags, clearError, setError]);

    const toggleTodoCompletion = useCallback(async (id: string): Promise<TodoItem> => {
        try {
            clearError();
            const updatedTodo = await todoApi.toggleTodoCompletion(id);
            await refreshTodos(); // Refresh to get the latest state from server
            return updatedTodo;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to toggle todo completion');
            setError(error);
            throw error;
        }
    }, [refreshTodos, clearError, setError]);

    const deleteTodo = useCallback(async (id: string): Promise<void> => {
        try {
            clearError();
            await todoApi.deleteTodo(id);
            await refreshTodos(); // Refresh to get the latest state from server
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to delete todo');
            setError(error);
            throw error;
        }
    }, [refreshTodos, clearError, setError]);

    // Load todos and tags on mount
    useEffect(() => {
        refreshTodos();
        refreshTags();
    }, [refreshTodos, refreshTags]);

    return {
        todos,
        loading,
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
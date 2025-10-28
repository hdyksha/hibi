/**
 * Custom hook for managing todo state
 * Provides a single source of truth for todo operations
 */

import { useState, useCallback, useEffect } from 'react';
import { TodoItem, CreateTodoItemInput, UpdateTodoItemInput } from '../types';
import { todoApiClient } from '../services';

export interface UseTodosReturn {
    todos: TodoItem[];
    loading: boolean;
    error: string | null;
    refreshTodos: () => Promise<void>;
    createTodo: (input: CreateTodoItemInput) => Promise<TodoItem>;
    updateTodo: (id: string, input: UpdateTodoItemInput) => Promise<TodoItem>;
    toggleTodoCompletion: (id: string) => Promise<TodoItem>;
    deleteTodo: (id: string) => Promise<void>;
}

export const useTodos = (): UseTodosReturn => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshTodos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const todoItems = await todoApiClient.getTodos();
            setTodos(todoItems);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load todos');
        } finally {
            setLoading(false);
        }
    }, []);

    const createTodo = useCallback(async (input: CreateTodoItemInput): Promise<TodoItem> => {
        try {
            setError(null);
            const newTodo = await todoApiClient.createTodo(input);
            await refreshTodos(); // Refresh to get the latest state from server
            return newTodo;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create todo');
            throw err;
        }
    }, [refreshTodos]);

    const updateTodo = useCallback(async (id: string, input: UpdateTodoItemInput): Promise<TodoItem> => {
        try {
            setError(null);
            const updatedTodo = await todoApiClient.updateTodo(id, input);
            await refreshTodos(); // Refresh to get the latest state from server
            return updatedTodo;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update todo');
            throw err;
        }
    }, [refreshTodos]);

    const toggleTodoCompletion = useCallback(async (id: string): Promise<TodoItem> => {
        try {
            setError(null);
            const updatedTodo = await todoApiClient.toggleTodoCompletion(id);
            await refreshTodos(); // Refresh to get the latest state from server
            return updatedTodo;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle todo completion');
            throw err;
        }
    }, [refreshTodos]);

    const deleteTodo = useCallback(async (id: string): Promise<void> => {
        try {
            setError(null);
            await todoApiClient.deleteTodo(id);
            await refreshTodos(); // Refresh to get the latest state from server
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete todo');
            throw err;
        }
    }, [refreshTodos]);

    // Load todos on mount
    useEffect(() => {
        refreshTodos();
    }, [refreshTodos]);

    return {
        todos,
        loading,
        error,
        refreshTodos,
        createTodo,
        updateTodo,
        toggleTodoCompletion,
        deleteTodo,
    };
};
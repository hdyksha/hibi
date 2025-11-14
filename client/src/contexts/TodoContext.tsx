/**
 * Todo Context for global state management
 * Provides shared todo state and archive state across all components
 * Includes optimistic UI updates for immediate feedback
 */

import React, { createContext, useContext, ReactNode, useEffect, useState, useMemo, useCallback } from 'react';
import { useTodos, UseTodosReturn } from '../hooks/useTodos';
import { useArchive, UseArchiveReturn } from '../hooks/useArchive';
import { httpClient, todoApi } from '../services';
import { useNetworkContext } from './NetworkContext';
import { TodoItem, CreateTodoItemInput } from '../types';
import { ANIMATION_DURATION } from '../utils/animations';

/**
 * Extended TodoItem with optimistic state flags
 */
interface OptimisticTodoItem extends TodoItem {
  isPending?: boolean;
  isExiting?: boolean;
}

interface TodoContextValue extends Omit<UseTodosReturn, 'clearFilter'> {
  archive: UseArchiveReturn;
  clearFilter: () => void;
  /** Todos including optimistic updates */
  displayTodos: OptimisticTodoItem[];
  /** Add todo with optimistic UI update */
  addTodoOptimistic: (input: CreateTodoItemInput) => Promise<TodoItem>;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const networkContext = useNetworkContext();
  const todoState = useTodos();
  const archiveState = useArchive();
  
  // Optimistic state management
  const [optimisticTodos, setOptimisticTodos] = useState<OptimisticTodoItem[]>([]);

  // Set up network reporter for HTTP client
  useEffect(() => {
    httpClient.setNetworkReporter({
      reportConnectionError: networkContext.reportConnectionError,
      reportConnectionSuccess: networkContext.reportConnectionSuccess,
    });
  }, [networkContext.reportConnectionError, networkContext.reportConnectionSuccess]);

  /**
   * Merge optimistic and actual todos for display
   * Optimistic todos appear first to show immediate feedback
   * Filters out duplicates based on ID
   */
  const displayTodos = useMemo<OptimisticTodoItem[]>(() => {
    const optimisticIds = new Set(optimisticTodos.map(t => t.id));
    const actualTodos = todoState.todos.filter(t => !optimisticIds.has(t.id));
    return [...optimisticTodos, ...actualTodos];
  }, [optimisticTodos, todoState.todos]);

  /**
   * Add todo with optimistic UI update
   * Shows the todo immediately before API confirmation
   * Bypasses refreshTodos to avoid unnecessary loading states
   */
  const addTodoOptimistic = useCallback(async (input: CreateTodoItemInput): Promise<TodoItem> => {
    // Generate temporary ID for optimistic todo
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create optimistic todo item
    const optimisticTodo: OptimisticTodoItem = {
      id: tempId,
      title: input.title,
      completed: false,
      priority: input.priority || 'medium',
      tags: input.tags || [],
      memo: input.memo || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      isPending: true, // Flag for visual indication
    };

    // Add optimistically to display (at the beginning for newest-first order)
    setOptimisticTodos(prev => [optimisticTodo, ...prev]);

    try {
      // Make actual API call directly (bypassing createTodo to avoid refresh)
      const newTodo = await todoApi.createTodo(input);
      
      // Replace optimistic todo with the real todo from server
      // Keep it in optimistic list permanently to maintain position and avoid flicker
      setOptimisticTodos(prev => 
        prev.map(t => t.id === tempId ? { ...newTodo, isPending: false } : t)
      );
      
      // Note: We don't call refreshTodos() to avoid:
      // 1. Loading states
      // 2. Position changes (server order vs optimistic order)
      // 3. Flickering
      // The todo list will naturally sync on next page load or user action
      
      return newTodo;
    } catch (error) {
      // Rollback optimistic update with animation delay
      setTimeout(() => {
        setOptimisticTodos(prev => prev.filter(t => t.id !== tempId));
      }, ANIMATION_DURATION.slow);
      
      throw error;
    }
  }, [todoState]);

  const contextValue: TodoContextValue = {
    ...todoState,
    archive: archiveState,
    clearFilter: todoState.clearFilter,
    displayTodos,
    addTodoOptimistic,
  };

  return (
    <TodoContext.Provider value={contextValue}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodoContext = (): TodoContextValue => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};
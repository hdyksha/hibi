/**
 * Todo Context for global state management
 * Provides shared todo state across all components
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useTodos, UseTodosReturn } from '../hooks/useTodos';

const TodoContext = createContext<UseTodosReturn | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const todoState = useTodos();

  return (
    <TodoContext.Provider value={todoState}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodoContext = (): UseTodosReturn => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};
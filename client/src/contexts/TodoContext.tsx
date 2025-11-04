/**
 * Todo Context for global state management
 * Provides shared todo state and archive state across all components
 */

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useTodos, UseTodosReturn } from '../hooks/useTodos';
import { useArchive, UseArchiveReturn } from '../hooks/useArchive';
import { todoApiClient } from '../services';
import { useNetworkContext } from './NetworkContext';

interface TodoContextValue extends UseTodosReturn {
  archive: UseArchiveReturn;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const networkContext = useNetworkContext();
  const todoState = useTodos();
  const archiveState = useArchive();

  // Set up network reporter for API client
  useEffect(() => {
    todoApiClient.setNetworkReporter({
      reportConnectionError: networkContext.reportConnectionError,
      reportConnectionSuccess: networkContext.reportConnectionSuccess,
    });
  }, [networkContext.reportConnectionError, networkContext.reportConnectionSuccess]);

  const contextValue: TodoContextValue = {
    ...todoState,
    archive: archiveState,
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
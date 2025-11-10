/**
 * Mock providers for testing
 * Provides simplified versions of context providers that don't trigger side effects
 */

import React, { ReactNode } from 'react';
import { TodoProvider as RealTodoProvider, NetworkContext } from '../contexts';

interface MockProvidersProps {
  children: ReactNode;
}

/**
 * Mock NetworkProvider that doesn't perform network checks
 * This prevents act() warnings in tests
 */
export const MockNetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <NetworkContext.Provider value={{
      isOnline: true,
      isSlowConnection: false,
      lastOnlineAt: Date.now(),
      connectionType: null,
      checkConnection: async () => true,
      reportConnectionError: () => {},
      reportConnectionSuccess: () => {},
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

/**
 * Wrapper that provides all necessary providers for testing
 */
export const TestProviders: React.FC<MockProvidersProps> = ({ children }) => {
  return (
    <MockNetworkProvider>
      <RealTodoProvider>
        {children}
      </RealTodoProvider>
    </MockNetworkProvider>
  );
};

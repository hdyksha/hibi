/**
 * Mock providers for testing
 * Provides simplified versions of context providers that don't trigger side effects
 * 
 * This approach keeps production code clean by handling test-specific concerns
 * in the test layer rather than adding conditional logic to production code.
 */

import React, { ReactNode } from 'react';
import { TodoProvider as RealTodoProvider, NetworkContext } from '../contexts';

interface MockProvidersProps {
  children: ReactNode;
}

/**
 * Mock NetworkProvider that doesn't perform network checks
 * 
 * This prevents side effects (network requests, event listeners) during tests
 * that don't need to test network functionality. Tests for useNetworkStatus
 * itself should use the real hook with proper mocking of fetch/navigator.
 */
export const MockNetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <NetworkContext.Provider value={{
      isOnline: true,
      isSlowConnection: false,
      lastOnlineAt: Date.now(),
      connectionType: null,
      checkConnection: async () => true,
      reportConnectionError: () => { },
      reportConnectionSuccess: () => { },
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

/**
 * Wrapper that provides all necessary providers for testing
 * 
 * Use this for component tests that need context but don't need to test
 * network-specific behavior. For network-specific tests, use the real
 * NetworkProvider with appropriate mocks.
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

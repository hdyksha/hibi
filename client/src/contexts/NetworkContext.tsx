/**
 * Network Context for global network status management
 * Provides centralized network status that can be updated by API calls
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useNetworkStatus, UseNetworkStatusReturn } from '../hooks/useNetworkStatus';

export const NetworkContext = createContext<UseNetworkStatusReturn | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const networkStatus = useNetworkStatus();

  return (
    <NetworkContext.Provider value={networkStatus}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetworkContext = (): UseNetworkStatusReturn => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkContext must be used within a NetworkProvider');
  }
  return context;
};
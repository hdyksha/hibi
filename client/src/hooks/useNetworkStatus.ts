/**
 * Custom hook for network status detection
 * Provides online/offline status and connection quality information
 * Requirements: 全般 - ネットワークエラー処理
 */

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  lastOnlineAt: number | null;
  connectionType: string | null;
}

export interface UseNetworkStatusReturn extends NetworkStatus {
  checkConnection: () => Promise<boolean>;
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    lastOnlineAt: navigator.onLine ? Date.now() : null,
    connectionType: null,
  });

  // Check connection quality by measuring response time
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) {
      return false;
    }

    try {
      const startTime = Date.now();
      
      // Use a small request to check connection speed
      // We'll ping our health endpoint with a HEAD request
      const response = await fetch('/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      const responseTime = Date.now() - startTime;
      const isSlowConnection = responseTime > 3000; // Consider slow if > 3 seconds
      
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: response.ok,
        isSlowConnection,
        lastOnlineAt: response.ok ? Date.now() : prev.lastOnlineAt,
      }));

      return response.ok;
    } catch (error) {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        isSlowConnection: false,
      }));
      return false;
    }
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        lastOnlineAt: Date.now(),
      }));
      
      // Check connection quality when coming back online
      checkConnection();
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        isSlowConnection: false,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkStatus(prev => ({
        ...prev,
        connectionType: connection?.effectiveType || null,
      }));

      const handleConnectionChange = () => {
        setNetworkStatus(prev => ({
          ...prev,
          connectionType: connection?.effectiveType || null,
        }));
      };

      connection?.addEventListener('change', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection?.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Initial connection check
  useEffect(() => {
    // Only check connection if online
    if (navigator.onLine) {
      checkConnection();
    }
  }, [checkConnection]);

  return {
    ...networkStatus,
    checkConnection,
  };
};
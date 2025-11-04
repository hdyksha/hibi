/**
 * Network Status Indicator Component
 * Shows network connectivity status to users
 * Requirements: 全般 - ネットワークエラー処理
 */

import React from 'react';
import { useNetworkContext } from '../contexts/NetworkContext';

interface NetworkStatusIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className = '',
  showWhenOnline = false,
}) => {
  const { isOnline, isSlowConnection, lastOnlineAt } = useNetworkContext();

  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && !isSlowConnection) {
    return null;
  }

  const getStatusMessage = () => {
    if (!isOnline) {
      const timeSinceOnline = lastOnlineAt ? Date.now() - lastOnlineAt : null;
      const timeAgo = timeSinceOnline ? Math.floor(timeSinceOnline / 1000) : null;
      
      if (timeAgo && timeAgo < 60) {
        return 'Connection lost - trying to reconnect...';
      } else if (timeAgo && timeAgo < 300) {
        return `Offline for ${Math.floor(timeAgo / 60)}m - check your connection`;
      } else {
        return 'No internet connection';
      }
    }

    if (isSlowConnection) {
      return 'Slow connection detected';
    }

    return 'Connected';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (isSlowConnection) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (!isOnline) return 'text-red-700';
    if (isSlowConnection) return 'text-yellow-700';
    return 'text-green-700';
  };

  const getBgColor = () => {
    if (!isOnline) return 'bg-red-50';
    if (isSlowConnection) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  const getBorderColor = () => {
    if (!isOnline) return 'border-red-200';
    if (isSlowConnection) return 'border-yellow-200';
    return 'border-green-200';
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getBgColor()} ${getBorderColor()} ${className}`}>
      {/* Status indicator dot */}
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      
      {/* Status message */}
      <span className={`text-sm font-medium ${getTextColor()}`}>
        {getStatusMessage()}
      </span>

      {/* Retry indicator for offline state */}
      {!isOnline && (
        <div className="ml-1">
          <svg 
            className="w-4 h-4 text-red-500 animate-spin" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </div>
      )}
    </div>
  );
};
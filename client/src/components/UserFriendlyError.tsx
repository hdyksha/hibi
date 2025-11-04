/**
 * UserFriendlyError Component
 * Advanced error display with contextual user-friendly messages and recovery options
 * Requirements: 全般 - ユーザーフレンドリーなエラー表示
 */

import React, { useState } from 'react';
import { getUserFriendlyErrorMessage, getContextualErrorMessage } from '../utils/errorMessages';

interface UserFriendlyErrorProps {
  error: string | Error;
  context?: 'create' | 'update' | 'delete' | 'fetch' | 'toggle';
  errorType?: 'network' | 'validation' | 'server' | 'unknown';
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
  showTechnicalDetails?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
}

export const UserFriendlyError: React.FC<UserFriendlyErrorProps> = ({
  error,
  context,
  errorType,
  onRetry,
  onDismiss,
  variant = 'card',
  className = '',
  showTechnicalDetails = false,
  autoRetry = false,
  maxRetries = 3
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Get user-friendly message with context
  const friendlyError = context 
    ? getContextualErrorMessage(error, context, errorType)
    : getUserFriendlyErrorMessage(error, errorType);

  const handleRetry = async () => {
    if (!onRetry || isRetrying || retryCount >= maxRetries) return;

    try {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const canRetry = onRetry && friendlyError.action && retryCount < maxRetries;
  const isMaxRetriesReached = retryCount >= maxRetries;

  // Auto-retry for network errors (disabled in test environment)
  React.useEffect(() => {
    if (autoRetry && errorType === 'network' && canRetry && !isRetrying && process.env.NODE_ENV !== 'test') {
      const timer = setTimeout(() => {
        handleRetry();
      }, 2000 * Math.pow(2, retryCount)); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [autoRetry, errorType, canRetry, isRetrying, retryCount]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'banner':
        return 'w-full bg-red-50 border-l-4 border-red-400 p-4';
      case 'inline':
        return 'bg-red-50 border border-red-200 rounded p-3';
      case 'card':
      default:
        return 'bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 shadow-sm';
    }
  };

  const getIconSize = () => {
    return variant === 'inline' ? 'w-4 h-4' : 'w-5 h-5';
  };

  const getTextSize = () => {
    return variant === 'inline' ? 'text-sm' : 'text-sm sm:text-base';
  };

  return (
    <div className={`${getVariantStyles()} ${className}`} role="alert">
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg 
            className={`${getIconSize()} text-red-500 mt-0.5`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        {/* Error Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-red-700 ${getTextSize()} break-words font-medium`}>
                {friendlyError.message}
              </p>
              
              {/* Retry count indicator */}
              {retryCount > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {isMaxRetriesReached 
                    ? `Maximum retry attempts reached (${maxRetries})`
                    : `Attempt ${retryCount} of ${maxRetries}`
                  }
                </p>
              )}
            </div>
            
            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors duration-200 p-1 -m-1"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Technical details */}
          {showTechnicalDetails && errorMessage !== friendlyError.message && (
            <div className="mt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-red-600 hover:text-red-800 cursor-pointer underline"
              >
                {showDetails ? 'Hide' : 'Show'} technical details
              </button>
              
              {showDetails && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-700 break-all">
                  {errorMessage}
                  {error instanceof Error && error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Stack trace</summary>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {canRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className={`px-4 py-2 bg-red-600 text-white border-none rounded-md font-medium transition-all duration-200 hover:bg-red-700 hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 active:bg-red-800 ${
                  variant === 'inline' ? 'text-xs min-h-[32px]' : 'text-sm min-h-[36px]'
                } ${isRetrying ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isRetrying ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Retrying...
                  </span>
                ) : (
                  friendlyError.action || 'Try again'
                )}
              </button>
            )}
            
            {/* Additional context-specific actions */}
            {context === 'fetch' && (
              <button
                onClick={() => window.location.reload()}
                className={`px-4 py-2 bg-gray-600 text-white border-none rounded-md font-medium transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500/50 ${
                  variant === 'inline' ? 'text-xs min-h-[32px]' : 'text-sm min-h-[36px]'
                }`}
              >
                Refresh page
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
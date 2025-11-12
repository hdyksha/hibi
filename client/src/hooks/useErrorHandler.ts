/**
 * Custom hook for centralized error handling
 * Provides consistent error state management and recovery mechanisms
 * Requirements: 全般 - エラーハンドリング
 */

import { useState, useCallback, useRef } from 'react';
import { ApiClientError } from '../services';

/**
 * Represents the state of an error with metadata
 */
export interface ErrorState {
  /** Human-readable error message */
  message: string;
  /** Category of error for appropriate handling */
  type: 'network' | 'validation' | 'server' | 'unknown';
  /** HTTP status code if applicable */
  status?: number;
  /** Whether the operation can be retried */
  retryable: boolean;
  /** Timestamp when the error occurred */
  timestamp: number;
}

/**
 * Return value from useErrorHandler hook
 */
export interface UseErrorHandlerReturn {
  /** Current error state, null if no error */
  error: ErrorState | null;
  /** Whether an error is currently present */
  hasError: boolean;
  /** Set or clear the error state */
  setError: (error: Error | string | null) => void;
  /** Clear the current error */
  clearError: () => void;
  /** Retry the last failed action */
  retryLastAction: () => Promise<void>;
  /** Whether a retry is currently in progress */
  isRetrying: boolean;
}

/**
 * Custom hook for centralized error handling
 * Provides consistent error state management with automatic error categorization
 * and retry capabilities for recoverable errors
 * 
 * @param onRetry - Optional callback function to execute when retrying
 * @returns Error state and management functions
 * 
 * @example
 * ```tsx
 * const { error, setError, clearError, retryLastAction } = useErrorHandler(
 *   async () => await fetchData()
 * );
 * 
 * try {
 *   await someOperation();
 * } catch (err) {
 *   setError(err);
 * }
 * ```
 */
export const useErrorHandler = (
  onRetry?: () => Promise<void>
): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<ErrorState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryActionRef = useRef<(() => Promise<void>) | null>(null);

  const setError = useCallback((errorInput: Error | string | null) => {
    if (!errorInput) {
      setErrorState(null);
      return;
    }

    const errorMessage = typeof errorInput === 'string' ? errorInput : errorInput.message;
    let errorType: ErrorState['type'] = 'unknown';
    let status: number | undefined;
    let retryable = false;

    if (errorInput instanceof ApiClientError) {
      status = errorInput.status;
      
      // Determine error type based on status code and message
      if (status === 400 || status === 422) {
        errorType = 'validation';
        retryable = false;
      } else if (status === 404) {
        errorType = 'server';
        retryable = false;
      } else if (status && status >= 500) {
        errorType = 'server';
        retryable = true;
      } else if (errorMessage.toLowerCase().includes('network')) {
        errorType = 'network';
        retryable = true;
      } else {
        errorType = 'server';
        retryable = true;
      }
    } else if (errorInput instanceof TypeError && errorInput.message.includes('fetch')) {
      errorType = 'network';
      retryable = true;
    } else {
      // Check message content for hints
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
        errorType = 'network';
        retryable = true;
      } else if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
        errorType = 'validation';
        retryable = false;
      } else {
        errorType = 'unknown';
        retryable = true;
      }
    }

    setErrorState({
      message: errorMessage,
      type: errorType,
      status,
      retryable,
      timestamp: Date.now(),
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const retryLastAction = useCallback(async () => {
    if (!error?.retryable || isRetrying) {
      return;
    }

    const actionToRetry = retryActionRef.current || onRetry;
    if (!actionToRetry) {
      return;
    }

    try {
      setIsRetrying(true);
      clearError();
      await actionToRetry();
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError : 'Retry failed');
    } finally {
      setIsRetrying(false);
    }
  }, [error?.retryable, isRetrying, onRetry, clearError, setError]);

  // Store retry action for later use
  const setRetryAction = useCallback((action: () => Promise<void>) => {
    retryActionRef.current = action;
  }, []);

  return {
    error,
    hasError: error !== null,
    setError,
    clearError,
    retryLastAction,
    isRetrying,
  };
};
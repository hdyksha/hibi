/**
 * Custom hook for centralized error handling
 * Provides consistent error state management and recovery mechanisms
 * Requirements: 全般 - エラーハンドリング
 */

import { useState, useCallback, useRef } from 'react';
import { ApiClientError } from '../services';

export interface ErrorState {
  message: string;
  type: 'network' | 'validation' | 'server' | 'unknown';
  status?: number;
  retryable: boolean;
  timestamp: number;
}

export interface UseErrorHandlerReturn {
  error: ErrorState | null;
  hasError: boolean;
  setError: (error: Error | string | null) => void;
  clearError: () => void;
  retryLastAction: () => Promise<void>;
  isRetrying: boolean;
}

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
/**
 * Tests for useErrorHandler hook
 * Requirements: 全般 - エラーハンドリング
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useErrorHandler } from '../useErrorHandler';
import { ApiClientError } from '../../services';

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with no error', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
    expect(result.current.isRetrying).toBe(false);
  });

  it('should set error from string', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError('Test error message');
    });

    expect(result.current.error).toEqual({
      message: 'Test error message',
      type: 'unknown',
      status: undefined,
      retryable: true,
      timestamp: expect.any(Number),
    });
    expect(result.current.hasError).toBe(true);
  });

  it('should set error from Error object', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Test error');

    act(() => {
      result.current.setError(testError);
    });

    expect(result.current.error?.message).toBe('Test error');
    expect(result.current.error?.type).toBe('unknown');
    expect(result.current.hasError).toBe(true);
  });

  it('should categorize ApiClientError with validation status', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError = new ApiClientError('Validation failed', 400);

    act(() => {
      result.current.setError(apiError);
    });

    expect(result.current.error).toEqual({
      message: 'Validation failed',
      type: 'validation',
      status: 400,
      retryable: false,
      timestamp: expect.any(Number),
    });
  });

  it('should categorize ApiClientError with server error status', () => {
    const { result } = renderHook(() => useErrorHandler());
    const apiError = new ApiClientError('Internal server error', 500);

    act(() => {
      result.current.setError(apiError);
    });

    expect(result.current.error).toEqual({
      message: 'Internal server error',
      type: 'server',
      status: 500,
      retryable: true,
      timestamp: expect.any(Number),
    });
  });

  it('should categorize network errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    const networkError = new TypeError('fetch failed');

    act(() => {
      result.current.setError(networkError);
    });

    expect(result.current.error?.type).toBe('network');
    expect(result.current.error?.retryable).toBe(true);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.hasError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  it('should handle retry action', async () => {
    const mockRetryAction = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useErrorHandler(mockRetryAction));

    // Set a retryable error
    act(() => {
      result.current.setError(new ApiClientError('Server error', 500));
    });

    expect(result.current.error?.retryable).toBe(true);

    // Retry the action
    await act(async () => {
      await result.current.retryLastAction();
    });

    expect(mockRetryAction).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it('should not retry non-retryable errors', async () => {
    const mockRetryAction = vi.fn();
    const { result } = renderHook(() => useErrorHandler(mockRetryAction));

    // Set a non-retryable error
    act(() => {
      result.current.setError(new ApiClientError('Validation error', 400));
    });

    expect(result.current.error?.retryable).toBe(false);

    await act(async () => {
      await result.current.retryLastAction();
    });

    expect(mockRetryAction).not.toHaveBeenCalled();
  });

  it('should handle retry failure', async () => {
    const mockRetryAction = vi.fn().mockRejectedValue(new Error('Retry failed'));
    const { result } = renderHook(() => useErrorHandler(mockRetryAction));

    // Set a retryable error
    act(() => {
      result.current.setError(new ApiClientError('Server error', 500));
    });

    await act(async () => {
      await result.current.retryLastAction();
    });

    expect(mockRetryAction).toHaveBeenCalledTimes(1);
    expect(result.current.error?.message).toBe('Retry failed');
  });

  it('should set isRetrying during retry operation', async () => {
    let resolveRetry: () => void;
    const retryPromise = new Promise<void>((resolve) => {
      resolveRetry = resolve;
    });
    const mockRetryAction = vi.fn().mockReturnValue(retryPromise);
    
    const { result } = renderHook(() => useErrorHandler(mockRetryAction));

    // Set a retryable error
    act(() => {
      result.current.setError(new ApiClientError('Server error', 500));
    });

    // Start retry - don't await immediately to check isRetrying state
    let retryPromiseResult: Promise<void>;
    act(() => {
      retryPromiseResult = result.current.retryLastAction();
    });

    // Check that isRetrying is true during operation
    expect(result.current.isRetrying).toBe(true);

    // Resolve the retry
    act(() => {
      resolveRetry();
    });

    // Now await the completion
    await act(async () => {
      await retryPromiseResult!;
    });

    expect(result.current.isRetrying).toBe(false);
  });
});
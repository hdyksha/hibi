/**
 * Tests for useNetworkStatus hook
 * Requirements: 全般 - ネットワークエラー処理
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNetworkStatus } from '../useNetworkStatus';

// Mock fetch
const mockFetch = vi.fn();
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useNetworkStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    
    // Reset navigator.onLine to true
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Set up default mock for initial connection check
    mockFetch.mockResolvedValue({
      ok: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with online status', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSlowConnection).toBe(false);
    // In test environment, initial connection check is skipped
    // so lastOnlineAt remains null
    expect(result.current.lastOnlineAt).toBeNull();
    expect(result.current.connectionType).toBeNull();

    // Manually trigger connection check in test
    await act(async () => {
      await result.current.checkConnection();
    });

    // After successful connection check, lastOnlineAt should be set
    expect(result.current.lastOnlineAt).toBeTypeOf('number');
  });

  it('should detect offline status', async () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Wait for initial effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.lastOnlineAt).toBeNull();
  });

  it('should check connection successfully', async () => {
    // Set up mock before rendering
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Wait for initial effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let connectionResult: boolean;
    await act(async () => {
      connectionResult = await result.current.checkConnection();
    });

    expect(connectionResult!).toBe(true);
    expect(result.current.isOnline).toBe(true);
  });

  it('should detect slow connection', async () => {
    // Mock a slow response (delay the promise resolution)
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ ok: true }), 3500)
      )
    );

    const { result } = renderHook(() => useNetworkStatus());

    // Wait for initial effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.checkConnection();
    });

    expect(result.current.isSlowConnection).toBe(true);
  });

  it('should handle connection check failure', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    // Wait for initial effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Set up mock to fail for the manual check
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    let connectionResult: boolean;
    await act(async () => {
      connectionResult = await result.current.checkConnection();
    });

    expect(connectionResult!).toBe(false);
    // The hook should update isOnline to false when connection check fails
    expect(result.current.isOnline).toBe(false);
  });

  it('should handle online event', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    // Mock successful connection check for online event
    mockFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      // Simulate online event
      window.dispatchEvent(new Event('online'));
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.lastOnlineAt).toBeTypeOf('number');
  });

  it('should handle offline event', async () => {
    const { result } = renderHook(() => useNetworkStatus());

    // Wait for initial effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      // Simulate offline event
      window.dispatchEvent(new Event('offline'));
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isSlowConnection).toBe(false);
  });

  it('should return false for checkConnection when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Wait for initial effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    let connectionResult: boolean;
    await act(async () => {
      connectionResult = await result.current.checkConnection();
    });

    expect(connectionResult!).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
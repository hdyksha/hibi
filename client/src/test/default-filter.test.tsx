/**
 * Default Filter Behavior Tests
 * Tests the default display showing only pending tasks
 * Requirements: 2.1, 2.2, Usability improvement
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App';

// Mock fetch to simulate server responses
const mockFetch = vi.fn();
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Default Filter Behavior Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockReset();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    // Mock console.warn to suppress localStorage error messages in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it('should default to showing only pending tasks on first load', async () => {
    // Mock localStorage to return null (first time user)
    mockLocalStorage.getItem.mockReturnValue(null);

    // Mock API response with mixed completed and pending tasks
    const mixedTodos = [
      {
        id: '1',
        title: 'Pending Task 1',
        completed: false,
        priority: 'medium',
        tags: [],
        memo: '',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        completedAt: null,
      },
      {
        id: '2',
        title: 'Completed Task 1',
        completed: true,
        priority: 'medium',
        tags: [],
        memo: '',
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-01T11:00:00Z',
        completedAt: '2024-01-01T11:00:00Z',
      },
      {
        id: '3',
        title: 'Pending Task 2',
        completed: false,
        priority: 'high',
        tags: [],
        memo: '',
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
        completedAt: null,
      },
    ];

    // Mock initial todos request with pending filter
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mixedTodos.filter(todo => !todo.completed),
    });

    // Mock initial tags request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await act(async () => {
      render(<App />);
    });

    // Wait for todos to load
    await waitFor(() => {
      expect(screen.getByText('Pending Task 1')).toBeInTheDocument();
      expect(screen.getByText('Pending Task 2')).toBeInTheDocument();
    });

    // Completed task should not be visible
    expect(screen.queryByText('Completed Task 1')).not.toBeInTheDocument();

    // Verify API was called with pending filter
    expect(mockFetch).toHaveBeenCalledWith('/api/todos?status=pending', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Verify localStorage was checked for existing filter
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('todo-app-filter');
  });

  it('should restore filter state from localStorage', async () => {
    // Mock localStorage to return saved filter state
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({ status: 'all', priority: 'high' })
    );

    // Mock API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
    });

    // Verify localStorage was read
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('todo-app-filter');

    // Verify API was called with restored filter
    expect(mockFetch).toHaveBeenCalledWith('/api/todos?status=all&priority=high', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });



  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage to throw error
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    // Mock API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    // Should not throw error and should use default filter
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
    });

    // Should still call API with default pending filter
    expect(mockFetch).toHaveBeenCalledWith('/api/todos?status=pending', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
});
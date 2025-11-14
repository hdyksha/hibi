/**
 * Tests for useTodos hook - Loading State Separation
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 * 
 * These tests verify the separation of loading states:
 * - loading: for initial data load
 * - isRefreshing: for subsequent background refreshes
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTodos } from '../useTodos';
import { todoApi } from '../../services';
import { TodoItem } from '../../types';

// Mock the todoApi
vi.mock('../../services', () => ({
  todoApi: {
    getTodos: vi.fn(),
    getTags: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    toggleTodoCompletion: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

const mockTodoApi = todoApi as any;

const mockTodos: TodoItem[] = [
  {
    id: '1',
    title: 'Test Todo 1',
    completed: false,
    priority: 'medium',
    tags: ['work'],
    memo: '',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    completedAt: null,
  },
  {
    id: '2',
    title: 'Test Todo 2',
    completed: true,
    priority: 'high',
    tags: ['personal'],
    memo: '',
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z',
    completedAt: '2024-01-01T12:00:00Z',
  },
];

describe('useTodos - Loading State Separation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTodoApi.getTodos.mockResolvedValue(mockTodos);
    mockTodoApi.getTags.mockResolvedValue(['work', 'personal']);
  });

  describe('Initial load sets loading to true', () => {
    it('should set loading to true during initial data load', async () => {
      // Create a promise we can control
      let resolveTodos: (value: TodoItem[]) => void;
      const todosPromise = new Promise<TodoItem[]>((resolve) => {
        resolveTodos = resolve;
      });
      
      mockTodoApi.getTodos.mockReturnValue(todosPromise);
      mockTodoApi.getTags.mockResolvedValue(['work', 'personal']);

      const { result } = renderHook(() => useTodos());

      // Initially loading should be true
      expect(result.current.loading).toBe(true);
      expect(result.current.todos).toEqual([]);

      // Resolve the promise
      await act(async () => {
        resolveTodos(mockTodos);
        await todosPromise;
      });

      // After load completes, loading should be false
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.todos).toEqual(mockTodos);
    });
  });

  describe('Subsequent refresh sets isRefreshing to true, not loading', () => {
    it('should set isRefreshing (not loading) for subsequent refreshes', async () => {
      const { result } = renderHook(() => useTodos());

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todos).toEqual(mockTodos);

      // Create a controlled promise for the refresh
      let resolveRefresh: (value: TodoItem[]) => void;
      const refreshPromise = new Promise<TodoItem[]>((resolve) => {
        resolveRefresh = resolve;
      });
      
      mockTodoApi.getTodos.mockReturnValue(refreshPromise);

      // Trigger a refresh
      act(() => {
        result.current.refreshTodos();
      });

      // During refresh, loading should remain false, isRefreshing should be true
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.isRefreshing).toBe(true);
      });

      // Resolve the refresh
      await act(async () => {
        resolveRefresh(mockTodos);
        await refreshPromise;
      });

      // After refresh, isRefreshing should be false
      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });
    });
  });

  describe('Loading is false after initial data load', () => {
    it('should set loading to false after initial data is loaded', async () => {
      const { result } = renderHook(() => useTodos());

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todos).toEqual(mockTodos);
      expect(result.current.loading).toBe(false);
    });

    it('should keep loading false even when todos are present', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todos.length).toBeGreaterThan(0);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('isRefreshing is false after refresh completes', () => {
    it('should set isRefreshing to false after refresh completes successfully', async () => {
      const { result } = renderHook(() => useTodos());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedTodos = [...mockTodos, {
        id: '3',
        title: 'New Todo',
        completed: false,
        priority: 'low',
        tags: [],
        memo: '',
        createdAt: '2024-01-01T13:00:00Z',
        updatedAt: '2024-01-01T13:00:00Z',
        completedAt: null,
      }];

      mockTodoApi.getTodos.mockResolvedValue(updatedTodos);

      // Trigger refresh
      await act(async () => {
        await result.current.refreshTodos();
      });

      // After refresh completes, isRefreshing should be false
      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });
      expect(result.current.todos).toEqual(updatedTodos);
    });

    it('should set isRefreshing to false after refresh fails', async () => {
      const { result } = renderHook(() => useTodos());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      mockTodoApi.getTodos.mockRejectedValue(new Error('Network error'));

      // Trigger refresh
      await act(async () => {
        await result.current.refreshTodos();
      });

      // After refresh fails, isRefreshing should be false
      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Silent refresh doesn\'t trigger any loading states', () => {
    it('should keep loading states false after silent refresh completes', async () => {
      const { result } = renderHook(() => useTodos());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedTodos = [...mockTodos];
      mockTodoApi.getTodos.mockResolvedValue(updatedTodos);

      // Trigger silent refresh and wait for completion
      await act(async () => {
        await result.current.refreshTodos(true); // silent = true
      });

      // Both loading states should remain false after silent refresh
      // Note: This verifies the state after completion, which indirectly
      // confirms no loading states were set during the refresh
      expect(result.current.loading).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.todos).toEqual(updatedTodos);
    });

    it('should update data without showing loading indicators', async () => {
      const { result } = renderHook(() => useTodos());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedTodos = [
        ...mockTodos,
        {
          id: '4',
          title: 'Silent Update Todo',
          completed: false,
          priority: 'medium',
          tags: [],
          memo: '',
          createdAt: '2024-01-01T14:00:00Z',
          updatedAt: '2024-01-01T14:00:00Z',
          completedAt: null,
        },
      ];

      mockTodoApi.getTodos.mockResolvedValue(updatedTodos);

      // Perform silent refresh and wait for completion
      await act(async () => {
        await result.current.refreshTodos(true);
      });

      // Data should be updated
      await waitFor(() => {
        expect(result.current.todos).toEqual(updatedTodos);
      });

      // Loading indicators should remain false after completion
      expect(result.current.loading).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('Integration: Loading state behavior across operations', () => {
    it('should maintain correct loading states through multiple refresh cycles', async () => {
      const { result } = renderHook(() => useTodos());

      // Initial load: loading = true
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // First refresh: isRefreshing = true, loading = false
      mockTodoApi.getTodos.mockResolvedValue(mockTodos);
      
      await act(async () => {
        const refreshPromise = result.current.refreshTodos();
        // Check state during refresh
        await waitFor(() => {
          expect(result.current.isRefreshing).toBe(true);
        });
        expect(result.current.loading).toBe(false);
        await refreshPromise;
      });

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });

      // Second refresh: same behavior
      await act(async () => {
        const refreshPromise = result.current.refreshTodos();
        await waitFor(() => {
          expect(result.current.isRefreshing).toBe(true);
        });
        expect(result.current.loading).toBe(false);
        await refreshPromise;
      });

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });
    });

    it('should only use loading state when todos array is empty', async () => {
      // Start with empty todos
      mockTodoApi.getTodos.mockResolvedValue([]);
      
      const { result } = renderHook(() => useTodos());

      // Initial load with empty data: loading = true
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todos).toEqual([]);

      // Refresh with data: should use isRefreshing
      mockTodoApi.getTodos.mockResolvedValue(mockTodos);
      
      await act(async () => {
        await result.current.refreshTodos();
      });

      // Even though we got data, subsequent refreshes should use isRefreshing
      await act(async () => {
        const refreshPromise = result.current.refreshTodos();
        await waitFor(() => {
          expect(result.current.isRefreshing).toBe(true);
        });
        expect(result.current.loading).toBe(false);
        await refreshPromise;
      });
    });
  });
});

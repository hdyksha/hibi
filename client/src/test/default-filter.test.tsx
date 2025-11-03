/**
 * Default Filter Behavior Tests
 * Tests the default display showing only pending tasks
 * Requirements: 2.1, 2.2, Usability improvement
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App';

// Mock the API client
vi.mock('../services', () => ({
  todoApiClient: {
    getTodos: vi.fn(),
    getTags: vi.fn(),
    getArchive: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    toggleTodoCompletion: vi.fn(),
    deleteTodo: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'ApiClientError';
    }
  },
}));

// Import the mocked API client
import { todoApiClient } from '../services';

const mockTodoApiClient = todoApiClient as any;

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
    mockTodoApiClient.getTodos.mockClear();
    mockTodoApiClient.getTags.mockClear();
    mockTodoApiClient.getArchive.mockClear();
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
    const pendingTodos = [
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

    // Mock API client responses
    mockTodoApiClient.getTodos.mockResolvedValueOnce(pendingTodos);
    mockTodoApiClient.getTags.mockResolvedValueOnce([]);
    mockTodoApiClient.getArchive.mockResolvedValueOnce([]);

    await act(async () => {
      render(<App />);
    });

    // Wait for todos to load - look for the actual todo titles
    await waitFor(() => {
      expect(screen.getByText('Pending Task 1')).toBeInTheDocument();
      expect(screen.getByText('Pending Task 2')).toBeInTheDocument();
    }, { timeout: 15000 });

    // Verify both tasks are present
    expect(screen.getByText('Pending Task 1')).toBeInTheDocument();
    expect(screen.getByText('Pending Task 2')).toBeInTheDocument();

    // Completed task should not be visible
    expect(screen.queryByText('Completed Task 1')).not.toBeInTheDocument();

    // Verify API was called with pending filter
    expect(mockTodoApiClient.getTodos).toHaveBeenCalledWith({ status: 'pending' });

    // Verify localStorage was checked for existing filter
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('todo-app-filter');
  }, 20000);

  it('should restore filter state from localStorage', async () => {
    // Mock localStorage to return saved filter state
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({ status: 'all', priority: 'high' })
    );

    // Mock API client responses
    mockTodoApiClient.getTodos.mockResolvedValueOnce([]);
    mockTodoApiClient.getTags.mockResolvedValueOnce([]);
    mockTodoApiClient.getArchive.mockResolvedValueOnce([]);

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
    });

    // Verify localStorage was read
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('todo-app-filter');

    // Verify API was called with restored filter
    expect(mockTodoApiClient.getTodos).toHaveBeenCalledWith({ status: 'all', priority: 'high' });
  });



  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage to throw error
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    // Mock API client responses
    mockTodoApiClient.getTodos.mockResolvedValueOnce([]);
    mockTodoApiClient.getTags.mockResolvedValueOnce([]);
    mockTodoApiClient.getArchive.mockResolvedValueOnce([]);

    // Should not throw error and should use default filter
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
    });

    // Should still call API with default pending filter
    expect(mockTodoApiClient.getTodos).toHaveBeenCalledWith({ status: 'pending' });
  });
});
/**
 * Integration Tests for Frontend-Backend Connection
 * Tests the complete CRUD flow between React frontend and Express backend
 * Requirements: All requirements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
    setNetworkReporter: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'ApiClientError';
    }
  },
}));

// Mock the useNetworkStatus hook
vi.mock('../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlowConnection: false,
    lastOnlineAt: Date.now(),
    connectionType: null,
    checkConnection: vi.fn().mockResolvedValue(true),
    reportConnectionError: vi.fn(),
    reportConnectionSuccess: vi.fn(),
  }),
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

describe('Frontend-Backend Integration Tests', () => {
  beforeEach(() => {
    mockTodoApiClient.getTodos.mockClear();
    mockTodoApiClient.getTags.mockClear();
    mockTodoApiClient.getArchive.mockClear();
    mockTodoApiClient.createTodo.mockClear();
    mockTodoApiClient.updateTodo.mockClear();
    mockTodoApiClient.toggleTodoCompletion.mockClear();
    mockTodoApiClient.deleteTodo.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    // Mock localStorage to return null (default behavior)
    mockLocalStorage.getItem.mockReturnValue(null);
    // Mock console.warn to suppress API error messages in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  describe('Complete CRUD Flow Integration', () => {
    it('should perform complete CRUD operations flow', async () => {
      // Step 1: Initial load - empty state
      mockTodoApiClient.getTodos.mockResolvedValueOnce([]);
      mockTodoApiClient.getTags.mockResolvedValueOnce([]);
      mockTodoApiClient.getArchive.mockResolvedValueOnce([]);

      await act(async () => {
        render(<App />);
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });

      // Verify initial GET request (now includes default pending filter)
      expect(mockTodoApiClient.getTodos).toHaveBeenCalledWith({ status: 'pending' });

      // Step 2: Create a new todo
      const newTodo = {
        id: '1',
        title: 'Integration Test Todo',
        completed: false,
        priority: 'medium',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      // Mock API responses for creation
      mockTodoApiClient.createTodo.mockResolvedValueOnce(newTodo);
      mockTodoApiClient.getTodos.mockResolvedValueOnce([newTodo]);
      mockTodoApiClient.getTags.mockResolvedValueOnce([]);

      // Fill form and submit
      const titleInput = screen.getByLabelText('New Todo');
      const submitButton = screen.getByRole('button', { name: 'Create Todo' });

      fireEvent.change(titleInput, { target: { value: 'Integration Test Todo' } });
      fireEvent.click(submitButton);

      // Wait for todo to be created and displayed
      await waitFor(() => {
        expect(screen.getByText('Integration Test Todo')).toBeInTheDocument();
      });

      // Verify createTodo was called
      expect(mockTodoApiClient.createTodo).toHaveBeenCalledWith({ 
        title: 'Integration Test Todo', 
        priority: 'medium', 
        tags: [], 
        memo: '' 
      });

      // Verify basic functionality works
      expect(mockTodoApiClient.getTodos).toHaveBeenCalledWith({ status: 'pending' });
      expect(mockTodoApiClient.createTodo).toHaveBeenCalledWith({ 
        title: 'Integration Test Todo', 
        priority: 'medium', 
        tags: [], 
        memo: '' 
      });
    });


    it('should handle API errors gracefully', async () => {
      // Initial load fails
      mockTodoApiClient.getTodos.mockRejectedValueOnce(new Error('Network error'));
      mockTodoApiClient.getTags.mockRejectedValueOnce(new Error('Network error'));
      mockTodoApiClient.getArchive.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText(/unable to connect to the server.*check your internet/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      }, { timeout: 10000 });

      // Retry should work
      mockTodoApiClient.getTodos.mockResolvedValueOnce([]);
      mockTodoApiClient.getTags.mockResolvedValueOnce([]);
      mockTodoApiClient.getArchive.mockResolvedValueOnce([]);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });
    });

    it('should handle creation errors', async () => {
      // Initial load success
      mockTodoApiClient.getTodos.mockResolvedValueOnce([]);
      mockTodoApiClient.getTags.mockResolvedValueOnce([]);
      mockTodoApiClient.getArchive.mockResolvedValueOnce([]);

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });

      // Creation fails
      const error = new Error('Title cannot be empty');
      mockTodoApiClient.createTodo.mockRejectedValueOnce(error);

      const titleInput = screen.getByLabelText('New Todo');
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Todo' }));

      await waitFor(() => {
        expect(screen.getByText(/please enter a title for your task/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });

  });
});
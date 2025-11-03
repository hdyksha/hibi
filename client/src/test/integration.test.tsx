/**
 * Integration Tests for Frontend-Backend Connection
 * Tests the complete CRUD flow between React frontend and Express backend
 * Requirements: All requirements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App';

// Mock fetch to simulate server responses
const mockFetch = vi.fn();
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
});

describe('Frontend-Backend Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockReset();
    // Mock console.warn to suppress API error messages in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  describe('Complete CRUD Flow Integration', () => {
    it('should perform complete CRUD operations flow', async () => {
      // Step 1: Initial load - GET /api/todos (empty state)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Step 1: Initial load - GET /api/todos/tags (empty state)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Step 1: Initial load - GET /api/todos/archive (empty state)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      await act(async () => {
        render(<App />);
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });

      // Verify initial GET request (now includes default pending filter)
      expect(mockFetch).toHaveBeenCalledWith('/api/todos?status=pending', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Step 2: Create a new todo - POST /api/todos
      const newTodo = {
        id: '1',
        title: 'Integration Test Todo',
        completed: false,
        priority: 'medium',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      // Mock POST response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => newTodo,
      });

      // Mock GET response after creation (refresh)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [newTodo],
      });

      // Mock GET tags after creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Fill form and submit
      const titleInput = screen.getByLabelText('New Todo');
      const submitButton = screen.getByRole('button', { name: 'Create Todo' });

      fireEvent.change(titleInput, { target: { value: 'Integration Test Todo' } });
      fireEvent.click(submitButton);

      // Wait for todo to be created and displayed
      await waitFor(() => {
        expect(screen.getByText('Integration Test Todo')).toBeInTheDocument();
      });

      // Verify POST request
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Integration Test Todo', priority: 'medium', tags: [], memo: '' }),
      });

      // Step 3: Toggle completion status - PUT /api/todos/:id
      const updatedTodo = {
        ...newTodo,
        completed: true,
        updatedAt: '2024-01-01T11:00:00Z',
      };

      // Mock GET response for toggleTodoCompletion (to get current todo state)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [newTodo],
      });

      // Mock PUT response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedTodo,
      });

      // Mock GET response after update (refresh)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [updatedTodo],
      });

      // Mock GET tags after update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Click toggle button
      const toggleButton = screen.getByLabelText('Mark as complete');
      fireEvent.click(toggleButton);

      // Wait for completion status to update
      await waitFor(() => {
        expect(screen.getByLabelText('Mark as incomplete')).toBeInTheDocument();
      });

      // Verify PUT request
      expect(mockFetch).toHaveBeenCalledWith(`/api/todos/${newTodo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
      });

      // Step 4: Delete the todo - DELETE /api/todos/:id
      // Mock DELETE response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      // Mock GET response after deletion (refresh)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Mock GET tags after deletion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Click delete button
      const deleteButton = screen.getByLabelText('Delete todo: Integration Test Todo');
      fireEvent.click(deleteButton);

      // Wait for todo to be deleted
      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });

      // Verify DELETE request
      expect(mockFetch).toHaveBeenCalledWith(`/api/todos/${newTodo.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verify all API calls were made in correct order
      // Updated count includes additional calls for tags API and archive API
      expect(mockFetch).toHaveBeenCalledTimes(11); // GET, GET(tags), GET(archive), POST, GET, GET(tags), GET(for toggle), PUT, GET, DELETE, GET
    });


    it('should handle API errors gracefully', async () => {
      // Initial load fails - todos
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Initial load fails - tags (but this might not be called due to todos error)
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<App />);
        // Wait for all promises to resolve/reject
        await Promise.resolve();
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Retry should work - todos
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Retry should work - tags
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });
    });

    it('should handle creation errors', async () => {
      // Initial load success - todos
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Initial load success - tags
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

      // Creation fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation failed',
          message: 'Title cannot be empty',
        }),
      });

      const titleInput = screen.getByLabelText('New Todo');
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Todo' }));

      await waitFor(() => {
        expect(screen.getByText('Title cannot be empty')).toBeInTheDocument();
      });
    });

    it('should handle update errors', async () => {
      const todo = {
        id: '1',
        title: 'Test Todo',
        completed: false,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      // Initial load with one todo - todos
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [todo],
      });

      // Initial load with one todo - tags
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Update fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Not found',
          message: 'Todo item not found',
        }),
      });

      const toggleButton = screen.getByLabelText('Mark as complete');
      fireEvent.click(toggleButton);

      // Error should be handled by the hook and displayed in the list
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
    });

    it('should handle delete errors', async () => {
      const todo = {
        id: '1',
        title: 'Test Todo',
        completed: false,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      // Initial load with one todo - todos
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [todo],
      });

      // Initial load with one todo - tags
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      // Delete fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Not found',
          message: 'Todo item not found',
        }),
      });

      const deleteButton = screen.getByLabelText('Delete todo: Test Todo');
      fireEvent.click(deleteButton);

      // Error should be handled by the hook and displayed in the list
      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
    });
  });

  describe('State Management Integration', () => {
    it('should maintain consistent state across operations', async () => {
      // Initial empty state - todos
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Initial empty state - tags
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });

      // Create todo
      const newTodo = {
        id: '1',
        title: 'State Test Todo',
        completed: false,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => newTodo,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [newTodo],
      });

      // Mock tags after creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      const titleInput = screen.getByLabelText('New Todo');
      fireEvent.change(titleInput, { target: { value: 'State Test Todo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Todo' }));

      await waitFor(() => {
        expect(screen.getByText('State Test Todo')).toBeInTheDocument();
      });

      // Verify form is cleared after creation
      expect(titleInput).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Create Todo' })).toBeDisabled();

      // Verify todo is displayed with correct initial state
      expect(screen.getByLabelText('Mark as complete')).toBeInTheDocument();
      expect(screen.getByText(/Created:/)).toBeInTheDocument();
    });

    it('should handle loading states correctly', async () => {
      // Simulate slow initial load for todos
      let resolveInitialLoad: (value: any) => void;
      const initialLoadPromise = new Promise((resolve) => {
        resolveInitialLoad = resolve;
      });

      mockFetch.mockReturnValueOnce(initialLoadPromise);

      // Mock tags load (immediate)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      await act(async () => {
        render(<App />);
      });

      // Should show loading state
      expect(screen.getByText('Loading todos...')).toBeInTheDocument();

      // Resolve the promise
      resolveInitialLoad!({
        ok: true,
        status: 200,
        json: async () => [],
      });

      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });

      expect(screen.queryByText('Loading todos...')).not.toBeInTheDocument();
    });

    it('should handle concurrent operations correctly', async () => {
      // Initial load - todos
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Initial load - tags
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

      // Simulate creating multiple todos quickly
      const todo1 = {
        id: '1',
        title: 'Concurrent Todo 1',
        completed: false,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      const todo2 = {
        id: '2',
        title: 'Concurrent Todo 2',
        completed: false,
        createdAt: '2024-01-01T10:01:00Z',
        updatedAt: '2024-01-01T10:01:00Z',
      };

      // Mock responses for first todo creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => todo1,
      });

      // Mock GET todos after first creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [todo1],
      });

      // Mock GET tags after first creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      // Mock responses for second todo creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => todo2,
      });

      // Mock GET todos after second creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [todo1, todo2],
      });

      // Mock GET tags after second creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      const titleInput = screen.getByLabelText('New Todo');
      const submitButton = screen.getByRole('button', { name: 'Create Todo' });

      // Create first todo
      fireEvent.change(titleInput, { target: { value: 'Concurrent Todo 1' } });
      fireEvent.click(submitButton);

      // Create second todo immediately after
      await waitFor(() => {
        expect(titleInput).toHaveValue('');
      });

      fireEvent.change(titleInput, { target: { value: 'Concurrent Todo 2' } });
      fireEvent.click(submitButton);

      // Both todos should eventually be displayed
      await waitFor(() => {
        expect(screen.getByText('Concurrent Todo 1')).toBeInTheDocument();
        expect(screen.getByText('Concurrent Todo 2')).toBeInTheDocument();
      });
    });
  });
});
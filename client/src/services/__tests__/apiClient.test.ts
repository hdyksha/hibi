/**
 * Unit tests for TodoApiClient
 * Requirements: 全般
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TodoApiClient, ApiClientError } from '../apiClient';
import { TodoItem, CreateTodoItemInput } from '../../types';

// Mock fetch globally
const mockFetch = vi.fn();
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
});

describe('TodoApiClient', () => {
  let apiClient: TodoApiClient;
  const baseUrl = 'http://localhost:3000/api';

  beforeEach(() => {
    apiClient = new TodoApiClient(baseUrl);
    mockFetch.mockClear();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getTodos', () => {
    it('should fetch all todos successfully', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: 'Test Todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTodos,
      });

      const result = await apiClient.getTodos();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/todos`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockTodos);
    });

    it('should handle API error response', async () => {
      const mockError = {
        error: 'Internal server error',
        message: 'Failed to retrieve todo items',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockError,
      });

      try {
        await apiClient.getTodos();
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).message).toBe('Failed to retrieve todo items');
      }
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      try {
        await apiClient.getTodos();
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).message).toBe('Network error: Unable to connect to server');
      }
    });
  });

  describe('createTodo', () => {
    it('should create a new todo successfully', async () => {
      const input: CreateTodoItemInput = { title: 'New Todo' };
      const mockCreatedTodo: TodoItem = {
        id: '1',
        title: 'New Todo',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockCreatedTodo,
      });

      const result = await apiClient.createTodo(input);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      expect(result).toEqual(mockCreatedTodo);
    });

    it('should handle validation error', async () => {
      const input: CreateTodoItemInput = { title: '' };
      const mockError = {
        error: 'Validation failed',
        message: 'Title cannot be empty',
        details: [{ field: 'title', message: 'Title cannot be empty' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      await expect(apiClient.createTodo(input)).rejects.toThrow(ApiClientError);
    });
  });

  describe('updateTodo', () => {
    it('should update a todo successfully', async () => {
      const id = '1';
      const input = { completed: true };
      const mockUpdatedTodo: TodoItem = {
        id: '1',
        title: 'Test Todo',
        completed: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T01:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUpdatedTodo,
      });

      const result = await apiClient.updateTodo(id, input);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      expect(result).toEqual(mockUpdatedTodo);
    });

    it('should handle todo not found error', async () => {
      const id = 'nonexistent';
      const input = { completed: true };
      const mockError = {
        error: 'Not found',
        message: 'Todo item not found',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockError,
      });

      await expect(apiClient.updateTodo(id, input)).rejects.toThrow(ApiClientError);
    });
  });

  describe('toggleTodoCompletion', () => {
    it('should toggle completion status successfully', async () => {
      const id = '1';
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: 'Test Todo',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ];
      const mockUpdatedTodo: TodoItem = {
        ...mockTodos[0],
        completed: true,
        updatedAt: '2023-01-01T01:00:00.000Z',
      };

      // Mock getTodos call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTodos,
      });

      // Mock update call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUpdatedTodo,
      });

      const result = await apiClient.toggleTodoCompletion(id);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUpdatedTodo);
    });

    it('should handle todo not found in toggle', async () => {
      const id = 'nonexistent';
      const mockTodos: TodoItem[] = [];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTodos,
      });

      try {
        await apiClient.toggleTodoCompletion(id);
        expect.fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).message).toBe('Todo item not found');
      }
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo successfully', async () => {
      const id = '1';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}), // 204 responses typically have no body
      });

      const result = await apiClient.deleteTodo(id);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toBeUndefined();
    });

    it('should handle delete todo not found error', async () => {
      const id = 'nonexistent';
      const mockError = {
        error: 'Not found',
        message: 'Todo item not found',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockError,
      });

      await expect(apiClient.deleteTodo(id)).rejects.toThrow(ApiClientError);
    });
  });

  describe('ApiClientError', () => {
    it('should create error with all properties', () => {
      const apiError = {
        error: 'Validation failed',
        message: 'Invalid input',
        details: [{ field: 'title', message: 'Title is required' }],
      };

      const error = new ApiClientError('Test error', 400, apiError);

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.apiError).toEqual(apiError);
      expect(error.name).toBe('ApiClientError');
    });
  });
});
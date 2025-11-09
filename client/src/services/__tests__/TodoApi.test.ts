/**
 * TodoApi Tests
 * Basic tests for TodoApi class
 * Requirements: 9.1, 9.2, 9.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TodoApi } from '../api/TodoApi';
import { HttpClient } from '../http/HttpClient';
import { TodoItem, CreateTodoItemInput, UpdateTodoItemInput } from '../../types';

describe('TodoApi', () => {
  let todoApi: TodoApi;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    // Create a mock HttpClient
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    todoApi = new TodoApi(mockHttpClient);
  });

  describe('getTodos', () => {
    it('should call HttpClient.get with correct endpoint', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: '1',
          title: 'Test Todo',
          completed: false,
          priority: 'medium',
          tags: [],
          memo: '',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          completedAt: null,
        },
      ];

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockTodos);

      const result = await todoApi.getTodos();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/todos');
      expect(result).toEqual(mockTodos);
    });

    it('should build query string when filter is provided', async () => {
      const mockTodos: TodoItem[] = [];
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockTodos);

      await todoApi.getTodos({
        status: 'active',
        priority: 'high',
        tags: ['work', 'urgent'],
        searchText: 'test',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/todos?status=active&priority=high&tags=work&tags=urgent&search=test'
      );
    });
  });

  describe('createTodo', () => {
    it('should call HttpClient.post with correct endpoint and data', async () => {
      const input: CreateTodoItemInput = {
        title: 'New Todo',
        priority: 'medium',
        tags: [],
        memo: '',
      };

      const mockTodo: TodoItem = {
        id: '1',
        ...input,
        completed: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockTodo);

      const result = await todoApi.createTodo(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/todos', input);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('updateTodo', () => {
    it('should call HttpClient.put with correct endpoint and data', async () => {
      const id = '1';
      const input: UpdateTodoItemInput = {
        title: 'Updated Todo',
      };

      const mockTodo: TodoItem = {
        id,
        title: 'Updated Todo',
        completed: false,
        priority: 'medium',
        tags: [],
        memo: '',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        completedAt: null,
      };

      vi.mocked(mockHttpClient.put).mockResolvedValue(mockTodo);

      const result = await todoApi.updateTodo(id, input);

      expect(mockHttpClient.put).toHaveBeenCalledWith(`/todos/${id}`, input);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('deleteTodo', () => {
    it('should call HttpClient.delete with correct endpoint', async () => {
      const id = '1';
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await todoApi.deleteTodo(id);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(`/todos/${id}`);
    });
  });

  describe('getTags', () => {
    it('should call HttpClient.get with correct endpoint', async () => {
      const mockTags = ['work', 'personal', 'urgent'];
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockTags);

      const result = await todoApi.getTags();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/todos/tags');
      expect(result).toEqual(mockTags);
    });
  });

  describe('getArchive', () => {
    it('should call HttpClient.get with correct endpoint', async () => {
      const mockArchive = [
        {
          date: '2024-01-01',
          todos: [],
        },
      ];
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockArchive);

      const result = await todoApi.getArchive();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/todos/archive');
      expect(result).toEqual(mockArchive);
    });
  });
});

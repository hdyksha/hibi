/**
 * Todo API Client
 * Handles all Todo-related API calls
 * Requirements: 1.1, 2.1, 2.2, 5.2
 */

import { HttpClient, ApiClientError } from '../http/HttpClient';
import {
  TodoItem,
  CreateTodoItemInput,
  UpdateTodoItemInput,
  TodoFilter,
  ArchiveGroup
} from '../../types';

/**
 * TodoApi class for Todo-related API operations
 * Uses HttpClient for making HTTP requests
 */
export class TodoApi {
  constructor(private http: HttpClient) {}

  /**
   * Get all todo items with optional filtering
   * GET /api/todos
   * Requirements: 2.1, 2.2, 7.2, 8.4
   */
  async getTodos(filter?: TodoFilter): Promise<TodoItem[]> {
    let endpoint = '/todos';

    if (filter && Object.keys(filter).length > 0) {
      const params = new URLSearchParams();

      if (filter.status) {
        params.append('status', filter.status);
      }

      if (filter.priority) {
        params.append('priority', filter.priority);
      }

      if (filter.tags && filter.tags.length > 0) {
        filter.tags.forEach(tag => params.append('tags', tag));
      }

      if (filter.searchText && filter.searchText.trim()) {
        params.append('search', filter.searchText.trim());
      }

      endpoint += `?${params.toString()}`;
    }

    return this.http.get<TodoItem[]>(endpoint);
  }

  /**
   * Create a new todo item
   * POST /api/todos
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
   */
  async createTodo(input: CreateTodoItemInput): Promise<TodoItem> {
    return this.http.post<TodoItem>('/todos', input);
  }

  /**
   * Update a todo item
   * PUT /api/todos/:id
   * Requirements: 3.1, 3.2, 3.3
   */
  async updateTodo(id: string, input: UpdateTodoItemInput): Promise<TodoItem> {
    return this.http.put<TodoItem>(`/todos/${id}`, input);
  }

  /**
   * Toggle completion status of a todo item
   * PUT /api/todos/:id
   * Requirements: 3.1, 3.2, 3.3
   */
  async toggleTodoCompletion(id: string): Promise<TodoItem> {
    try {
      // First get the current todo to know its current completion status
      const todos = await this.getTodos();

      // Ensure todos is an array
      if (!Array.isArray(todos)) {
        throw new ApiClientError('Invalid response format from server');
      }

      const currentTodo = todos.find(todo => todo.id === id);

      if (!currentTodo) {
        throw new ApiClientError('Todo item not found', 404);
      }

      // Use updateTodo to toggle completion status
      return this.updateTodo(id, { completed: !currentTodo.completed });
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError(
        error instanceof Error ? error.message : 'Failed to toggle todo completion'
      );
    }
  }

  /**
   * Delete a todo item
   * DELETE /api/todos/:id
   * Requirements: 4.1, 4.2, 4.3
   */
  async deleteTodo(id: string): Promise<void> {
    return this.http.delete<void>(`/todos/${id}`);
  }

  /**
   * Get all unique tags used in todo items
   * GET /api/todos/tags
   * Requirements: 7.3, 7.4
   */
  async getTags(): Promise<string[]> {
    return this.http.get<string[]>('/todos/tags');
  }

  /**
   * Get completed todo items grouped by completion date
   * GET /api/todos/archive
   * Requirements: 9.1, 9.2, 9.3, 9.5
   */
  async getArchive(): Promise<ArchiveGroup[]> {
    return this.http.get<ArchiveGroup[]>('/todos/archive');
  }
}

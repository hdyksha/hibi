/**
 * API Client for Todo App
 * Provides HTTP client functionality with error handling
 * Requirements: 全般
 */

import { TodoItem, CreateTodoItemInput, UpdateTodoItemInput, ApiError, TodoFilter } from '../types';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public apiError?: ApiError
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class TodoApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic HTTP request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, requestOptions);

      if (!response) {
        throw new ApiClientError('Network error: No response received');
      }

      // Handle different response statuses
      if (response.status === 204) {
        // No content response (successful deletion)
        return undefined as T;
      }

      const responseData = await response.json();

      if (!response.ok) {
        // API returned an error response
        const apiError: ApiError = responseData;
        throw new ApiClientError(
          apiError.message || 'API request failed',
          response.status,
          apiError
        );
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Network or other errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiClientError('Network error: Unable to connect to server');
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

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
    
    return this.request<TodoItem[]>(endpoint);
  }

  /**
   * Create a new todo item
   * POST /api/todos
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
   */
  async createTodo(input: CreateTodoItemInput): Promise<TodoItem> {
    return this.request<TodoItem>('/todos', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /**
   * Update a todo item (toggle completion status)
   * PUT /api/todos/:id
   * Requirements: 3.1, 3.2, 3.3
   */
  async updateTodo(id: string, input: UpdateTodoItemInput): Promise<TodoItem> {
    return this.request<TodoItem>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
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
    return this.request<void>(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all unique tags used in todo items
   * GET /api/todos/tags
   * Requirements: 7.3, 7.4
   */
  async getTags(): Promise<string[]> {
    return this.request<string[]>('/todos/tags');
  }
}

// Default instance for easy importing
export const todoApiClient = new TodoApiClient();
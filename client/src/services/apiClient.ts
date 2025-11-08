/**
 * API Client for Todo App
 * Provides HTTP client functionality with error handling
 * Requirements: 全般
 */

import { TodoItem, CreateTodoItemInput, UpdateTodoItemInput, ApiError, TodoFilter, ArchiveGroup, FileInfo, CurrentFileInfo, SwitchFileResponse } from '../types';

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
  private networkReporter?: {
    reportConnectionError: () => void;
    reportConnectionSuccess: () => void;
  };

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Allow setting network reporter for status updates
  setNetworkReporter(reporter: { reportConnectionError: () => void; reportConnectionSuccess: () => void }) {
    this.networkReporter = reporter;
  }

  /**
   * Check if status code indicates a network/connection error
   */
  private isNetworkError(status: number): boolean {
    return status >= 500; // 500, 502, 503, 504, etc.
  }

  /**
   * Check if error is a network-related error
   */
  private isNetworkException(error: unknown): boolean {
    if (error instanceof TypeError) {
      return error.message.includes('fetch') || error.message.includes('Failed to fetch');
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('network') ||
        message.includes('connection') ||
        message.includes('err_network') ||
        message.includes('err_internet_disconnected');
    }

    return false;
  }

  /**
   * Parse response body safely
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    try {
      return await response.json();
    } catch {
      // If JSON parsing fails, it might be a proxy error or plain text
      const text = await response.text();
      throw new ApiClientError(
        text || `Server returned ${response.status} ${response.statusText}`,
        response.status
      );
    }
  }

  /**
   * Generic HTTP request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, requestOptions);

      // Check for network errors first
      if (this.isNetworkError(response.status)) {
        this.networkReporter?.reportConnectionError();
        throw new ApiClientError('Network error: Unable to connect to server', response.status);
      }

      // Parse response
      const data = await this.parseResponse<T>(response);

      // Handle API errors (4xx)
      if (!response.ok) {
        const apiError = data as ApiError;
        throw new ApiClientError(
          apiError?.message || `Request failed: ${response.status} ${response.statusText}`,
          response.status,
          apiError
        );
      }

      // Success
      this.networkReporter?.reportConnectionSuccess();
      return data;

    } catch (error) {
      // Re-throw ApiClientError as-is
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Handle network exceptions
      if (this.isNetworkException(error)) {
        this.networkReporter?.reportConnectionError();
        throw new ApiClientError('Network error: Unable to connect to server');
      }

      // Unknown error
      this.networkReporter?.reportConnectionError();
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

  /**
   * Get completed todo items grouped by completion date
   * GET /api/todos/archive
   * Requirements: 9.1, 9.2, 9.3, 9.5
   */
  async getArchive(): Promise<ArchiveGroup[]> {
    return this.request<ArchiveGroup[]>('/todos/archive');
  }

  /**
   * Get list of available JSON files
   * GET /api/files
   * Requirements: 指定ディレクトリ内のJSONファイル一覧表示
   */
  async getFiles(): Promise<FileInfo> {
    return this.request<FileInfo>('/files');
  }

  /**
   * Switch to a different data file
   * POST /api/files/switch
   * Requirements: 選択されたファイルからのデータ読み込み機能、複数ファイル間でのデータ切り替え機能
   */
  async switchFile(fileName: string): Promise<SwitchFileResponse> {
    return this.request<SwitchFileResponse>('/files/switch', {
      method: 'POST',
      body: JSON.stringify({ fileName }),
    });
  }

  /**
   * Get information about the current data file
   * GET /api/files/current
   * Requirements: ファイル読み込みディレクトリのパス設定機能
   */
  async getCurrentFile(): Promise<CurrentFileInfo> {
    return this.request<CurrentFileInfo>('/files/current');
  }
}

// Default instance for easy importing
export const todoApiClient = new TodoApiClient();
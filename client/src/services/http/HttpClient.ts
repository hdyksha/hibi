/**
 * Common HTTP Client
 * Provides unified HTTP request handling with error handling
 * Requirements: 1.1, 6.1, 6.2, 6.3
 */

import { ApiError } from '../../types';

/**
 * Custom error class for API client errors
 */
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

/**
 * Network reporter interface for connection status updates
 */
export interface NetworkReporter {
  reportConnectionError: () => void;
  reportConnectionSuccess: () => void;
}

/**
 * HTTP Client configuration options
 */
export interface HttpClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  networkReporter?: NetworkReporter;
}

/**
 * Common HTTP Client for making API requests
 * Provides unified error handling and network status reporting
 */
export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private networkReporter?: NetworkReporter;

  constructor(config: HttpClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.networkReporter = config.networkReporter;
  }

  /**
   * Set network reporter for connection status updates
   */
  setNetworkReporter(reporter: NetworkReporter): void {
    this.networkReporter = reporter;
  }

  /**
   * Check if status code indicates a network/connection error
   */
  private isNetworkError(status: number): boolean {
    return status >= 500; // 500, 502, 503, 504, etc.
  }

  /**
   * Check if error is a network-related exception
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
   * Generic HTTP request method with unified error handling
   * 
   * @param endpoint - API endpoint (relative to baseUrl)
   * @param options - Fetch API options
   * @returns Promise with response data
   * @throws ApiClientError on request failure
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      headers: {
        ...this.defaultHeaders,
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
   * Convenience method for GET requests
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Convenience method for POST requests
   */
  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Convenience method for PUT requests
   */
  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

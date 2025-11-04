/**
 * Test Helper Utilities
 * Provides utilities for integrating mock strategy with existing tests
 * Requirements: 1.2, 5.1, 5.2
 */

import { vi } from 'vitest';
import { 
  testMockStrategy, 
  mockErrorFactory, 
  createMockApiClient,
  type ErrorScenario 
} from './mockStrategy';
import { ApiClientError } from '../services';

/**
 * Enhanced mock setup for API client with error scenarios
 */
export const setupMockApiClient = () => {
  const mockClient = createMockApiClient();
  
  // Add convenience methods for common test patterns
  return {
    ...mockClient,
    
    /**
     * Setup network error that will be retryable
     */
    simulateNetworkError: (method: keyof typeof mockClient = 'getTodos') => {
      const networkError = new ApiClientError('Network error: Unable to connect to server');
      (mockClient[method] as any).mockRejectedValue(networkError);
    },
    
    /**
     * Setup server error (5xx) that will be retryable
     */
    simulateServerError: (method: keyof typeof mockClient = 'getTodos', statusCode: number = 500) => {
      const serverError = new ApiClientError(`Server error: ${statusCode}`, statusCode);
      (mockClient[method] as any).mockRejectedValue(serverError);
    },
    
    /**
     * Setup client error (4xx) that will not be retryable
     */
    simulateClientError: (method: keyof typeof mockClient = 'getTodos', statusCode: number = 404) => {
      const clientError = new ApiClientError(`Client error: ${statusCode}`, statusCode);
      (mockClient[method] as any).mockRejectedValue(clientError);
    },
    
    /**
     * Setup validation error that will not be retryable
     */
    simulateValidationError: (method: keyof typeof mockClient = 'createTodo', field: string = 'title') => {
      const validationError = new ApiClientError(
        `Validation failed for field: ${field}`,
        400,
        { message: `${field} is required`, field, code: 'VALIDATION_ERROR' }
      );
      (mockClient[method] as any).mockRejectedValue(validationError);
    },
    
    /**
     * Setup intermittent failures for testing retry logic
     */
    simulateIntermittentFailures: (method: keyof typeof mockClient = 'getTodos', failureRate: number = 0.5) => {
      const intermittentMock = mockErrorFactory.createIntermittentFailureMock(failureRate);
      (mockClient[method] as any).mockImplementation(intermittentMock);
    },
    
    /**
     * Setup success after specific number of retries
     */
    simulateSuccessAfterRetries: (
      method: keyof typeof mockClient = 'getTodos', 
      failCount: number = 2, 
      successData: any = []
    ) => {
      const retryMock = testMockStrategy.createSuccessAfterRetries(failCount, successData);
      (mockClient[method] as any).mockImplementation(retryMock);
    }
  };
};

/**
 * Fast error simulation utilities for tests
 */
export const createFastErrorMocks = () => ({
  /**
   * Creates a network error mock that resolves immediately
   */
  networkError: () => Promise.reject(new ApiClientError('Network error: Unable to connect to server')),
  
  /**
   * Creates a server error mock that resolves immediately
   */
  serverError: (statusCode: number = 500) => 
    Promise.reject(new ApiClientError(`Server error: ${statusCode}`, statusCode)),
  
  /**
   * Creates a timeout error mock that resolves immediately
   */
  timeoutError: () => 
    Promise.reject(new ApiClientError('Request timeout: The server took too long to respond')),
  
  /**
   * Creates a validation error mock that resolves immediately
   */
  validationError: (field: string = 'field', message?: string) => 
    Promise.reject(new ApiClientError(
      message || `Validation failed for field: ${field}`,
      400,
      { message: message || `${field} is required`, field, code: 'VALIDATION_ERROR' }
    )),
  
  /**
   * Creates a client error mock that resolves immediately
   */
  clientError: (statusCode: number = 404, message?: string) => 
    Promise.reject(new ApiClientError(
      message || `Client error: ${statusCode}`,
      statusCode
    ))
});

/**
 * Test timing utilities to ensure fast test execution
 */
export const testTiming = {
  /**
   * Measures execution time of an async function
   */
  measureAsync: async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const startTime = Date.now();
    const result = await fn();
    const duration = Date.now() - startTime;
    return { result, duration };
  },
  
  /**
   * Asserts that a function completes within specified time
   */
  expectFastExecution: async <T>(
    fn: () => Promise<T>, 
    maxDuration: number = 100
  ): Promise<T> => {
    const { result, duration } = await testTiming.measureAsync(fn);
    if (duration > maxDuration) {
      throw new Error(`Function took ${duration}ms, expected under ${maxDuration}ms`);
    }
    return result;
  },
  
  /**
   * Creates a fast timeout for testing without actual delays
   */
  fastTimeout: (ms: number = 0) => new Promise(resolve => setTimeout(resolve, Math.min(ms, 10)))
};

/**
 * Mock context providers for testing components
 */
export const createMockContexts = () => ({
  /**
   * Creates a mock TodoContext with error handling capabilities
   */
  createMockTodoContext: (overrides: any = {}) => ({
    todos: [],
    loading: false,
    error: null,
    refreshTodos: vi.fn(),
    toggleTodoCompletion: vi.fn(),
    deleteTodo: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    ...overrides
  }),
  
  /**
   * Creates a mock NetworkContext for testing network status
   */
  createMockNetworkContext: (overrides: any = {}) => ({
    isOnline: true,
    hasConnectionError: false,
    reportConnectionError: vi.fn(),
    reportConnectionSuccess: vi.fn(),
    ...overrides
  })
});

/**
 * Assertion helpers for error handling tests
 */
export const errorAssertions = {
  /**
   * Asserts that an error is retryable based on its properties
   */
  expectRetryableError: (error: any) => {
    expect(error).toBeInstanceOf(ApiClientError);
    // Network errors and server errors (5xx) should be retryable
    const isRetryable = 
      error.message.includes('Network error') ||
      (error.status && error.status >= 500);
    expect(isRetryable).toBe(true);
  },
  
  /**
   * Asserts that an error is not retryable
   */
  expectNonRetryableError: (error: any) => {
    expect(error).toBeInstanceOf(ApiClientError);
    // Client errors (4xx) should not be retryable
    const isNonRetryable = 
      (error.status && error.status >= 400 && error.status < 500);
    expect(isNonRetryable).toBe(true);
  },
  
  /**
   * Asserts error message format and structure
   */
  expectErrorStructure: (error: any, expectedType: 'network' | 'server' | 'client' | 'validation') => {
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error.message).toBeTruthy();
    
    switch (expectedType) {
      case 'network':
        expect(error.message).toMatch(/network|connect/i);
        break;
      case 'server':
        expect(error.status).toBeGreaterThanOrEqual(500);
        break;
      case 'client':
        expect(error.status).toBeGreaterThanOrEqual(400);
        expect(error.status).toBeLessThan(500);
        break;
      case 'validation':
        expect(error.status).toBe(400);
        expect(error.apiError?.code).toBe('VALIDATION_ERROR');
        break;
    }
  }
};

/**
 * Test data factories for consistent test data
 */
export const testDataFactory = {
  /**
   * Creates mock todo items for testing
   */
  createMockTodos: (count: number = 3) => Array.from({ length: count }, (_, i) => ({
    id: `todo-${i + 1}`,
    title: `Test Todo ${i + 1}`,
    completed: i % 2 === 0,
    priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
    tags: i === 0 ? ['work'] : [],
    memo: '',
    createdAt: new Date(Date.now() - i * 1000).toISOString(),
    updatedAt: new Date(Date.now() - i * 500).toISOString(),
    completedAt: i % 2 === 0 ? new Date(Date.now() - i * 250).toISOString() : null
  })),
  
  /**
   * Creates mock archive groups for testing
   */
  createMockArchiveGroups: () => [
    {
      date: '2024-01-01',
      todos: testDataFactory.createMockTodos(2).map(todo => ({ ...todo, completed: true }))
    }
  ]
};

// Export default instances for convenience
export const mockApiClient = setupMockApiClient();
export const fastErrorMocks = createFastErrorMocks();
export const mockContexts = createMockContexts();
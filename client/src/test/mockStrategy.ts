/**
 * Test Mock Strategy System
 * Provides comprehensive mock strategies for error handling tests
 * Requirements: 1.2, 5.1, 5.2
 */

import { vi } from 'vitest';
import { ApiClientError } from '../services';
import { TodoItem, ArchiveGroup } from '../types';

export interface TestMockStrategy {
  createNetworkErrorMock(delay?: number): Promise<never>;
  createServerErrorMock(statusCode: number, message?: string): Promise<never>;
  createTimeoutMock(timeoutMs?: number): Promise<never>;
  createSuccessAfterRetries(failCount: number, successData?: any): MockFunction;
  createValidationErrorMock(field: string, message?: string): Promise<never>;
  createClientErrorMock(statusCode: number, message?: string): Promise<never>;
  createRateLimitErrorMock(retryAfter?: number): Promise<never>;
  createAuthenticationErrorMock(): Promise<never>;
  createSlowResponseMock<T>(data: T, delay?: number): Promise<T>;
  
  // Enhanced controlled error simulation methods
  createDeterministicErrorSequence(errorTypes: ErrorScenario[], successData?: any): MockFunction;
  createConditionalErrorMock(condition: () => boolean, errorScenario: ErrorScenario, successData?: any): MockFunction;
  createProgressiveDelayMock<T>(data: T, baseDelay?: number, multiplier?: number): MockFunction;
  createCircuitBreakerMock<T>(failureThreshold: number, successData: T, errorScenario?: ErrorScenario): MockFunction;
}

export interface MockFunction {
  (...args: any[]): Promise<any>;
  mockCallCount: number;
  reset: () => void;
}

export interface ErrorScenario {
  type: 'network' | 'server' | 'client' | 'validation' | 'timeout' | 'rateLimit' | 'auth' | 'slowResponse' | 'circuitBreaker' | 'intermittent';
  statusCode?: number;
  message?: string;
  delay?: number;
  retryable?: boolean;
  retryAfter?: number;
  successData?: any;
  failureRate?: number; // For intermittent failures (0-1)
  failureThreshold?: number; // For circuit breaker pattern
}

export interface MockApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiClientError;
  callCount: number;
}

/**
 * Mock strategy implementation for controlled error simulation
 */
export class TestMockStrategyImpl implements TestMockStrategy {
  /**
   * Creates a mock that simulates network connectivity issues
   * Fast execution without actual network delays
   */
  async createNetworkErrorMock(delay: number = 0): Promise<never> {
    // Simulate minimal delay for realistic behavior without slowing tests
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 50)));
    }
    
    throw new ApiClientError('Network error: Unable to connect to server');
  }

  /**
   * Creates a mock that simulates server errors (5xx)
   */
  async createServerErrorMock(statusCode: number = 500, message?: string): Promise<never> {
    const errorMessage = message || this.getDefaultServerErrorMessage(statusCode);
    throw new ApiClientError(errorMessage, statusCode);
  }

  /**
   * Creates a mock that simulates timeout errors
   * Uses immediate rejection instead of actual timeout delays
   */
  async createTimeoutMock(timeoutMs: number = 0): Promise<never> {
    // Simulate minimal delay for realistic behavior
    if (timeoutMs > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(timeoutMs, 50)));
    }
    
    throw new ApiClientError('Request timeout: The server took too long to respond');
  }

  /**
   * Creates a mock that fails a specified number of times then succeeds
   * Useful for testing retry logic without actual delays
   */
  createSuccessAfterRetries(failCount: number, successData: any = { success: true }): MockFunction {
    let callCount = 0;
    
    const mockFn = async () => {
      callCount++;
      mockFn.mockCallCount = callCount;
      
      if (callCount <= failCount) {
        // Fail with network error for the first failCount attempts
        throw new ApiClientError('Network error: Unable to connect to server');
      }
      
      // Succeed after failCount attempts
      return successData;
    };
    
    mockFn.mockCallCount = 0;
    mockFn.reset = () => {
      callCount = 0;
      mockFn.mockCallCount = 0;
    };
    
    return mockFn as MockFunction;
  }

  /**
   * Creates a mock that simulates validation errors (400, 422)
   */
  async createValidationErrorMock(field: string, message?: string): Promise<never> {
    const errorMessage = message || `Validation failed for field: ${field}`;
    throw new ApiClientError(errorMessage, 400, {
      error: 'VALIDATION_ERROR',
      message: errorMessage,
      details: [{
        field,
        message: errorMessage
      }]
    });
  }

  /**
   * Creates a mock that simulates client errors (4xx)
   */
  async createClientErrorMock(statusCode: number = 404, message?: string): Promise<never> {
    const errorMessage = message || this.getDefaultClientErrorMessage(statusCode);
    throw new ApiClientError(errorMessage, statusCode);
  }

  /**
   * Creates a mock that simulates rate limiting errors (429)
   */
  async createRateLimitErrorMock(retryAfter: number = 60): Promise<never> {
    throw new ApiClientError(`Rate limit exceeded. Retry after ${retryAfter} seconds`, 429);
  }

  /**
   * Creates a mock that simulates authentication errors (401)
   */
  async createAuthenticationErrorMock(): Promise<never> {
    throw new ApiClientError('Authentication required', 401);
  }

  /**
   * Creates a mock that simulates slow responses without actual delays
   * Uses minimal delay for realistic behavior in tests
   */
  async createSlowResponseMock<T>(data: T, delay: number = 0): Promise<T> {
    // Simulate minimal delay for realistic behavior without slowing tests
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 100)));
    }
    return data;
  }

  /**
   * Creates a deterministic error sequence that follows a predefined pattern
   * Useful for testing complex retry scenarios with different error types
   */
  createDeterministicErrorSequence(errorTypes: ErrorScenario[], successData: any = { success: true }): MockFunction {
    let callCount = 0;
    const factory = new MockErrorFactory();
    
    const mockFn = async () => {
      callCount++;
      mockFn.mockCallCount = callCount;
      
      // If we have more calls than error scenarios, succeed
      if (callCount > errorTypes.length) {
        return successData;
      }
      
      // Use the error scenario for this call (1-indexed)
      const errorScenario = errorTypes[callCount - 1];
      throw await factory.createMockFromScenario(errorScenario);
    };
    
    mockFn.mockCallCount = 0;
    mockFn.reset = () => {
      callCount = 0;
      mockFn.mockCallCount = 0;
    };
    
    return mockFn as MockFunction;
  }

  /**
   * Creates a conditional error mock that fails based on a condition function
   * Useful for testing context-dependent error scenarios
   */
  createConditionalErrorMock(
    condition: () => boolean, 
    errorScenario: ErrorScenario, 
    successData: any = { success: true }
  ): MockFunction {
    let callCount = 0;
    const factory = new MockErrorFactory();
    
    const mockFn = async () => {
      callCount++;
      mockFn.mockCallCount = callCount;
      
      if (condition()) {
        throw await factory.createMockFromScenario(errorScenario);
      }
      
      return successData;
    };
    
    mockFn.mockCallCount = 0;
    mockFn.reset = () => {
      callCount = 0;
      mockFn.mockCallCount = 0;
    };
    
    return mockFn as MockFunction;
  }

  /**
   * Creates a mock with progressive delay simulation (without actual delays)
   * Useful for testing exponential backoff behavior
   */
  createProgressiveDelayMock<T>(
    data: T, 
    baseDelay: number = 100, 
    multiplier: number = 2
  ): MockFunction {
    let callCount = 0;
    
    const mockFn = async (): Promise<T> => {
      callCount++;
      mockFn.mockCallCount = callCount;
      
      // Simulate progressive delay calculation without actual waiting
      const calculatedDelay = baseDelay * Math.pow(multiplier, callCount - 1);
      
      // Add delay metadata to response for testing purposes
      const response = {
        ...data,
        _mockDelay: Math.min(calculatedDelay, 1000), // Cap at 1 second for testing
        _mockAttempt: callCount
      };
      
      return response as T;
    };
    
    mockFn.mockCallCount = 0;
    mockFn.reset = () => {
      callCount = 0;
      mockFn.mockCallCount = 0;
    };
    
    return mockFn as MockFunction;
  }

  /**
   * Creates a circuit breaker mock that fails after a threshold then succeeds
   * Useful for testing circuit breaker patterns and failure recovery
   */
  createCircuitBreakerMock<T>(
    failureThreshold: number, 
    successData: T, 
    errorScenario: ErrorScenario = { type: 'server', statusCode: 503 }
  ): MockFunction {
    let callCount = 0;
    let failureCount = 0;
    let circuitOpen = false;
    
    const mockFn = async (): Promise<T> => {
      callCount++;
      mockFn.mockCallCount = callCount;
      
      // If circuit is open, fail fast
      if (circuitOpen) {
        throw new ApiClientError('Circuit breaker is open', 503);
      }
      
      // Simulate failure up to threshold
      if (failureCount < failureThreshold) {
        failureCount++;
        
        // Create error directly without using factory to avoid async issues
        const error = new ApiClientError(
          errorScenario.message || 'Service unavailable', 
          errorScenario.statusCode || 503
        );
        
        // Open circuit if we hit the threshold
        if (failureCount >= failureThreshold) {
          circuitOpen = true;
        }
        
        throw error;
      }
      
      // Success after threshold - circuit remains closed
      return successData;
    };
    
    mockFn.mockCallCount = 0;
    mockFn.reset = () => {
      callCount = 0;
      failureCount = 0;
      circuitOpen = false;
      mockFn.mockCallCount = 0;
    };
    
    // Add method to manually close circuit for testing
    (mockFn as any).closeCircuit = () => {
      circuitOpen = false;
      failureCount = 0;
    };
    
    return mockFn as MockFunction;
  }

  private getDefaultServerErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case 500:
        return 'Internal server error';
      case 502:
        return 'Bad gateway';
      case 503:
        return 'Service unavailable';
      case 504:
        return 'Gateway timeout';
      default:
        return `Server error: ${statusCode}`;
    }
  }

  private getDefaultClientErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not found';
      case 409:
        return 'Conflict';
      case 422:
        return 'Unprocessable entity';
      default:
        return `Client error: ${statusCode}`;
    }
  }
}

/**
 * Mock factory for creating different error scenarios
 */
export class MockErrorFactory {
  private strategy: TestMockStrategy;

  constructor(strategy: TestMockStrategy = new TestMockStrategyImpl()) {
    this.strategy = strategy;
  }

  /**
   * Creates a mock function based on error scenario configuration
   */
  createMockFromScenario(scenario: ErrorScenario): Promise<any> {
    switch (scenario.type) {
      case 'network':
        return this.strategy.createNetworkErrorMock(scenario.delay);
      
      case 'server':
        return this.strategy.createServerErrorMock(
          scenario.statusCode || 500,
          scenario.message
        );
      
      case 'client':
        return this.strategy.createClientErrorMock(
          scenario.statusCode || 404,
          scenario.message
        );
      
      case 'validation':
        return this.strategy.createValidationErrorMock(
          'field',
          scenario.message
        );
      
      case 'timeout':
        return this.strategy.createTimeoutMock(scenario.delay);
      
      case 'rateLimit':
        return this.strategy.createRateLimitErrorMock(scenario.retryAfter);
      
      case 'auth':
        return this.strategy.createAuthenticationErrorMock();
      
      case 'slowResponse':
        return this.strategy.createSlowResponseMock(
          scenario.successData || { success: true },
          scenario.delay
        );
      
      case 'circuitBreaker':
        // Circuit breaker scenarios need to be handled differently as they return MockFunction
        throw new ApiClientError('Circuit breaker is open - use createCircuitBreakerMock instead', 503);
      
      case 'intermittent':
        // Intermittent scenarios need to be handled differently as they return MockFunction
        throw new ApiClientError('Intermittent failure - use createIntermittentFailureMock instead', 500);
      
      default:
        return Promise.reject(new Error(`Unknown error scenario type: ${scenario.type}`));
    }
  }

  /**
   * Creates common error scenarios for testing
   */
  getCommonScenarios(): Record<string, ErrorScenario> {
    return {
      networkError: {
        type: 'network',
        retryable: true
      },
      serverError: {
        type: 'server',
        statusCode: 500,
        retryable: true
      },
      notFound: {
        type: 'client',
        statusCode: 404,
        retryable: false
      },
      validationError: {
        type: 'validation',
        statusCode: 400,
        retryable: false
      },
      timeout: {
        type: 'timeout',
        retryable: true
      },
      badGateway: {
        type: 'server',
        statusCode: 502,
        retryable: true
      },
      serviceUnavailable: {
        type: 'server',
        statusCode: 503,
        retryable: true
      },
      rateLimit: {
        type: 'rateLimit',
        statusCode: 429,
        retryable: true,
        retryAfter: 60
      },
      unauthorized: {
        type: 'auth',
        statusCode: 401,
        retryable: false
      },
      forbidden: {
        type: 'client',
        statusCode: 403,
        retryable: false
      },
      conflict: {
        type: 'client',
        statusCode: 409,
        retryable: false
      },
      slowResponse: {
        type: 'slowResponse',
        delay: 50,
        retryable: false,
        successData: { success: true }
      },
      // Enhanced scenarios for comprehensive testing
      gatewayTimeout: {
        type: 'server',
        statusCode: 504,
        retryable: true,
        message: 'Gateway timeout'
      },
      tooManyRequests: {
        type: 'rateLimit',
        statusCode: 429,
        retryable: true,
        retryAfter: 30,
        message: 'Too many requests'
      },
      unprocessableEntity: {
        type: 'validation',
        statusCode: 422,
        retryable: false,
        message: 'Unprocessable entity'
      },
      internalServerError: {
        type: 'server',
        statusCode: 500,
        retryable: true,
        message: 'Internal server error'
      },
      connectionRefused: {
        type: 'network',
        retryable: true,
        message: 'Connection refused'
      },
      dnsError: {
        type: 'network',
        retryable: true,
        message: 'DNS resolution failed'
      },
      sslError: {
        type: 'network',
        retryable: false,
        message: 'SSL certificate error'
      },
      // Patterns for complex testing scenarios
      intermittentFailure: {
        type: 'intermittent',
        failureRate: 0.5,
        retryable: true
      },
      circuitBreakerOpen: {
        type: 'circuitBreaker',
        failureThreshold: 3,
        retryable: false
      }
    };
  }

  /**
   * Creates a mock that simulates intermittent failures
   */
  createIntermittentFailureMock(
    failureRate: number = 0.5,
    errorScenario: ErrorScenario = { type: 'network' }
  ): MockFunction {
    let callCount = 0;
    
    const mockFn = async () => {
      callCount++;
      mockFn.mockCallCount = callCount;
      
      // Use deterministic failure based on call count for consistent testing
      const shouldFail = (callCount - 1) % Math.ceil(1 / failureRate) === 0;
      
      if (shouldFail) {
        return this.createMockFromScenario(errorScenario);
      }
      
      return { success: true, callCount };
    };
    
    mockFn.mockCallCount = 0;
    mockFn.reset = () => {
      callCount = 0;
      mockFn.mockCallCount = 0;
    };
    
    return mockFn as MockFunction;
  }
}

// Default instances for easy importing
export const testMockStrategy = new TestMockStrategyImpl();
export const mockErrorFactory = new MockErrorFactory();

/**
 * Enhanced mock API client with better error simulation
 */
export class EnhancedMockApiClient {
  private factory: MockErrorFactory;
  private scenarios: Record<string, ErrorScenario>;
  
  constructor() {
    this.factory = new MockErrorFactory();
    this.scenarios = this.factory.getCommonScenarios();
  }

  /**
   * Creates a mock that simulates API method behavior with controlled errors
   */
  createMethodMock<T>(
    successData: T,
    errorScenario?: ErrorScenario | string,
    options: { 
      failureRate?: number;
      successAfterRetries?: number;
    } = {}
  ): MockFunction {
    let callCount = 0;
    const { failureRate = 0, successAfterRetries } = options;
    
    const mockFn = async (): Promise<T> => {
      callCount++;
      mockFn.mockCallCount = callCount;
      
      // Handle success after retries pattern
      if (successAfterRetries && callCount <= successAfterRetries) {
        const scenario = typeof errorScenario === 'string' 
          ? this.scenarios[errorScenario] 
          : errorScenario || this.scenarios.networkError;
        throw await this.factory.createMockFromScenario(scenario);
      }
      
      // Handle failure rate pattern
      if (failureRate > 0 && Math.random() < failureRate) {
        const scenario = typeof errorScenario === 'string' 
          ? this.scenarios[errorScenario] 
          : errorScenario || this.scenarios.networkError;
        throw await this.factory.createMockFromScenario(scenario);
      }
      
      return successData;
    };
    
    mockFn.mockCallCount = 0;
    mockFn.reset = () => {
      callCount = 0;
      mockFn.mockCallCount = 0;
    };
    
    return mockFn as MockFunction;
  }

  /**
   * Creates a complete mock API client with all methods
   */
  createFullMockClient(defaultSuccessData: {
    todos?: TodoItem[];
    todo?: TodoItem;
    tags?: string[];
    archive?: ArchiveGroup[];
  } = {}) {
    const {
      todos = [],
      todo = {
        id: '1',
        title: 'Test Todo',
        completed: false,
        priority: 'medium',
        tags: [],
        memo: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      },
      tags = [],
      archive = []
    } = defaultSuccessData;

    return {
      getTodos: vi.fn().mockResolvedValue(todos),
      createTodo: vi.fn().mockResolvedValue(todo),
      updateTodo: vi.fn().mockResolvedValue(todo),
      toggleTodoCompletion: vi.fn().mockResolvedValue({ ...todo, completed: !todo.completed }),
      deleteTodo: vi.fn().mockResolvedValue(undefined),
      getTags: vi.fn().mockResolvedValue(tags),
      getArchive: vi.fn().mockResolvedValue(archive),
      setNetworkReporter: vi.fn(),
      
      // Enhanced error simulation methods
      simulateError: (method: string, scenario: string | ErrorScenario) => {
        const mockClient = this as any;
        const mockMethod = mockClient[method];
        if (mockMethod && typeof mockMethod.mockImplementation === 'function') {
          const errorScenario = typeof scenario === 'string' ? factory.getCommonScenarios()[scenario] : scenario;
          mockMethod.mockImplementation(() => factory.createMockFromScenario(errorScenario));
        }
      },
      
      simulateSuccessAfterRetries: (method: string, retryCount: number, successData?: any) => {
        const mockClient = this as any;
        const mockMethod = mockClient[method];
        if (mockMethod && typeof mockMethod.mockImplementation === 'function') {
          const enhancedClient = new EnhancedMockApiClient();
          const mockFn = enhancedClient.createMethodMock(
            successData || (method === 'getTodos' ? todos : todo),
            'networkError',
            { successAfterRetries: retryCount }
          );
          mockMethod.mockImplementation(mockFn);
        }
      },
      
      resetAllMocks: () => {
        const mockClient = this as any;
        Object.values(mockClient).forEach(mock => {
          if (typeof mock === 'function' && 'mockReset' in mock) {
            (mock as any).mockReset();
          }
        });
      }
    };
  }
}

/**
 * Utility functions for test setup
 */
export const createMockApiClient = () => {
  const enhancedClient = new EnhancedMockApiClient();
  return enhancedClient.createFullMockClient();
};

/**
 * Creates a deterministic mock that always fails with the same error
 * Useful for testing specific error handling scenarios
 */
export const createDeterministicErrorMock = (scenario: ErrorScenario | string) => {
  const factory = new MockErrorFactory();
  const errorScenario = typeof scenario === 'string' 
    ? factory.getCommonScenarios()[scenario] 
    : scenario;
    
  return vi.fn().mockImplementation(() => factory.createMockFromScenario(errorScenario));
};

/**
 * Creates a mock that succeeds after a specified number of failures
 * Perfect for testing retry logic without actual delays
 */
export const createRetryMock = <T>(successData: T, failCount: number = 2, errorType: string = 'networkError') => {
  const factory = new MockErrorFactory();
  return factory.getCommonScenarios()[errorType] 
    ? testMockStrategy.createSuccessAfterRetries(failCount, successData)
    : vi.fn().mockResolvedValue(successData);
};

/**
 * Test utilities for fast, deterministic error testing
 */
export const testUtils = {
  /**
   * Creates a fast timeout promise that resolves immediately
   * Use instead of actual setTimeout in tests
   */
  fastTimeout: () => Promise.resolve(),
  
  /**
   * Creates a mock network delay that doesn't actually delay
   * Use for testing loading states without slowing tests
   */
  mockDelay: () => Promise.resolve(),
  
  /**
   * Simulates a slow network response without actual delay
   */
  simulateSlowResponse: <T>(data: T) => testMockStrategy.createSlowResponseMock(data, 10),
  
  /**
   * Creates a deterministic error sequence for testing retry logic
   */
  createErrorSequence: (errorTypes: string[], successData?: any) => {
    const factory = new MockErrorFactory();
    const scenarios = factory.getCommonScenarios();
    const errorScenarios = errorTypes.map(type => scenarios[type]).filter(Boolean);
    return testMockStrategy.createDeterministicErrorSequence(errorScenarios, successData);
  },
  
  /**
   * Creates a mock that fails based on call count (deterministic)
   */
  createFailurePattern: (pattern: boolean[], successData?: any) => {
    let callCount = 0;
    const factory = new MockErrorFactory();
    
    const mockFn = async () => {
      const shouldFail = pattern[callCount % pattern.length];
      callCount++;
      (mockFn as any).mockCallCount = callCount;
      
      if (shouldFail) {
        throw await factory.createMockFromScenario({ type: 'network' });
      }
      
      return successData || { success: true };
    };
    
    (mockFn as any).mockCallCount = 0;
    (mockFn as any).reset = () => {
      callCount = 0;
      (mockFn as any).mockCallCount = 0;
    };
    
    return mockFn as MockFunction;
  },
  
  /**
   * Creates a mock that simulates network conditions
   */
  simulateNetworkConditions: (condition: 'fast' | 'slow' | 'unstable' | 'offline') => {
    const factory = new MockErrorFactory();
    
    switch (condition) {
      case 'fast':
        return testMockStrategy.createSlowResponseMock({ success: true }, 5);
      case 'slow':
        return testMockStrategy.createSlowResponseMock({ success: true }, 50);
      case 'unstable':
        return factory.createIntermittentFailureMock(0.3, { type: 'network' });
      case 'offline':
        return testMockStrategy.createNetworkErrorMock();
      default:
        return Promise.resolve({ success: true });
    }
  },
  
  /**
   * Common test data generators
   */
  generateMockTodo: (overrides: Partial<TodoItem> = {}): TodoItem => ({
    id: '1',
    title: 'Test Todo',
    completed: false,
    priority: 'medium',
    tags: [],
    memo: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    ...overrides
  }),
  
  generateMockArchive: (overrides: Partial<ArchiveGroup> = {}): ArchiveGroup => ({
    date: '2024-01-01',
    count: 1,
    tasks: [testUtils.generateMockTodo({ completed: true })],
    ...overrides
  }),
  
  /**
   * Generates multiple mock todos for testing
   */
  generateMockTodos: (count: number, baseOverrides: Partial<TodoItem> = {}): TodoItem[] => {
    return Array.from({ length: count }, (_, index) => 
      testUtils.generateMockTodo({
        id: (index + 1).toString(),
        title: `Test Todo ${index + 1}`,
        ...baseOverrides
      })
    );
  },
  
  /**
   * Creates mock API responses with consistent structure
   */
  createMockApiResponse: <T>(data: T, success: boolean = true) => ({
    success,
    data: success ? data : undefined,
    error: success ? undefined : { message: 'Mock error', code: 'MOCK_ERROR' }
  }),
  
  /**
   * Validates that a test completes within expected time
   */
  expectFastExecution: async <T>(testFn: () => Promise<T>, maxTimeMs: number = 2000): Promise<T> => {
    const startTime = Date.now();
    const result = await testFn();
    const duration = Date.now() - startTime;
    
    if (duration > maxTimeMs) {
      throw new Error(`Test took ${duration}ms, expected under ${maxTimeMs}ms`);
    }
    
    return result;
  }
};
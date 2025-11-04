import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';

// Configure React Testing Library
configure({
  // Automatically wrap async utilities in act()
  asyncUtilTimeout: 5000,
});

// Global test configuration for mock strategy system
global.testConfig = {
  // Disable auto-retry in test environment to prevent interference with mock testing
  disableAutoRetry: true,
  // Use fast timeouts for deterministic testing
  fastTimeouts: true,
  // Enable mock strategy system
  useMockStrategy: true,
  // Maximum test timeout (reduced from 20s to 5s)
  maxTestTimeout: 5000,
  // Maximum wait timeout for async operations in tests
  maxWaitTimeout: 2000
};

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset console mocks before each test
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  // Restore console methods after each test
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global error handler for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
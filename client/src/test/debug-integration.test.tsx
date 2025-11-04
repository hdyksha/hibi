/**
 * Debug integration test to see what's actually rendered
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoProvider } from '../contexts/TodoContext';
import { NetworkProvider } from '../contexts/NetworkContext';
import { TodoList } from '../components/TodoList';
import { todoApiClient } from '../services/apiClient';

// Mock the API client
vi.mock('../services/apiClient', () => ({
  todoApiClient: {
    getTodos: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
    getTags: vi.fn(),
    getArchive: vi.fn(),
    setNetworkReporter: vi.fn(),
  },
  TodoApiClient: vi.fn(),
  ApiClientError: vi.fn().mockImplementation((message: string, status?: number) => {
    const error = new Error(message);
    error.name = 'ApiClientError';
    (error as any).status = status;
    return error;
  }),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NetworkProvider>
    <TodoProvider>
      {children}
    </TodoProvider>
  </NetworkProvider>
);

describe('Debug Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows what is actually rendered when network error occurs', async () => {
    // Mock network error
    vi.mocked(todoApiClient.getTodos).mockRejectedValue(new Error('Network error: Unable to connect'));
    vi.mocked(todoApiClient.getTags).mockRejectedValue(new Error('Network error: Unable to connect'));
    vi.mocked(todoApiClient.getArchive).mockRejectedValue(new Error('Network error: Unable to connect'));

    await act(async () => {
      render(
        <TestWrapper>
          <TodoList />
        </TestWrapper>
      );
    });

    // Wait a bit for async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Check if error alert exists
    const errorAlert = screen.queryByRole('alert');
    if (errorAlert) {
      console.log('ERROR ALERT FOUND:', errorAlert.textContent);
    } else {
      console.log('NO ERROR ALERT FOUND');
    }

    // Check for loading spinner
    const loadingText = screen.queryByText(/loading/i);
    if (loadingText) {
      console.log('LOADING STATE FOUND:', loadingText.textContent);
    }

    // Check for retry buttons
    const retryButtons = screen.queryAllByRole('button', { name: /try again|retry/i });
    console.log('RETRY BUTTONS FOUND:', retryButtons.length);
    retryButtons.forEach((button, index) => {
      console.log(`Button ${index}: "${button.textContent}"`);
    });

    // This test always passes - it's just for debugging
    expect(true).toBe(true);
  });
});
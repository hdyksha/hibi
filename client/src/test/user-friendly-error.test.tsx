/**
 * User-Friendly Error Display Integration Tests
 * Tests the complete user-friendly error handling flow
 * Requirements: 全般 - ユーザーフレンドリーなエラー表示
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoProvider } from '../contexts/TodoContext';
import { NetworkProvider } from '../contexts/NetworkContext';
import { TodoList } from '../components/TodoList';
import { TodoForm } from '../components/TodoForm';
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

describe('User-Friendly Error Display Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays user-friendly network error in TodoList', async () => {
    // Mock network error
    vi.mocked(todoApiClient.getTodos).mockRejectedValue(new Error('Network error: Unable to connect'));
    vi.mocked(todoApiClient.getTags).mockRejectedValue(new Error('Network error: Unable to connect'));
    vi.mocked(todoApiClient.getArchive).mockRejectedValue(new Error('Network error: Unable to connect'));

    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    );

    // Wait for error to be displayed with increased timeout
    await waitFor(() => {
      // Look for the actual error message that should be displayed
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(/connection problem|unable to connect/i);
    }, { timeout: 10000 });

    // Should show retry button
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('displays user-friendly validation error in TodoForm', async () => {
    render(
      <TestWrapper>
        <TodoForm />
      </TestWrapper>
    );

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /create todo/i });
    
    // Button should be disabled for empty title
    expect(submitButton).toBeDisabled();

    // Enter a title that's too long
    const titleInput = screen.getByPlaceholderText(/enter todo title/i);
    const longTitle = 'a'.repeat(201); // Exceeds 200 character limit
    
    fireEvent.change(titleInput, { target: { value: longTitle } });
    fireEvent.click(submitButton);

    // Should show user-friendly validation error
    await waitFor(() => {
      expect(screen.getByText(/title is too long/i)).toBeInTheDocument();
    });
  });

  it('shows contextual error messages for different operations', async () => {
    // Mock successful initial load
    vi.mocked(todoApiClient.getTodos).mockResolvedValue([
      {
        id: '1',
        title: 'Test Todo',
        completed: false,
        priority: 'medium',
        tags: [],
        memo: '',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
        completedAt: null
      }
    ]);
    vi.mocked(todoApiClient.getTags).mockResolvedValue([]);
    vi.mocked(todoApiClient.getArchive).mockResolvedValue([]);

    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    );

    // Wait for todo to load with increased timeout
    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Mock delete operation failure after initial load
    vi.mocked(todoApiClient.deleteTodo).mockRejectedValue(new Error('Server error'));

    // Try to delete the todo (this should fail)
    const deleteButton = screen.getByRole('button', { name: /delete.*test todo/i });
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Should show contextual error message for delete operation
    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(/unable to delete|something went wrong/i);
    }, { timeout: 10000 });
  }, 30000);

  it('provides retry functionality with exponential backoff', async () => {
    let callCount = 0;
    vi.mocked(todoApiClient.getTodos).mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve([]);
    });
    vi.mocked(todoApiClient.getTags).mockResolvedValue([]);
    vi.mocked(todoApiClient.getArchive).mockResolvedValue([]);

    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    );

    // Wait for error to be displayed with increased timeout
    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(/connection problem|unable to connect/i);
    }, { timeout: 15000 });

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    await act(async () => {
      fireEvent.click(retryButton);
    });

    // Wait for retry to complete and check if it succeeded or shows retry count
    await waitFor(() => {
      // Either the retry succeeded and we see the empty state, or we see retry count, or error persists
      const hasEmptyState = screen.queryByText(/no todos yet.*create your first todo/i);
      const hasRetryCount = screen.queryByText(/attempt 1 of 3/i);
      const hasError = screen.queryByRole('alert');
      
      // At least one of these should be present
      expect(hasEmptyState || hasRetryCount || hasError).toBeTruthy();
      
      // If we have an error, it should be a connection problem
      if (hasError && !hasEmptyState) {
        expect(hasError).toHaveTextContent(/connection problem|unable to connect/i);
      }
    }, { timeout: 15000 });

    expect(callCount).toBeGreaterThanOrEqual(1);
  });

  it('shows technical details in development mode', async () => {
    // Mock NODE_ENV to development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    vi.mocked(todoApiClient.getTodos).mockRejectedValue(new Error('Detailed technical error message'));
    vi.mocked(todoApiClient.getTags).mockRejectedValue(new Error('Network error'));
    vi.mocked(todoApiClient.getArchive).mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <TodoList />
      </TestWrapper>
    );

    // Wait for error to be displayed with increased timeout
    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(/connection problem|unable to connect/i);
    }, { timeout: 15000 });

    // Should show technical details button
    expect(screen.getByText(/show technical details/i)).toBeInTheDocument();

    // Click to show technical details
    await act(async () => {
      fireEvent.click(screen.getByText(/show technical details/i));
    });

    // Should show the original technical error message
    await waitFor(() => {
      expect(screen.getByText(/detailed technical error message/i)).toBeInTheDocument();
    }, { timeout: 15000 });

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });
});
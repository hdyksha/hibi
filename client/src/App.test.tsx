import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { App } from './App';

// Mock the components to avoid Context API calls in App tests
vi.mock('./components', () => ({
  TodoList: () => <div data-testid="todo-list">TodoList Component</div>,
  TodoForm: () => <div data-testid="todo-form">TodoForm Component</div>,
  Filter: () => <div data-testid="filter">Filter Component</div>,
  NetworkStatusIndicator: () => <div data-testid="network-status">Network Status</div>,
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FileSelector: () => <div data-testid="file-selector">File Selector</div>
}));

// Mock the API client to prevent network calls during tests
vi.mock('./services', () => ({
  todoApiClient: {
    getTodos: vi.fn().mockResolvedValue([]),
    getTags: vi.fn().mockResolvedValue([]),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    toggleTodoCompletion: vi.fn(),
    deleteTodo: vi.fn(),
    setNetworkReporter: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'ApiClientError';
    }
  },
}));

// Mock the useNetworkStatus hook
vi.mock('./hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlowConnection: false,
    lastOnlineAt: Date.now(),
    connectionType: null,
    checkConnection: vi.fn().mockResolvedValue(true),
    reportConnectionError: vi.fn(),
    reportConnectionSuccess: vi.fn(),
  }),
}));

describe('App', () => {
  it('renders the Hibi app title', async () => {
    await act(async () => {
      render(<App />);
    });
    const titleElement = screen.getByText('Hibi');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders navigation buttons in header', async () => {
    await act(async () => {
      render(<App />);
    });
    const tasksButton = screen.getByText('Tasks');
    const archiveButton = screen.getByText('Archive');
    expect(tasksButton).toBeInTheDocument();
    expect(archiveButton).toBeInTheDocument();
  });

  it('renders the TodoForm, Filter, and TodoList components', async () => {
    await act(async () => {
      render(<App />);
    });
    const todoFormElement = screen.getByTestId('todo-form');
    const filterElement = screen.getByTestId('filter');
    const todoListElement = screen.getByTestId('todo-list');
    expect(todoFormElement).toBeInTheDocument();
    expect(filterElement).toBeInTheDocument();
    expect(todoListElement).toBeInTheDocument();
  });
});
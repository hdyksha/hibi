/**
 * TodoList Component Tests
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { TodoList } from '../';
import { TodoItem } from '../../types';

// Mock the TodoContext
vi.mock('../../contexts', () => ({
  TodoProvider: ({ children }: { children: React.ReactNode }) => children,
  useTodoContext: vi.fn(),
}));

import { useTodoContext } from '../../contexts';

const mockUseTodoContext = useTodoContext as any;

const mockTodos: TodoItem[] = [
  {
    id: '1',
    title: 'Test Todo 1',
    completed: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'Test Todo 2',
    completed: true,
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  },
];

const renderTodoList = () => {
  return render(<TodoList />);
};

describe('TodoList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    mockUseTodoContext.mockReturnValue({
      todos: [],
      loading: true,
      error: null,
      refreshTodos: vi.fn(),
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
    
    renderTodoList();
    
    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });

  it('displays todos after loading', async () => {
    mockUseTodoContext.mockReturnValue({
      todos: mockTodos,
      loading: false,
      error: null,
      refreshTodos: vi.fn(),
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
    
    renderTodoList();
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  it('displays empty state when no todos', async () => {
    mockUseTodoContext.mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      refreshTodos: vi.fn(),
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
    
    renderTodoList();
    
    await waitFor(() => {
      expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
    });
  });

  it('displays error state when loading fails', async () => {
    const mockRefreshTodos = vi.fn();
    mockUseTodoContext.mockReturnValue({
      todos: [],
      loading: false,
      error: 'Network error',
      refreshTodos: mockRefreshTodos,
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
    
    renderTodoList();
    
    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('retries loading when retry button is clicked', async () => {
    const mockRefreshTodos = vi.fn();
    mockUseTodoContext.mockReturnValue({
      todos: [],
      loading: false,
      error: 'Network error',
      refreshTodos: mockRefreshTodos,
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
    
    renderTodoList();
    
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Retry'));
    
    expect(mockRefreshTodos).toHaveBeenCalled();
  });

  it('handles toggle completion', async () => {
    const mockToggleTodoCompletion = vi.fn();
    mockUseTodoContext.mockReturnValue({
      todos: mockTodos,
      loading: false,
      error: null,
      refreshTodos: vi.fn(),
      toggleTodoCompletion: mockToggleTodoCompletion,
      deleteTodo: vi.fn(),
    });
    
    renderTodoList();
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
    
    const toggleButton = screen.getAllByLabelText(/Mark as/)[0];
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(mockToggleTodoCompletion).toHaveBeenCalledWith('1');
    });
  });

  it('handles delete todo', async () => {
    const mockDeleteTodo = vi.fn();
    mockUseTodoContext.mockReturnValue({
      todos: mockTodos,
      loading: false,
      error: null,
      refreshTodos: vi.fn(),
      toggleTodoCompletion: vi.fn(),
      deleteTodo: mockDeleteTodo,
    });
    
    renderTodoList();
    
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getAllByLabelText(/Delete todo:/)[0];
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledWith('1');
    });
  });
});
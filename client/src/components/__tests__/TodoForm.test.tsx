/**
 * TodoForm Component Tests
 * Requirements: 1.1, 1.2, 1.3
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { TodoForm } from '../';
import { TodoProvider } from '../../contexts';
import { TodoItem } from '../../types';

// Mock the TodoContext
vi.mock('../../contexts', () => ({
  TodoProvider: ({ children }: { children: React.ReactNode }) => children,
  useTodoContext: vi.fn(),
}));

import { useTodoContext } from '../../contexts';
const mockUseTodoContext = useTodoContext as any;

const mockCreatedTodo: TodoItem = {
  id: '1',
  title: 'New Todo',
  completed: false,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

const renderTodoForm = () => {
  return render(<TodoForm />);
};

describe('TodoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock setup
    mockUseTodoContext.mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      refreshTodos: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
  });

  it('renders form elements correctly', () => {
    renderTodoForm();
    
    expect(screen.getByLabelText('New Todo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter todo title...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Todo' })).toBeInTheDocument();
  });

  it('creates todo with valid title', async () => {
    const mockCreateTodo = vi.fn().mockResolvedValue(mockCreatedTodo);
    mockUseTodoContext.mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      refreshTodos: vi.fn(),
      createTodo: mockCreateTodo,
      updateTodo: vi.fn(),
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
    
    renderTodoForm();
    
    const titleInput = screen.getByLabelText('New Todo');
    const submitButton = screen.getByRole('button', { name: 'Create Todo' });
    
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith({
        title: 'New Todo'
      });
    });
    
    expect(titleInput).toHaveValue('');
  });

  it('shows validation error for empty title', async () => {
    renderTodoForm();
    
    // Find the form element
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    
    // Submit the form directly (bypassing the disabled button)
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for title too long', async () => {
    renderTodoForm();
    
    const titleInput = screen.getByLabelText('New Todo');
    const longTitle = 'a'.repeat(201);
    
    fireEvent.change(titleInput, { target: { value: longTitle } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Todo' }));
    
    await waitFor(() => {
      expect(screen.getByText('Title must be 200 characters or less')).toBeInTheDocument();
    });
  });

  it('trims whitespace from title', async () => {
    const mockCreateTodo = vi.fn().mockResolvedValue(mockCreatedTodo);
    mockUseTodoContext.mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      refreshTodos: vi.fn(),
      createTodo: mockCreateTodo,
      updateTodo: vi.fn(),
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
    
    renderTodoForm();
    
    const titleInput = screen.getByLabelText('New Todo');
    
    fireEvent.change(titleInput, { target: { value: '  New Todo  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Todo' }));
    
    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith({
        title: 'New Todo'
      });
    });
  });

  it('disables submit button when title is empty', () => {
    renderTodoForm();
    
    const submitButton = screen.getByRole('button', { name: 'Create Todo' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when title is provided', () => {
    renderTodoForm();
    
    const titleInput = screen.getByLabelText('New Todo');
    const submitButton = screen.getByRole('button', { name: 'Create Todo' });
    
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });
    
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    const mockCreateTodo = vi.fn().mockImplementation(() => new Promise(() => {}));
    mockUseTodoContext.mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      refreshTodos: vi.fn(),
      createTodo: mockCreateTodo,
      updateTodo: vi.fn(),
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
    
    renderTodoForm();
    
    const titleInput = screen.getByLabelText('New Todo');
    
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Todo' }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Creating...' })).toBeInTheDocument();
      expect(titleInput).toBeDisabled();
    });
  });

  it('shows error message when creation fails', async () => {
    const mockCreateTodo = vi.fn().mockRejectedValue(new Error('Network error'));
    mockUseTodoContext.mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      refreshTodos: vi.fn(),
      createTodo: mockCreateTodo,
      updateTodo: vi.fn(),
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
    
    renderTodoForm();
    
    const titleInput = screen.getByLabelText('New Todo');
    
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Todo' }));
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('clears error when user starts typing', async () => {
    renderTodoForm();
    
    const titleInput = screen.getByLabelText('New Todo');
    const form = document.querySelector('form');
    
    // Trigger validation error by submitting empty form
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    
    // Start typing to clear error
    fireEvent.change(titleInput, { target: { value: 'N' } });
    
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });
});
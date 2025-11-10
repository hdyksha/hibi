/**
 * TodoForm Component Tests
 * Requirements: 1.1, 1.2, 1.3
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { TodoForm } from '../';
import { TodoItem } from '../../types';
import { TestProviders } from '../../test/MockProviders';

// Mock the useTodoContext hook for test flexibility
vi.mock('../../contexts', async () => {
  const actual = await vi.importActual('../../contexts');
  return {
    ...actual,
    useTodoContext: vi.fn(),
  };
});

import { useTodoContext } from '../../contexts';
const mockUseTodoContext = useTodoContext as any;

const mockCreatedTodo: TodoItem = {
  id: '1',
  title: 'New Todo',
  completed: false,
  priority: 'medium',
  tags: [],
  memo: '',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  completedAt: null,
};

const renderTodoForm = () => {
  return render(
    <TestProviders>
      <TodoForm />
    </TestProviders>
  );
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
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show advanced options' })).toBeInTheDocument();
    
    // Advanced options should be hidden by default
    expect(screen.queryByLabelText('Priority')).not.toBeInTheDocument();
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
    const submitButton = screen.getByRole('button', { name: 'Create' });
    
    fireEvent.change(titleInput, { target: { value: 'New Todo' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        priority: 'medium',
        tags: [],
        memo: ''
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
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    
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
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    
    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        priority: 'medium',
        tags: [],
        memo: ''
      });
    });
  });

  it('disables submit button when title is empty', () => {
    renderTodoForm();
    
    const submitButton = screen.getByRole('button', { name: 'Create' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when title is provided', () => {
    renderTodoForm();
    
    const titleInput = screen.getByLabelText('New Todo');
    const submitButton = screen.getByRole('button', { name: 'Create' });
    
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
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    
    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    
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

  describe('Advanced options toggle functionality', () => {
    it('shows advanced options when toggle is clicked', () => {
      renderTodoForm();
      
      const toggleButton = screen.getByRole('button', { name: 'Show advanced options' });
      fireEvent.click(toggleButton);
      
      expect(screen.getByLabelText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Additional Details')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hide advanced options' })).toBeInTheDocument();
    });

    it('hides advanced options when toggle is clicked again', () => {
      renderTodoForm();
      
      const toggleButton = screen.getByRole('button', { name: 'Show advanced options' });
      fireEvent.click(toggleButton);
      
      expect(screen.getByLabelText('Priority')).toBeInTheDocument();
      
      const hideButton = screen.getByRole('button', { name: 'Hide advanced options' });
      fireEvent.click(hideButton);
      
      expect(screen.queryByLabelText('Priority')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show advanced options' })).toBeInTheDocument();
    });

    it('resets advanced panel state after successful creation', async () => {
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
      const toggleButton = screen.getByRole('button', { name: 'Show advanced options' });
      
      // Open advanced panel
      fireEvent.click(toggleButton);
      expect(screen.getByLabelText('Priority')).toBeInTheDocument();
      
      // Create todo
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
      
      await waitFor(() => {
        expect(screen.queryByLabelText('Priority')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Show advanced options' })).toBeInTheDocument();
      });
    });
  });

  describe('Priority functionality (Requirements 6.1, 6.2)', () => {
    it('defaults to medium priority', () => {
      renderTodoForm();
      
      // Open advanced options to access priority
      const toggleButton = screen.getByRole('button', { name: 'Show advanced options' });
      fireEvent.click(toggleButton);
      
      const prioritySelect = screen.getByLabelText('Priority');
      expect(prioritySelect).toHaveValue('medium');
    });

    it('allows selecting different priorities', () => {
      renderTodoForm();
      
      // Open advanced options to access priority
      const toggleButton = screen.getByRole('button', { name: 'Show advanced options' });
      fireEvent.click(toggleButton);
      
      const prioritySelect = screen.getByLabelText('Priority');
      
      fireEvent.change(prioritySelect, { target: { value: 'high' } });
      expect(prioritySelect).toHaveValue('high');
      
      fireEvent.change(prioritySelect, { target: { value: 'low' } });
      expect(prioritySelect).toHaveValue('low');
    });

    it('creates todo with selected priority', async () => {
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
      const toggleButton = screen.getByRole('button', { name: 'Show advanced options' });
      
      // Open advanced options to access priority
      fireEvent.click(toggleButton);
      
      const prioritySelect = screen.getByLabelText('Priority');
      const submitButton = screen.getByRole('button', { name: 'Create' });
      
      fireEvent.change(titleInput, { target: { value: 'High Priority Todo' } });
      fireEvent.change(prioritySelect, { target: { value: 'high' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreateTodo).toHaveBeenCalledWith({
          title: 'High Priority Todo',
          priority: 'high',
          tags: [],
          memo: ''
        });
      });
    });

    it('resets priority to medium after successful creation', async () => {
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
      const toggleButton = screen.getByRole('button', { name: 'Show advanced options' });
      
      // Open advanced options to access priority
      fireEvent.click(toggleButton);
      
      const prioritySelect = screen.getByLabelText('Priority');
      
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
      fireEvent.change(prioritySelect, { target: { value: 'high' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
      
      await waitFor(() => {
        // Need to open advanced options again to check the reset value
        const newToggleButton = screen.getByRole('button', { name: 'Show advanced options' });
        fireEvent.click(newToggleButton);
        
        const newPrioritySelect = screen.getByLabelText('Priority');
        expect(newPrioritySelect).toHaveValue('medium');
      });
    });
  });
});
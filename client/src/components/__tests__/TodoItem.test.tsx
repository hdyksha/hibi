/**
 * TodoItem Component Tests
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TodoItem from '../TodoItem';
import { TodoItem as TodoItemType } from '../../types';

const mockTodo: TodoItemType = {
  id: '1',
  title: 'Test Todo',
  completed: false,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

const mockCompletedTodo: TodoItemType = {
  id: '2',
  title: 'Completed Todo',
  completed: true,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
};

describe('TodoItem', () => {
  const mockOnToggleComplete = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders todo item with title', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('displays creation date', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('displays updated date when different from created date', () => {
    render(
      <TodoItem
        todo={mockCompletedTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('shows incomplete state for uncompleted todo', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    const toggleButton = screen.getByLabelText('Mark as complete');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('○');
  });

  it('shows complete state for completed todo', () => {
    render(
      <TodoItem
        todo={mockCompletedTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    const toggleButton = screen.getByLabelText('Mark as incomplete');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('✓');
  });

  it('applies completed styling to completed todo', () => {
    render(
      <TodoItem
        todo={mockCompletedTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    const todoItem = screen.getByText('Completed Todo').closest('.todo-item');
    expect(todoItem).toHaveClass('todo-item--completed');
  });

  it('calls onToggleComplete when toggle button is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    const toggleButton = screen.getByLabelText('Mark as complete');
    fireEvent.click(toggleButton);

    expect(mockOnToggleComplete).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByLabelText('Delete todo: Test Todo');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
      />
    );

    const toggleButton = screen.getByLabelText('Mark as complete');
    const deleteButton = screen.getByLabelText('Delete todo: Test Todo');

    expect(toggleButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });
});
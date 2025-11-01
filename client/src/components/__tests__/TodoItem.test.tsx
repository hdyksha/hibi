/**
 * TodoItem Component Tests
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TodoItemComponent as TodoItem } from '../TodoItem';
import { TodoItem as TodoItemType } from '../../types';

const mockTodo: TodoItemType = {
  id: '1',
  title: 'Test Todo',
  completed: false,
  priority: 'medium',
  tags: [],
  memo: '',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  completedAt: null,
};

const mockCompletedTodo: TodoItemType = {
  id: '2',
  title: 'Completed Todo',
  completed: true,
  priority: 'high',
  tags: ['work'],
  memo: '',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
  completedAt: '2024-01-01T12:00:00Z',
};

describe('TodoItem', () => {
  const mockOnToggleComplete = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders todo item with title', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
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
        onUpdate={mockOnUpdate}
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
        onUpdate={mockOnUpdate}
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
        onUpdate={mockOnUpdate}
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
        onUpdate={mockOnUpdate}
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
        onUpdate={mockOnUpdate}
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
        onUpdate={mockOnUpdate}
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
        onUpdate={mockOnUpdate}
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
        onUpdate={mockOnUpdate}
      />
    );

    const toggleButton = screen.getByLabelText('Mark as complete');
    const deleteButton = screen.getByLabelText('Delete todo: Test Todo');

    expect(toggleButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  describe('Visual distinction for completed items (Requirement 2.3)', () => {
    it('applies visual distinction styling to completed todos', () => {
      render(
        <TodoItem
          todo={mockCompletedTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Check that completed todo has the completed class
      const todoItem = screen.getByText('Completed Todo').closest('.todo-item');
      expect(todoItem).toHaveClass('todo-item--completed');

      // Check that the title has completed styling
      const title = screen.getByText('Completed Todo');
      expect(title).toHaveClass('todo-item__title--completed');

      // Check that the toggle button has completed styling
      const toggleButton = screen.getByLabelText('Mark as incomplete');
      expect(toggleButton).toHaveClass('todo-item__toggle--completed');
    });

    it('does not apply completed styling to incomplete todos', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Check that incomplete todo does not have completed classes
      const todoItem = screen.getByText('Test Todo').closest('.todo-item');
      expect(todoItem).not.toHaveClass('todo-item--completed');

      const title = screen.getByText('Test Todo');
      expect(title).not.toHaveClass('todo-item__title--completed');

      const toggleButton = screen.getByLabelText('Mark as complete');
      expect(toggleButton).not.toHaveClass('todo-item__toggle--completed');
    });

    it('displays different visual indicators for completed vs incomplete state', () => {
      const { rerender } = render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Check incomplete state indicator
      expect(screen.getByText('○')).toBeInTheDocument();
      expect(screen.queryByText('✓')).not.toBeInTheDocument();

      // Rerender with completed todo
      rerender(
        <TodoItem
          todo={mockCompletedTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      // Check completed state indicator
      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.queryByText('○')).not.toBeInTheDocument();
    });
  });

  describe('Priority functionality (Requirements 6.3, 6.4)', () => {
    it('displays priority badge with correct styling', () => {
      render(
        <TodoItem
          todo={mockCompletedTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const priorityBadge = screen.getByText('High');
      expect(priorityBadge).toBeInTheDocument();
      expect(priorityBadge).toHaveClass('todo-item__priority--high');
    });

    it('applies priority-specific border styling', () => {
      render(
        <TodoItem
          todo={mockCompletedTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const todoItem = screen.getByText('Completed Todo').closest('.todo-item');
      expect(todoItem).toHaveClass('todo-item--priority-high');
    });

    it('shows edit button', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit todo: Test Todo');
      expect(editButton).toBeInTheDocument();
    });

    it('opens edit modal when edit button is clicked', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit todo: Test Todo');
      fireEvent.click(editButton);

      // Modal should be open with task data
      expect(screen.getByText('タスクを編集')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    });
  });

  describe('Modal editing functionality (Requirements 5.1, 5.2, 5.3, 5.4, 5.5)', () => {
    it('opens edit modal when edit button is clicked (Requirement 5.1)', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit todo: Test Todo');
      fireEvent.click(editButton);

      // Should show edit modal
      expect(screen.getByText('タスクを編集')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      expect(screen.getByText('保存')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
    });

    it('displays priority field in modal for todo items', () => {
      render(
        <TodoItem
          todo={mockTodo}
          onToggleComplete={mockOnToggleComplete}
          onDelete={mockOnDelete}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByLabelText('Edit todo: Test Todo');
      fireEvent.click(editButton);

      // Should show priority field since showPriority=true for TodoItem
      expect(screen.getByLabelText('優先度')).toBeInTheDocument();
      const prioritySelect = screen.getByLabelText('優先度') as HTMLSelectElement;
      expect(prioritySelect.value).toBe('medium');
    });
  });
});
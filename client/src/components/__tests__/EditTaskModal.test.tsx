/**
 * EditTaskModal Component Tests
 * Requirements: 5.1, 5.2, 5.3, 9.4
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EditTaskModal } from '../EditTaskModal';
import { TodoItem } from '../../types';

describe('EditTaskModal Component', () => {
  const mockTask: TodoItem = {
    id: '1',
    title: 'Test Task',
    completed: true,
    priority: 'medium',
    tags: ['work', 'important'],
    memo: 'Test memo content',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T17:30:00Z',
    completedAt: '2024-01-15T17:30:00Z',
  };

  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <EditTaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('タスクを編集')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test memo content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <EditTaskModal
        task={mockTask}
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText('タスクを編集')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <EditTaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText('キャンセル'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <EditTaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByLabelText('閉じる'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSave with updated data when save button is clicked', async () => {
    mockOnSave.mockResolvedValue(undefined);

    render(
      <EditTaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Change the title
    const titleInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

    // Click save
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('1', {
        title: 'Updated Task',
        tags: ['work', 'important'],
        memo: 'Test memo content',
      });
    });
  });

  it('shows error when title is empty', async () => {
    render(
      <EditTaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Clear the title
    const titleInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(titleInput, { target: { value: '' } });

    // Click save
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('closes modal without saving when no changes are made', async () => {
    render(
      <EditTaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Click save without making changes
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('handles save errors gracefully', async () => {
    const errorMessage = 'Save failed';
    mockOnSave.mockRejectedValue(new Error(errorMessage));

    render(
      <EditTaskModal
        task={mockTask}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Change the title
    const titleInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

    // Click save
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
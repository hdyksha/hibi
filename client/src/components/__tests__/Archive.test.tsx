/**
 * Archive Component Tests
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */


import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Archive } from '../Archive';
import { todoApiClient } from '../../services';
import { ArchiveGroup } from '../../types';
import { TodoProvider } from '../../contexts/TodoContext';

// Mock the API client
vi.mock('../../services', () => ({
  todoApiClient: {
    getArchive: vi.fn(),
    getTodos: vi.fn(),
    getTags: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    toggleTodoCompletion: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

const mockApiClient = todoApiClient as any;

// Helper function to render Archive with TodoProvider
const renderArchive = (props = {}) => {
  return render(
    <TodoProvider>
      <Archive {...props} />
    </TodoProvider>
  );
};

describe('Archive Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the required methods for TodoProvider
    mockApiClient.getTodos.mockResolvedValue([]);
    mockApiClient.getTags.mockResolvedValue([]);
  });

  const mockArchiveData: ArchiveGroup[] = [
    {
      date: '2024-01-15',
      count: 2,
      tasks: [
        {
          id: '1',
          title: 'Complete project',
          completed: true,
          priority: 'high',
          tags: ['work', 'urgent'],
          memo: 'Important project deadline',
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T17:30:00Z',
          completedAt: '2024-01-15T17:30:00Z',
        },
        {
          id: '2',
          title: 'Review documents',
          completed: true,
          priority: 'medium',
          tags: ['review'],
          memo: '',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T16:00:00Z',
          completedAt: '2024-01-15T16:00:00Z',
        },
      ],
    },
    {
      date: '2024-01-14',
      count: 1,
      tasks: [
        {
          id: '3',
          title: 'Buy groceries',
          completed: true,
          priority: 'low',
          tags: ['personal'],
          memo: 'Milk, bread, eggs',
          createdAt: '2024-01-14T10:00:00Z',
          updatedAt: '2024-01-14T15:00:00Z',
          completedAt: '2024-01-14T15:00:00Z',
        },
      ],
    },
  ];

  it('displays loading state initially', () => {
    mockApiClient.getArchive.mockImplementation(() => new Promise(() => {}));
    
    renderArchive();
    
    expect(screen.getByText('アーカイブを読み込み中...')).toBeInTheDocument();
  });

  it('displays archive groups with completed tasks', async () => {
    mockApiClient.getArchive.mockResolvedValue(mockArchiveData);
    
    renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('アーカイブ')).toBeInTheDocument();
    });

    // Check summary
    expect(screen.getByText('3 件の完了済みタスク')).toBeInTheDocument();

    // Check group headers
    expect(screen.getByText('2 件完了')).toBeInTheDocument();
    expect(screen.getByText('1 件完了')).toBeInTheDocument();

    // Check task titles
    expect(screen.getByText('Complete project')).toBeInTheDocument();
    expect(screen.getByText('Review documents')).toBeInTheDocument();
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    // Check priorities
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();

    // Check tags (using more specific selectors to avoid conflicts with filter tags)
    const archiveTags = document.querySelectorAll('.archive-task-tag');
    const tagTexts = Array.from(archiveTags).map(tag => tag.textContent);
    expect(tagTexts).toContain('work');
    expect(tagTexts).toContain('urgent');
    expect(tagTexts).toContain('review');
    expect(tagTexts).toContain('personal');

    // Check memos
    expect(screen.getByText('Important project deadline')).toBeInTheDocument();
    expect(screen.getByText('Milk, bread, eggs')).toBeInTheDocument();
  });

  it('displays empty state when no completed tasks exist', async () => {
    mockApiClient.getArchive.mockResolvedValue([]);
    
    renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('完了済みのタスクはありません。')).toBeInTheDocument();
    });
  });

  it('displays error state when API call fails', async () => {
    const errorMessage = 'Network error';
    mockApiClient.getArchive.mockRejectedValue(new Error(errorMessage));
    
    renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText(`エラー: ${errorMessage}`)).toBeInTheDocument();
    });

    expect(screen.getByText('再試行')).toBeInTheDocument();
  });

  it('groups tasks by completion date correctly', async () => {
    mockApiClient.getArchive.mockResolvedValue(mockArchiveData);
    
    renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('アーカイブ')).toBeInTheDocument();
    });

    // Verify that tasks are grouped by date
    const groups = screen.getAllByText(/件完了/);
    expect(groups).toHaveLength(2);
    
    // First group should have 2 tasks
    expect(screen.getByText('2 件完了')).toBeInTheDocument();
    
    // Second group should have 1 task
    expect(screen.getByText('1 件完了')).toBeInTheDocument();
  });

  it('displays tasks with proper archive styling without line-through', async () => {
    mockApiClient.getArchive.mockResolvedValue(mockArchiveData);
    
    renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('Complete project')).toBeInTheDocument();
    });

    // Check that task titles have archive styling without line-through
    const taskTitles = screen.getAllByRole('heading', { level: 4 });
    taskTitles.forEach(title => {
      expect(title).toHaveClass('archive-task-title');
      // Verify that the title doesn't have line-through styling in archive view
      const computedStyle = window.getComputedStyle(title);
      expect(computedStyle.textDecoration).not.toContain('line-through');
    });
  });

  it('displays archive-specific visual elements', async () => {
    mockApiClient.getArchive.mockResolvedValue(mockArchiveData);
    
    renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('Complete project')).toBeInTheDocument();
    });

    // Check that archive tasks have the proper CSS classes for styling
    const archiveTasks = document.querySelectorAll('.archive-task');
    expect(archiveTasks.length).toBeGreaterThan(0);
    
    archiveTasks.forEach(task => {
      expect(task).toHaveClass('archive-task');
    });

    // Check that archive groups have proper styling classes
    const archiveGroups = document.querySelectorAll('.archive-group');
    expect(archiveGroups.length).toBeGreaterThan(0);
    
    archiveGroups.forEach(group => {
      expect(group).toHaveClass('archive-group');
    });

    // Verify archive header has proper styling
    const archiveHeader = document.querySelector('.archive-header');
    expect(archiveHeader).toBeInTheDocument();
    expect(archiveHeader).toHaveClass('archive-header');
  });

  it('displays edit buttons for archived tasks', async () => {
    mockApiClient.getArchive.mockResolvedValue(mockArchiveData);
    
    renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('Complete project')).toBeInTheDocument();
    });

    // Check that edit buttons are present for each task
    const editButtons = screen.getAllByLabelText(/Edit task:/);
    expect(editButtons).toHaveLength(3); // 3 tasks in mockArchiveData
    
    // Verify edit buttons have proper attributes
    editButtons.forEach(button => {
      expect(button).toHaveAttribute('title', 'タスクを編集');
      expect(button).toHaveClass('archive-task-edit');
    });
  });

  describe('Archive Filter Functionality', () => {
    beforeEach(() => {
      mockApiClient.getArchive.mockResolvedValue(mockArchiveData);
    });

    it('displays filter component in archive view', async () => {
      renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('アーカイブ')).toBeInTheDocument();
      });

      // Check that filter component is rendered
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      
      // Status filter should be hidden in archive view
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
    });

    it('filters tasks by search text', async () => {
      renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Initially all tasks should be visible
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.getByText('Review documents')).toBeInTheDocument();
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();

      // Search for "project"
      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'project' } });

      // Only "Complete project" should be visible
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.queryByText('Review documents')).not.toBeInTheDocument();
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });

    it('filters tasks by priority', async () => {
      renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Filter by high priority
      const prioritySelect = screen.getByLabelText('Priority');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      // Only high priority task should be visible
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.queryByText('Review documents')).not.toBeInTheDocument();
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });

    it('filters tasks by tags', async () => {
      renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Filter by "work" tag (use the checkbox input specifically)
      const workTagCheckbox = screen.getByRole('checkbox', { name: 'work' });
      fireEvent.click(workTagCheckbox);

      // Only tasks with "work" tag should be visible
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.queryByText('Review documents')).not.toBeInTheDocument();
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });

    it('shows filtered task count', async () => {
      renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('3 件の完了済みタスク')).toBeInTheDocument();
      });

      // Apply a filter
      const prioritySelect = screen.getByLabelText('Priority');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      // Should show filtered count
      expect(screen.getByText('1 / 3 件の完了済みタスク')).toBeInTheDocument();
      expect(screen.getByText('(フィルター適用中)')).toBeInTheDocument();
    });

    it('shows empty state when no tasks match filter', async () => {
      renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Search for something that doesn't exist
      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      // Should show empty filter state
      expect(screen.getByText('フィルター条件に一致するタスクがありません。')).toBeInTheDocument();
    });

    it('clears all filters when clear button is clicked', async () => {
      renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Apply multiple filters
      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'project' } });
      
      const prioritySelect = screen.getByLabelText('Priority');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      // Clear all filters
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);

      // All tasks should be visible again
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.getByText('Review documents')).toBeInTheDocument();
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      
      // Count should be back to original
      expect(screen.getByText('3 件の完了済みタスク')).toBeInTheDocument();
    });

    it('combines multiple filters correctly', async () => {
      renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Apply search and tag filter
      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'Complete' } });
      
      const workTagCheckbox = screen.getByRole('checkbox', { name: 'work' });
      fireEvent.click(workTagCheckbox);

      // Only "Complete project" should match both filters
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.queryByText('Review documents')).not.toBeInTheDocument();
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });

    it('extracts available tags from archive data', async () => {
      renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Check that all tags from archive data are available as filter options
      expect(screen.getByRole('checkbox', { name: 'work' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'urgent' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'review' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'personal' })).toBeInTheDocument();
    });
  });
});
/**
 * Archive Component Tests
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */


import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { Archive } from '../Archive';
import { todoApi, fileApi, httpClient } from '../../services';
import { ArchiveGroup } from '../../types';
import { TodoProvider } from '../../contexts/TodoContext';
import { NetworkProvider } from '../../contexts/NetworkContext';

// Mock the API client
vi.mock('../../services', () => ({
  todoApi: {
    getArchive: vi.fn(),
    getTodos: vi.fn(),
    getTags: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    toggleTodoCompletion: vi.fn(),
    deleteTodo: vi.fn(),
  },
  fileApi: {
    getFiles: vi.fn(),
    switchFile: vi.fn(),
    getCurrentFile: vi.fn(),
  },
  httpClient: {
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
vi.mock('../../hooks/useNetworkStatus', () => ({
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

const mockTodoApi = todoApi as any;

// Helper function to render Archive with NetworkProvider and TodoProvider
const renderArchive = async (props = {}) => {
  let result;
  await act(async () => {
    result = render(
      <NetworkProvider>
        <TodoProvider>
          <Archive {...props} />
        </TodoProvider>
      </NetworkProvider>
    );
    // Wait for all promises to resolve
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  return result;
};

describe('Archive Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the required methods for TodoProvider
    mockTodoApi.getTodos.mockResolvedValue([]);
    mockTodoApi.getTags.mockResolvedValue([]);
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

  it('displays loading state initially', async () => {
    mockTodoApi.getArchive.mockImplementation(() => new Promise(() => {}));
    
    await renderArchive();
    
    expect(screen.getByText('Loading archive...')).toBeInTheDocument();
  });

  it('displays archive groups with completed tasks', async () => {
    mockTodoApi.getArchive.mockResolvedValue(mockArchiveData);
    
    await renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('Complete project')).toBeInTheDocument();
    });

    // Check group headers
    expect(screen.getByText('2 completed')).toBeInTheDocument();
    expect(screen.getByText('1 completed')).toBeInTheDocument();

    // Check task titles
    expect(screen.getByText('Complete project')).toBeInTheDocument();
    expect(screen.getByText('Review documents')).toBeInTheDocument();
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    // Check priorities
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('low')).toBeInTheDocument();

    // Check tags (using more specific selectors to avoid conflicts with filter tags)
    // Check for tags by their text content
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();

    // Check memos
    expect(screen.getByText('Important project deadline')).toBeInTheDocument();
    expect(screen.getByText('Milk, bread, eggs')).toBeInTheDocument();
  });

  it('displays empty state when no completed tasks exist', async () => {
    mockTodoApi.getArchive.mockResolvedValue([]);
    
    await renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('No completed tasks.')).toBeInTheDocument();
    });
  });

  it('displays error state when API call fails', async () => {
    const errorMessage = 'Network error';
    mockTodoApi.getArchive.mockRejectedValue(new Error(errorMessage));
    
    await renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('groups tasks by completion date correctly', async () => {
    mockTodoApi.getArchive.mockResolvedValue(mockArchiveData);
    
    await renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('Complete project')).toBeInTheDocument();
    });

    // Verify that tasks are grouped by date
    const groups = screen.getAllByText(/completed/);
    expect(groups).toHaveLength(2);
    
    // First group should have 2 tasks
    expect(screen.getByText('2 completed')).toBeInTheDocument();
    
    // Second group should have 1 task
    expect(screen.getByText('1 completed')).toBeInTheDocument();
  });

  it('displays tasks with proper archive styling without line-through', async () => {
    mockTodoApi.getArchive.mockResolvedValue(mockArchiveData);
    
    await renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('Complete project')).toBeInTheDocument();
    });

    // Check that task titles have archive styling without line-through
    const taskTitles = screen.getAllByRole('heading', { level: 4 });
    taskTitles.forEach(title => {
      // Verify that the title doesn't have line-through styling in archive view
      expect(title).not.toHaveClass('line-through');
      expect(title).toHaveClass('text-slate-800');
    });
  });

  it('displays archive-specific visual elements', async () => {
    mockTodoApi.getArchive.mockResolvedValue(mockArchiveData);
    
    await renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('Complete project')).toBeInTheDocument();
    });

    // Check that archive tasks are rendered with proper test IDs
    const archiveTasks = screen.getAllByTestId('archive-task');
    expect(archiveTasks.length).toBe(3); // 3 tasks in mockArchiveData
    
    // Check that archive groups are rendered with proper test IDs
    const archiveGroups = screen.getAllByTestId('archive-group');
    expect(archiveGroups.length).toBe(2); // 2 groups in mockArchiveData
    
    // Verify archive filter is present
    const archiveFilter = screen.getByTestId('archive-filter');
    expect(archiveFilter).toBeInTheDocument();
  });

  it('displays edit buttons for archived tasks', async () => {
    mockTodoApi.getArchive.mockResolvedValue(mockArchiveData);
    
    await renderArchive();
    
    await waitFor(() => {
      expect(screen.getByText('Complete project')).toBeInTheDocument();
    });

    // Check that edit buttons are present for each task
    const editButtons = screen.getAllByLabelText(/Edit task:/);
    expect(editButtons).toHaveLength(3); // 3 tasks in mockArchiveData
    
    // Verify edit buttons have proper attributes
    editButtons.forEach(button => {
      expect(button).toHaveAttribute('title', 'Edit task');
      expect(button).toHaveClass('text-slate-400', 'hover:text-slate-600');
    });
  });

  describe('Archive Filter Functionality', () => {
    beforeEach(() => {
      mockTodoApi.getArchive.mockResolvedValue(mockArchiveData);
      // Clear localStorage to prevent filter state interference between tests
      localStorage.clear();
    });

    it('displays filter component in archive view', async () => {
      await renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Check that search input is rendered by default
      expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
      
      // Check that toggle button is rendered
      expect(screen.getByRole('button', { name: 'Show advanced filters' })).toBeInTheDocument();
      
      // Advanced filters should not be visible by default
      expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
      expect(screen.queryByText('Priority')).not.toBeInTheDocument();
      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });

    it('filters tasks by search text', async () => {
      await renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Initially all tasks should be visible
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.getByText('Review documents')).toBeInTheDocument();
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();

      // Search for "project"
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'project' } });

      // Only "Complete project" should be visible
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.queryByText('Review documents')).not.toBeInTheDocument();
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });

    it('filters tasks by priority', async () => {
      await renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Show advanced filters first
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);

      // Filter by high priority
      const prioritySelect = screen.getByLabelText('Priority');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      // Only high priority task should be visible
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.queryByText('Review documents')).not.toBeInTheDocument();
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });

    it('filters tasks by tags', async () => {
      await renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Show advanced filters first
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);

      // Filter by "work" tag (use the checkbox input specifically)
      const workTagCheckbox = screen.getByRole('checkbox', { name: 'work' });
      fireEvent.click(workTagCheckbox);

      // Only tasks with "work" tag should be visible
      expect(screen.getByText('Complete project')).toBeInTheDocument();
      expect(screen.queryByText('Review documents')).not.toBeInTheDocument();
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    });

    it('shows filtered task count', async () => {
      await renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Show advanced filters first
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);

      // Apply a filter
      const prioritySelect = screen.getByLabelText('Priority');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      // Should show only filtered task
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
        expect(screen.queryByText('Review documents')).not.toBeInTheDocument();
        expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
      });
    });

    it('shows empty state when no tasks match filter', async () => {
      await renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Search for something that doesn't exist
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      // Should show empty filter state
      expect(screen.getByText('No tasks match the current filters.')).toBeInTheDocument();
    });

    it('clears all filters when clear button is clicked', async () => {
      await renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Apply multiple filters
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'project' } });
      
      // Show advanced filters first
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      const prioritySelect = screen.getByLabelText('Priority');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });

      // Wait for filters to be applied
      await waitFor(() => {
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });

      // Clear all filters
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);

      // Wait for filters to be cleared and all tasks to be visible again
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
        expect(screen.getByText('Review documents')).toBeInTheDocument();
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });
    });

    it('combines multiple filters correctly', async () => {
      await renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Apply search and tag filter
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'Complete' } });
      
      // Show advanced filters first
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      const workTagCheckbox = screen.getByRole('checkbox', { name: 'work' });
      fireEvent.click(workTagCheckbox);

      // Wait for filters to be applied and only "Complete project" should match both filters
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
        expect(screen.queryByText('Review documents')).not.toBeInTheDocument();
        expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
      });
    });

    it('extracts available tags from archive data', async () => {
      await renderArchive();
      
      await waitFor(() => {
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Show advanced filters first
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);

      // Check that all tags from archive data are available as filter options
      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: 'work' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'urgent' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'review' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'personal' })).toBeInTheDocument();
      });
    });
  });
});
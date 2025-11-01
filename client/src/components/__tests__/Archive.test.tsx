/**
 * Archive Component Tests
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */


import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Archive } from '../Archive';
import { todoApiClient } from '../../services';
import { ArchiveGroup } from '../../types';

// Mock the API client
vi.mock('../../services', () => ({
  todoApiClient: {
    getArchive: vi.fn(),
  },
}));

const mockApiClient = todoApiClient as any;

describe('Archive Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    
    render(<Archive />);
    
    expect(screen.getByText('アーカイブを読み込み中...')).toBeInTheDocument();
  });

  it('displays archive groups with completed tasks', async () => {
    mockApiClient.getArchive.mockResolvedValue(mockArchiveData);
    
    render(<Archive />);
    
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

    // Check tags
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();

    // Check memos
    expect(screen.getByText('Important project deadline')).toBeInTheDocument();
    expect(screen.getByText('Milk, bread, eggs')).toBeInTheDocument();
  });

  it('displays empty state when no completed tasks exist', async () => {
    mockApiClient.getArchive.mockResolvedValue([]);
    
    render(<Archive />);
    
    await waitFor(() => {
      expect(screen.getByText('完了済みのタスクはありません。')).toBeInTheDocument();
    });
  });

  it('displays error state when API call fails', async () => {
    const errorMessage = 'Network error';
    mockApiClient.getArchive.mockRejectedValue(new Error(errorMessage));
    
    render(<Archive />);
    
    await waitFor(() => {
      expect(screen.getByText(`エラー: ${errorMessage}`)).toBeInTheDocument();
    });

    expect(screen.getByText('再試行')).toBeInTheDocument();
  });

  it('groups tasks by completion date correctly', async () => {
    mockApiClient.getArchive.mockResolvedValue(mockArchiveData);
    
    render(<Archive />);
    
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
    
    render(<Archive />);
    
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
    
    render(<Archive />);
    
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
});
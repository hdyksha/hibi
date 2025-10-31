/**
 * Filter Integration Test
 * Requirements: 7.2, 8.4
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from '../App';

// Mock the API client
vi.mock('../services/apiClient', () => ({
  todoApiClient: {
    getTodos: vi.fn().mockResolvedValue([
      {
        id: '1',
        title: 'Work task',
        completed: false,
        priority: 'high',
        tags: ['work', 'urgent'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Personal task',
        completed: true,
        priority: 'low',
        tags: ['personal'],
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      }
    ]),
    getTags: vi.fn().mockResolvedValue(['work', 'personal', 'urgent']),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    toggleTodoCompletion: vi.fn(),
    deleteTodo: vi.fn()
  }
}));

describe('Filter Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter component in the app', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Use more specific selector for Priority in filter section
    const filterSection = screen.getByText('Filters').closest('.filter');
    expect(filterSection).toBeInTheDocument();
    
    // Check for priority select within filter section
    const prioritySelect = screen.getByDisplayValue('All Priorities');
    expect(prioritySelect).toBeInTheDocument();
    
    // Check for tags section in filter
    const filterTagsSection = screen.getAllByText('Tags');
    expect(filterTagsSection.length).toBeGreaterThan(0);
  });

  it('shows available tags from API', async () => {
    render(<App />);

    await waitFor(() => {
      // Check for filter component
      const filterComponent = screen.getByText('Filters').closest('.filter');
      expect(filterComponent).toBeInTheDocument();
      
      // Check for tag checkboxes within filter component
      const workCheckbox = screen.getByRole('checkbox', { name: 'work' });
      const personalCheckbox = screen.getByRole('checkbox', { name: 'personal' });
      const urgentCheckbox = screen.getByRole('checkbox', { name: 'urgent' });
      
      expect(workCheckbox).toBeInTheDocument();
      expect(personalCheckbox).toBeInTheDocument();
      expect(urgentCheckbox).toBeInTheDocument();
    });
  });

  it('allows filtering by search text', async () => {
    const { todoApiClient } = await import('../services/apiClient');
    const mockGetTodos = vi.fn().mockResolvedValue([]);
    vi.mocked(todoApiClient.getTodos).mockImplementation(mockGetTodos);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'work' } });

    await waitFor(() => {
      expect(mockGetTodos).toHaveBeenCalledWith({
        searchText: 'work'
      });
    });
  });
});
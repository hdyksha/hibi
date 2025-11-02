/**
 * ArchiveFilter Component Tests
 * Tests for the archive filter component with collapsible advanced options
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchiveFilter } from '../ArchiveFilter';
import { TodoFilter } from '../../types';

describe('ArchiveFilter', () => {
  const mockOnFilterChange = vi.fn();
  const mockAvailableTags = ['work', 'personal', 'urgent'];

  const defaultProps = {
    filter: {} as TodoFilter,
    availableTags: mockAvailableTags,
    onFilterChange: mockOnFilterChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render search input by default', () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    });

    it('should render toggle button', () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('▼');
    });

    it('should not show advanced filters by default', () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
      expect(screen.queryByText('Priority')).not.toBeInTheDocument();
      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should handle search input changes', async () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          searchText: 'test search'
        });
      });
    });

    it('should clear search text when empty', async () => {
      const filterWithSearch = { searchText: 'existing search' };
      render(<ArchiveFilter {...defaultProps} filter={filterWithSearch} />);
      
      const searchInput = screen.getByDisplayValue('existing search');
      fireEvent.change(searchInput, { target: { value: '' } });
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Advanced Filters Toggle', () => {
    it('should show advanced filters when toggle is clicked', () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('▲');
      expect(toggleButton).toHaveAttribute('aria-label', 'Hide advanced filters');
    });

    it('should hide advanced filters when toggle is clicked again', () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      
      // Show advanced filters
      fireEvent.click(toggleButton);
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      
      // Hide advanced filters
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
    });

    it('should highlight toggle button when advanced filters are active', () => {
      const filterWithPriority = { priority: 'high' as const };
      render(<ArchiveFilter {...defaultProps} filter={filterWithPriority} />);
      
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      expect(toggleButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  describe('Priority Filter', () => {
    it('should handle priority selection', async () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      // Show advanced filters
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      const prioritySelect = screen.getByLabelText('Priority');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          priority: 'high'
        });
      });
    });

    it('should clear priority when "all priorities" is selected', async () => {
      const filterWithPriority = { priority: 'high' as const };
      render(<ArchiveFilter {...defaultProps} filter={filterWithPriority} />);
      
      // Show advanced filters
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      const prioritySelect = screen.getByLabelText('Priority');
      fireEvent.change(prioritySelect, { target: { value: '' } });
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Tag Filter', () => {
    it('should handle tag selection', async () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      // Show advanced filters
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      const workTagCheckbox = screen.getByRole('checkbox', { name: 'work' });
      fireEvent.click(workTagCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          tags: ['work']
        });
      });
    });

    it('should handle multiple tag selection', async () => {
      const { rerender } = render(<ArchiveFilter {...defaultProps} />);
      
      // Show advanced filters
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      const workTagCheckbox = screen.getByRole('checkbox', { name: 'work' });
      fireEvent.click(workTagCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          tags: ['work']
        });
      });
      
      // Update the filter state to simulate the parent component updating
      const updatedFilter = { tags: ['work'] };
      rerender(<ArchiveFilter {...defaultProps} filter={updatedFilter} />);
      
      const personalTagCheckbox = screen.getByRole('checkbox', { name: 'personal' });
      fireEvent.click(personalTagCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          tags: ['work', 'personal']
        });
      });
    });

    it('should handle tag deselection', async () => {
      const filterWithTags = { tags: ['work', 'personal'] };
      render(<ArchiveFilter {...defaultProps} filter={filterWithTags} />);
      
      // Show advanced filters
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      const workTagCheckbox = screen.getByRole('checkbox', { name: 'work' });
      fireEvent.click(workTagCheckbox);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({
          tags: ['personal']
        });
      });
    });

    it('should not show tag filter when no tags are available', () => {
      render(<ArchiveFilter {...defaultProps} availableTags={[]} />);
      
      // Show advanced filters
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    it('should show clear button when filters are active', () => {
      const filterWithSearch = { searchText: 'test' };
      render(<ArchiveFilter {...defaultProps} filter={filterWithSearch} />);
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('should not show clear button when no filters are active', () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
    });

    it('should clear all filters when clear button is clicked', async () => {
      const filterWithMultiple = {
        searchText: 'test',
        priority: 'high' as const,
        tags: ['work']
      };
      render(<ArchiveFilter {...defaultProps} filter={filterWithMultiple} />);
      
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Filter Summary', () => {
    it('should show filter summary when advanced filters are shown and active', () => {
      const filterWithMultiple = {
        searchText: 'test search',
        priority: 'high' as const,
        tags: ['work', 'urgent']
      };
      render(<ArchiveFilter {...defaultProps} filter={filterWithMultiple} />);
      
      // Show advanced filters
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Active Filters:')).toBeInTheDocument();
      expect(screen.getByText('Priority: High')).toBeInTheDocument();
      expect(screen.getByText('Tags: work, urgent')).toBeInTheDocument();
      expect(screen.getByText('Search: "test search"')).toBeInTheDocument();
    });

    it('should not show filter summary when no filters are active', () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      // Show advanced filters
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for toggle button', () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper labels for form elements', () => {
      render(<ArchiveFilter {...defaultProps} />);
      
      // Show advanced filters
      const toggleButton = screen.getByRole('button', { name: 'Show advanced filters' });
      fireEvent.click(toggleButton);
      
      expect(screen.getByLabelText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });
  });
});
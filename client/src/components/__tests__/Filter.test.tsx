/**
 * Filter Component Tests
 * Requirements: 7.2, 8.4
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Filter } from '../Filter';
import { TodoFilter } from '../../types';

describe('Filter Component', () => {
  const mockOnFilterChange = vi.fn();
  const mockAvailableTags = ['work', 'personal', 'urgent'];

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders filter component with all sections', () => {
    const filter: TodoFilter = {};
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    const filter: TodoFilter = {};
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      searchText: 'test search'
    });
  });

  it('handles status filter changes', () => {
    const filter: TodoFilter = {};
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const completedRadio = screen.getByLabelText('Completed');
    fireEvent.click(completedRadio);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      status: 'completed'
    });
  });

  it('handles priority filter changes', () => {
    const filter: TodoFilter = {};
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.change(prioritySelect, { target: { value: 'high' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      priority: 'high'
    });
  });

  it('handles tag filter changes', () => {
    const filter: TodoFilter = {};
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const workTagCheckbox = screen.getByLabelText('work');
    fireEvent.click(workTagCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      tags: ['work']
    });
  });

  it('shows clear all button when filters are active', () => {
    const filter: TodoFilter = {
      status: 'completed',
      priority: 'high',
      searchText: 'test'
    };
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', () => {
    const filter: TodoFilter = {
      status: 'completed',
      priority: 'high',
      searchText: 'test'
    };
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({});
  });

  it('shows active filters summary', () => {
    const filter: TodoFilter = {
      status: 'completed',
      priority: 'high',
      tags: ['work'],
      searchText: 'test'
    };
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    expect(screen.getByText('Status: Completed')).toBeInTheDocument();
    expect(screen.getByText('Priority: High')).toBeInTheDocument();
    expect(screen.getByText('Tags: work')).toBeInTheDocument();
    expect(screen.getByText('Search: "test"')).toBeInTheDocument();
  });

  it('does not show tags section when no tags available', () => {
    const filter: TodoFilter = {};
    
    render(
      <Filter
        filter={filter}
        availableTags={[]}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
  });

  it('hides status filter when hideStatusFilter is true', () => {
    const filter: TodoFilter = {};
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
        hideStatusFilter={true}
      />
    );

    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('All')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Pending')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Completed')).not.toBeInTheDocument();
  });

  it('shows status filter by default when hideStatusFilter is false or undefined', () => {
    const filter: TodoFilter = {};
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
        hideStatusFilter={false}
      />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('All')).toBeInTheDocument();
    expect(screen.getByLabelText('Pending')).toBeInTheDocument();
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
  });

  it('excludes status from active filters summary when hideStatusFilter is true', () => {
    const filter: TodoFilter = {
      status: 'completed',
      priority: 'high',
      searchText: 'test'
    };
    
    render(
      <Filter
        filter={filter}
        availableTags={mockAvailableTags}
        onFilterChange={mockOnFilterChange}
        hideStatusFilter={true}
      />
    );

    expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    expect(screen.queryByText('Status: Completed')).not.toBeInTheDocument();
    expect(screen.getByText('Priority: High')).toBeInTheDocument();
    expect(screen.getByText('Search: "test"')).toBeInTheDocument();
  });
});
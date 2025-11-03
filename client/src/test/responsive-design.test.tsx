/**
 * Responsive Design Tests
 * Tests for mobile-first responsive design implementation
 * Requirements: 2.3, 6.3
 */

import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { App } from '../App';

// Mock the API client to avoid network calls
vi.mock('../services/index', () => ({
  todoApiClient: {
    getTodos: vi.fn().mockResolvedValue([]),
    getTags: vi.fn().mockResolvedValue([]),
    getArchive: vi.fn().mockResolvedValue([]),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'ApiClientError';
    }
  },
}));

describe('Responsive Design Tests', () => {
  it('should have mobile-first responsive classes in header', async () => {
    await act(async () => {
      render(<App />);
    });
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    
    // Check for responsive padding classes
    const headerContainer = header.querySelector('div');
    expect(headerContainer).toHaveClass('px-3', 'sm:px-4', 'md:px-6', 'lg:px-8');
  });

  it('should have touch-friendly button sizes', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Navigation buttons should have minimum touch target size
    const tasksButton = screen.getByRole('button', { name: /tasks/i });
    const archiveButton = screen.getByRole('button', { name: /archive/i });
    
    expect(tasksButton).toHaveClass('min-h-[44px]');
    expect(archiveButton).toHaveClass('min-h-[44px]');
  });

  it('should have responsive layout classes in main content', async () => {
    await act(async () => {
      render(<App />);
    });
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass('px-3', 'sm:px-4', 'md:px-6', 'lg:px-8');
    expect(main).toHaveClass('py-3', 'sm:py-4');
  });

  it('should have responsive grid layout for filter and todo list', async () => {
    let container;
    await act(async () => {
      const result = render(<App />);
      container = result.container;
    });
    
    // Find the grid container using a more specific selector
    const gridContainer = container.querySelector('.flex.flex-col.lg\\:grid .lg\\:col-span-1');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should have responsive text sizes', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // App title should have responsive text sizing
    const title = screen.getByText('Hibi');
    expect(title).toHaveClass('text-xl', 'sm:text-2xl');
  });
});
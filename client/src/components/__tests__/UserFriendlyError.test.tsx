/**
 * UserFriendlyError Component Tests
 * Tests for advanced user-friendly error display component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { UserFriendlyError } from '../UserFriendlyError';

// Mock the error messages utility
vi.mock('../../utils/errorMessages', () => ({
  getUserFriendlyErrorMessage: vi.fn((error) => ({
    message: 'User-friendly error message',
    action: 'Try again'
  })),
  getContextualErrorMessage: vi.fn((error, context) => ({
    message: `Unable to ${context} the task. Please try again.`,
    action: 'Try again'
  }))
}));

describe('UserFriendlyError', () => {
  const mockRetry = vi.fn();
  const mockDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user-friendly error message', () => {
    render(<UserFriendlyError error="Network error" />);
    
    expect(screen.getByText('User-friendly error message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    render(<UserFriendlyError error="Network error" onRetry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    render(<UserFriendlyError error="Network error" onRetry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    await act(async () => {
      fireEvent.click(retryButton);
    });
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('renders dismiss button when onDismiss is provided', () => {
    render(<UserFriendlyError error="Network error" onDismiss={mockDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    render(<UserFriendlyError error="Network error" onDismiss={mockDismiss} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
    fireEvent.click(dismissButton);
    
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows retry count when retries are attempted', async () => {
    const failingRetry = vi.fn().mockRejectedValue(new Error('Retry failed'));
    
    render(<UserFriendlyError error="Network error" onRetry={failingRetry} maxRetries={3} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    await act(async () => {
      fireEvent.click(retryButton);
    });
    
    // Wait for the retry to complete and count to be displayed
    await waitFor(() => {
      expect(screen.getByText(/attempt 1 of 3/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    expect(failingRetry).toHaveBeenCalledTimes(1);
  });

  it('disables retry button when max retries reached', async () => {
    const failingRetry = vi.fn().mockRejectedValue(new Error('Retry failed'));
    
    render(<UserFriendlyError error="Network error" onRetry={failingRetry} maxRetries={1} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    await act(async () => {
      fireEvent.click(retryButton);
    });
    
    // Wait for the retry to complete and max retries message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/maximum retry attempts reached/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // After max retries, the retry button should not be available
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    expect(failingRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during retry', async () => {
    const slowRetry = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<UserFriendlyError error="Network error" onRetry={slowRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    await act(async () => {
      fireEvent.click(retryButton);
    });
    
    expect(screen.getByText(/retrying/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/retrying/i)).not.toBeInTheDocument();
    });
  });

  it('applies banner variant styling', () => {
    render(<UserFriendlyError error="Network error" variant="banner" />);
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveClass('border-l-4', 'border-red-400');
  });

  it('applies inline variant styling', () => {
    render(<UserFriendlyError error="Network error" variant="inline" />);
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveClass('border', 'border-red-200', 'rounded', 'p-3');
  });

  it('applies card variant styling by default', () => {
    render(<UserFriendlyError error="Network error" />);
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveClass('rounded-lg', 'shadow-sm');
  });

  it('shows technical details when requested', () => {
    render(
      <UserFriendlyError 
        error="Network error: connection failed" 
        showTechnicalDetails={true} 
      />
    );
    
    const detailsButton = screen.getByText(/show technical details/i);
    expect(detailsButton).toBeInTheDocument();
    
    fireEvent.click(detailsButton);
    
    expect(screen.getByText('Network error: connection failed')).toBeInTheDocument();
  });

  it('shows refresh page button for fetch context', () => {
    render(<UserFriendlyError error="Network error" context="fetch" onRetry={mockRetry} />);
    
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('handles Error objects', () => {
    const error = new Error('Test error message');
    render(<UserFriendlyError error={error} />);
    
    expect(screen.getByText('User-friendly error message')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<UserFriendlyError error="Network error" className="custom-class" />);
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveClass('custom-class');
  });

  it('uses contextual error messages when context is provided', async () => {
    const { getContextualErrorMessage } = await import('../../utils/errorMessages');
    
    render(<UserFriendlyError error="Network error" context="create" />);
    
    expect(getContextualErrorMessage).toHaveBeenCalledWith('Network error', 'create', undefined);
  });

  it('passes error type to message utility', async () => {
    const { getUserFriendlyErrorMessage } = await import('../../utils/errorMessages');
    
    render(<UserFriendlyError error="Network error" errorType="network" />);
    
    expect(getUserFriendlyErrorMessage).toHaveBeenCalledWith('Network error', 'network');
  });
});
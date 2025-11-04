/**
 * ErrorMessage Component Tests
 * Tests for error message components with Tailwind styling and user-friendly messages
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorMessage, InlineErrorMessage } from '../ErrorMessage';

// Mock the error messages utility
vi.mock('../../utils/errorMessages', () => ({
  getUserFriendlyErrorMessage: vi.fn((error) => ({
    message: 'User-friendly error message',
    action: 'Try again'
  }))
}));

describe('ErrorMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user-friendly error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    
    expect(screen.getByText('User-friendly error message')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided and action is available', () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage message="Error occurred" onRetry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('uses custom retry label when provided', () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage message="Test Error" onRetry={mockRetry} retryLabel="Custom Retry" />);
    
    expect(screen.getByRole('button', { name: /custom retry/i })).toBeInTheDocument();
  });

  it('passes error type to message utility', async () => {
    const { getUserFriendlyErrorMessage } = await import('../../utils/errorMessages');
    
    render(<ErrorMessage message="Network error" errorType="network" />);
    
    expect(getUserFriendlyErrorMessage).toHaveBeenCalledWith('Network error', 'network');
  });

  it('applies compact variant styling', () => {
    render(<ErrorMessage message="Test Error Message" variant="compact" />);
    
    // Check that compact styling is applied by looking for the user-friendly error message
    const errorText = screen.getByText('User-friendly error message');
    const container = errorText.closest('.bg-red-50');
    expect(container).toHaveClass('p-3');
  });
});

describe('InlineErrorMessage', () => {
  it('renders user-friendly inline error message', () => {
    render(<InlineErrorMessage message="Validation error" />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('User-friendly error message')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InlineErrorMessage message="Error" className="custom-class" />);
    
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('passes error type to message utility', async () => {
    const { getUserFriendlyErrorMessage } = await import('../../utils/errorMessages');
    
    render(<InlineErrorMessage message="Validation error" errorType="validation" />);
    
    expect(getUserFriendlyErrorMessage).toHaveBeenCalledWith('Validation error', 'validation');
  });

  it('shows technical details when requested', () => {
    render(<InlineErrorMessage message="Technical error" showTechnicalDetails={true} />);
    
    const detailsButton = screen.getByText(/technical details/i);
    expect(detailsButton).toBeInTheDocument();
  });
});
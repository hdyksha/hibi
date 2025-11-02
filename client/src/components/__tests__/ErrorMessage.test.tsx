/**
 * ErrorMessage Component Tests
 * Tests for error message components with Tailwind styling
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorMessage, InlineErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage message="Error occurred" onRetry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error occurred" />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses custom retry label', () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage message="Test Error" onRetry={mockRetry} retryLabel="Try Again" />);
    
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('applies compact variant styling', () => {
    render(<ErrorMessage message="Test Error Message" variant="compact" />);
    
    // Check that compact styling is applied by looking for the specific error message
    const errorText = screen.getByText('Test Error Message');
    const container = errorText.closest('.bg-red-50');
    expect(container).toHaveClass('p-3');
  });
});

describe('InlineErrorMessage', () => {
  it('renders inline error message', () => {
    render(<InlineErrorMessage message="Validation error" />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Validation error')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InlineErrorMessage message="Error" className="custom-class" />);
    
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
});
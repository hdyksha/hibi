/**
 * LoadingSpinner Component Tests
 * Tests for loading spinner components with Tailwind styling
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, InlineLoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading todos..." />);
    
    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4');
    
    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    expect(screen.getByRole('status').parentElement).toHaveClass('custom-class');
  });
});

describe('InlineLoadingSpinner', () => {
  it('renders inline spinner', () => {
    render(<InlineLoadingSpinner />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('animate-spin');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<InlineLoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4');
    
    rerender(<InlineLoadingSpinner size="md" />);
    expect(screen.getByRole('status')).toHaveClass('w-5', 'h-5');
  });
});
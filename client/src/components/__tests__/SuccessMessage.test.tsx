/**
 * SuccessMessage Component Tests
 * Tests for success message components with Tailwind styling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SuccessMessage, InlineSuccessMessage } from '../SuccessMessage';

describe('SuccessMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders success message', () => {
    render(<SuccessMessage message="Operation completed successfully" autoHide={false} />);
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('auto-hides after specified delay', async () => {
    const mockOnHide = vi.fn();
    render(
      <SuccessMessage 
        message="Test Success" 
        autoHide={true} 
        autoHideDelay={1000} 
        onHide={mockOnHide} 
      />
    );
    
    expect(screen.getByText('Test Success')).toBeInTheDocument();
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('shows close button when autoHide is false', () => {
    render(<SuccessMessage message="Test Success" autoHide={false} />);
    
    const closeButton = screen.getByRole('button', { name: /close success message/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('hides when close button is clicked', () => {
    const mockOnHide = vi.fn();
    render(<SuccessMessage message="Test Success" autoHide={false} onHide={mockOnHide} />);
    
    const closeButton = screen.getByRole('button', { name: /close success message/i });
    fireEvent.click(closeButton);
    
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('applies compact variant styling', () => {
    render(<SuccessMessage message="Test Success Message" variant="compact" autoHide={false} />);
    
    // Check that compact styling is applied by looking for the specific success message
    const successText = screen.getByText('Test Success Message');
    const container = successText.closest('.bg-green-50');
    expect(container).toHaveClass('p-3');
  });
});

describe('InlineSuccessMessage', () => {
  it('renders inline success message', () => {
    render(<InlineSuccessMessage message="Task completed" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Task completed')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InlineSuccessMessage message="Success" className="custom-class" />);
    
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });
});
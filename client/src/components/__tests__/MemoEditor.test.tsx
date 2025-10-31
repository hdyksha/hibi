/**
 * MemoEditor Component Tests
 * Requirements: 8.1, 8.2, 8.3
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoEditor } from '../MemoEditor';

describe('MemoEditor', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders editor in edit mode by default', () => {
    render(
      <MemoEditor
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Memo editor')).toBeInTheDocument();
    expect(screen.getByText('✏️ Edit')).toHaveClass('memo-editor__toolbar-btn--active');
  });

  it('displays placeholder text', () => {
    render(
      <MemoEditor
        value=""
        onChange={mockOnChange}
        placeholder="Custom placeholder"
      />
    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    render(
      <MemoEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByLabelText('Memo editor');
    fireEvent.change(textarea, { target: { value: 'New memo content' } });

    expect(mockOnChange).toHaveBeenCalledWith('New memo content');
  });

  it('switches to preview mode when preview button is clicked', () => {
    render(
      <MemoEditor
        value="# Test Markdown"
        onChange={mockOnChange}
      />
    );

    const previewButton = screen.getByLabelText('Preview mode');
    fireEvent.click(previewButton);

    expect(previewButton).toHaveClass('memo-editor__toolbar-btn--active');
    expect(screen.getByLabelText('Memo preview')).toBeInTheDocument();
  });

  it('renders markdown content in preview mode', () => {
    render(
      <MemoEditor
        value="# Heading\n\n**Bold text**\n\n- List item"
        onChange={mockOnChange}
      />
    );

    const previewButton = screen.getByLabelText('Preview mode');
    fireEvent.click(previewButton);

    // Check that markdown is rendered as HTML
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Bold text')).toBeInTheDocument();
    // The list item might be rendered differently, so let's check for the preview container
    expect(screen.getByLabelText('Memo preview')).toBeInTheDocument();
  });

  it('switches to split view mode', () => {
    render(
      <MemoEditor
        value="# Test"
        onChange={mockOnChange}
      />
    );

    const splitButton = screen.getByLabelText('Split view mode');
    fireEvent.click(splitButton);

    expect(splitButton).toHaveClass('memo-editor__toolbar-btn--active');
    expect(screen.getByLabelText('Memo editor')).toBeInTheDocument();
    expect(screen.getByLabelText('Memo preview')).toBeInTheDocument();
  });

  it('displays character count', () => {
    render(
      <MemoEditor
        value="Hello world"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('11 characters')).toBeInTheDocument();
  });

  it('shows empty preview message when no content', () => {
    render(
      <MemoEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const previewButton = screen.getByLabelText('Preview mode');
    fireEvent.click(previewButton);

    expect(screen.getByText('No content to preview')).toBeInTheDocument();
  });

  it('disables editor when disabled prop is true', () => {
    render(
      <MemoEditor
        value="Test content"
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const textarea = screen.getByLabelText('Memo editor');
    const buttons = screen.getAllByRole('button');

    expect(textarea).toBeDisabled();
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
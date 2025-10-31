/**
 * TagInput Component Tests
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TagInput } from '../TagInput';

describe('TagInput Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with empty tags', () => {
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Add tags...');
  });

  it('displays existing tags', () => {
    const tags = ['work', 'urgent'];
    render(<TagInput tags={tags} onChange={mockOnChange} />);
    
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('adds tag when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(input, 'new-tag');
      await user.keyboard('{Enter}');
    });
    
    expect(mockOnChange).toHaveBeenCalledWith(['new-tag']);
  });

  it('adds tag when comma is pressed', async () => {
    const user = userEvent.setup();
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(input, 'new-tag,');
    });
    
    expect(mockOnChange).toHaveBeenCalledWith(['new-tag']);
  });

  it('adds tag when Add button is clicked', async () => {
    const user = userEvent.setup();
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(input, 'new-tag');
    });
    
    const addButton = screen.getByRole('button', { name: 'Add tag' });
    
    await act(async () => {
      await user.click(addButton);
    });
    
    expect(mockOnChange).toHaveBeenCalledWith(['new-tag']);
  });

  it('removes tag when remove button is clicked', async () => {
    const user = userEvent.setup();
    const tags = ['work', 'urgent'];
    render(<TagInput tags={tags} onChange={mockOnChange} />);
    
    const removeButton = screen.getByRole('button', { name: 'Remove tag: work' });
    
    await act(async () => {
      await user.click(removeButton);
    });
    
    expect(mockOnChange).toHaveBeenCalledWith(['urgent']);
  });

  it('prevents adding empty tags', async () => {
    const user = userEvent.setup();
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(input, '   ');
      await user.keyboard('{Enter}');
    });
    
    expect(mockOnChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Tag cannot be empty')).toBeInTheDocument();
    });
  });

  it('prevents adding duplicate tags', async () => {
    const user = userEvent.setup();
    const tags = ['work'];
    render(<TagInput tags={tags} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(input, 'WORK');
      await user.keyboard('{Enter}');
    });
    
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(screen.getByText('Tag already exists')).toBeInTheDocument();
  });

  it('prevents adding tags longer than 50 characters', async () => {
    const user = userEvent.setup();
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    const longTag = 'a'.repeat(51);
    const input = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(input, longTag);
      await user.keyboard('{Enter}');
    });
    
    expect(mockOnChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Tag cannot exceed 50 characters')).toBeInTheDocument();
    });
  });

  it('prevents adding more than maxTags', async () => {
    const user = userEvent.setup();
    const tags = ['tag1', 'tag2'];
    render(<TagInput tags={tags} onChange={mockOnChange} maxTags={2} />);
    
    const input = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(input, 'tag3');
      await user.keyboard('{Enter}');
    });
    
    expect(mockOnChange).not.toHaveBeenCalled();
    expect(screen.getByText('Maximum 2 tags allowed')).toBeInTheDocument();
  });

  it('removes last tag when backspace is pressed on empty input', async () => {
    const user = userEvent.setup();
    const tags = ['work', 'urgent'];
    render(<TagInput tags={tags} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    
    await act(async () => {
      await user.click(input);
      await user.keyboard('{Backspace}');
    });
    
    expect(mockOnChange).toHaveBeenCalledWith(['work']);
  });

  it('clears error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<TagInput tags={[]} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    
    await act(async () => {
      await user.type(input, '   ');
      await user.keyboard('{Enter}');
    });
    
    await waitFor(() => {
      expect(screen.getByText('Tag cannot be empty')).toBeInTheDocument();
    });
    
    await act(async () => {
      await user.type(input, 'valid-tag');
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Tag cannot be empty')).not.toBeInTheDocument();
    });
  });

  it('shows tag count', () => {
    const tags = ['work', 'urgent'];
    render(<TagInput tags={tags} onChange={mockOnChange} maxTags={5} />);
    
    expect(screen.getByText(/2\/5 tags used/)).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<TagInput tags={[]} onChange={mockOnChange} disabled={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('uses custom placeholder', () => {
    render(<TagInput tags={[]} onChange={mockOnChange} placeholder="Custom placeholder" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
  });

  it('applies custom className', () => {
    const { container } = render(<TagInput tags={[]} onChange={mockOnChange} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('tag-input', 'custom-class');
  });
});
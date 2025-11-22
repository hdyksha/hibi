/**
 * TodoFormBasic Component
 * Handles basic todo form fields: title input and submit button
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { InlineLoadingSpinner } from '../';

/**
 * Props for TodoFormBasic component
 */
export interface TodoFormBasicProps {
  /** Current title value */
  title: string;
  /** Callback function when title changes */
  onTitleChange: (value: string) => void;
  /** Callback function when form is submitted */
  onSubmit: (event: React.FormEvent) => void;
  /** Callback function to toggle advanced options visibility */
  onToggleAdvanced: () => void;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Whether advanced options are visible */
  showAdvanced: boolean;
  /** Error message to display, if any */
  error?: string | null;
}

export const TodoFormBasic: React.FC<TodoFormBasicProps> = ({
  title,
  onTitleChange,
  onSubmit,
  onToggleAdvanced,
  isSubmitting,
  showAdvanced,
  error,
}) => {
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value);
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <label 
            htmlFor="todo-title" 
            className="text-base sm:text-lg font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            New Todo
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-stretch">
            <Input
              id="todo-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter todo title..."
              error={error || undefined}
              disabled={isSubmitting}
              maxLength={200}
              required
              fullWidth
              className="flex-1"
            />
            <button
              type="button"
              onClick={onToggleAdvanced}
              className={`px-3 rounded-lg cursor-pointer text-sm transition-all duration-200 min-w-[48px] h-[48px] flex items-center justify-center ${
                isSubmitting ? 'cursor-not-allowed opacity-60' : 'focus:outline-none focus:ring-2'
              }`}
              style={{
                backgroundColor: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              disabled={isSubmitting}
              aria-expanded={showAdvanced}
              aria-label={showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
            >
              {showAdvanced ? '▲' : '▼'}
            </button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <InlineLoadingSpinner size="sm" />
                  <span className="whitespace-nowrap">Creating...</span>
                </span>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

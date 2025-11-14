/**
 * TodoFormBasic Component
 * Handles basic todo form fields: title input and submit button
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

/**
 * Props for TodoFormBasic component
 * Optimistic UI - no loading state needed
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
  /** Whether advanced options are visible */
  showAdvanced: boolean;
  /** Whether to show success animation */
  showSuccess?: boolean;
  /** Error message to display, if any */
  error?: string | null;
}

export const TodoFormBasic: React.FC<TodoFormBasicProps> = ({
  title,
  onTitleChange,
  onSubmit,
  onToggleAdvanced,
  showAdvanced,
  showSuccess = false,
  error,
}) => {
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value);
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <label htmlFor="todo-title" className="text-base sm:text-lg font-semibold text-slate-800">
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
              maxLength={200}
              required
              fullWidth
              className="flex-1"
            />
            <button
              type="button"
              onClick={onToggleAdvanced}
              className="px-3 bg-slate-100 border border-slate-300 rounded-lg cursor-pointer text-sm text-slate-600 transition-all duration-200 min-w-[48px] h-[48px] flex items-center justify-center hover:bg-slate-200 hover:border-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 active:bg-slate-300"
              aria-expanded={showAdvanced}
              aria-label={showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
            >
              {showAdvanced ? '▲' : '▼'}
            </button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!title.trim()}
              className={showSuccess ? '!bg-green-600 !border-green-600 hover:!bg-green-700' : ''}
            >
              {showSuccess ? (
                <span className="flex items-center gap-2 animate-enter">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="whitespace-nowrap">Added!</span>
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

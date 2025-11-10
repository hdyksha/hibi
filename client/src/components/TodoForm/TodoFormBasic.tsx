/**
 * TodoFormBasic Component
 * Handles basic todo form fields: title input and submit button
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { InlineLoadingSpinner } from '../';

export interface TodoFormBasicProps {
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleAdvanced: () => void;
  isSubmitting: boolean;
  showAdvanced: boolean;
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
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(e.target.value);
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
              disabled={isSubmitting}
              maxLength={200}
              required
              fullWidth
              className="flex-1"
            />
            <button
              type="button"
              onClick={onToggleAdvanced}
              className={`px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg cursor-pointer text-sm text-slate-600 transition-all duration-200 min-w-[48px] min-h-[48px] flex items-center justify-center ${
                isSubmitting 
                  ? 'bg-slate-50 cursor-not-allowed opacity-60' 
                  : 'hover:bg-slate-200 hover:border-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 active:bg-slate-300'
              }`}
              disabled={isSubmitting}
              aria-expanded={showAdvanced}
              aria-label={showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
            >
              {showAdvanced ? '▲' : '▼'}
            </button>
          </div>
        </div>

        <div className="flex justify-start mt-3 sm:mt-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <InlineLoadingSpinner size="sm" />
                Creating...
              </span>
            ) : (
              'Create Todo'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

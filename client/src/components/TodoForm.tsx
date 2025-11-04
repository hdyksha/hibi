/**
 * TodoForm Component
 * Form for creating new todo items with validation
 * Requirements: 1.1, 1.2, 1.3, 6.1, 6.2
 */

import React, { useState } from 'react';
import { CreateTodoItemInput, Priority } from '../types';
import { useTodoContext } from '../contexts';
import { TagInput } from './TagInput';
import { MemoEditor } from './MemoEditor';
import { InlineErrorMessage, InlineLoadingSpinner, UserFriendlyError } from './';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface TodoFormProps {
  className?: string;
}

export const TodoForm: React.FC<TodoFormProps> = ({ className }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { createTodo } = useTodoContext();

  const validateTitle = (title: string): ValidationResult => {
    if (!title.trim()) {
      return { isValid: false, error: 'Title is required' };
    }
    if (title.trim().length > 200) {
      return { isValid: false, error: 'Title must be 200 characters or less' };
    }
    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous error
    setError(null);

    // Validate title
    const validationResult = validateTitle(title);
    if (!validationResult.isValid) {
      setError(validationResult.error || 'Validation failed');
      return;
    }

    try {
      setIsSubmitting(true);

      const input: CreateTodoItemInput = {
        title: title.trim(),
        priority: priority,
        tags: tags,
        memo: memo.trim()
      };

      await createTodo(input);

      // Clear form on success
      setTitle('');
      setPriority('medium');
      setTags([]);
      setMemo('');
      setShowAdvanced(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as Priority);
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  return (
    <form
      className={`bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-xl shadow-lg overflow-hidden mb-4 sm:mb-6 ${className || ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <label htmlFor="todo-title" className="text-base sm:text-lg font-semibold text-slate-800">
            New Todo
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-stretch">
            <input
              id="todo-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter todo title..."
              className={`flex-1 px-3 sm:px-4 py-3 border rounded-lg text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 ${
                error 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/25' 
                  : 'border-slate-300 hover:border-slate-400'
              } ${isSubmitting ? 'bg-slate-50 cursor-not-allowed opacity-60' : 'bg-white'}`}
              disabled={isSubmitting}
              maxLength={200}
              required
            />
            <button
              type="button"
              onClick={toggleAdvanced}
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
          {error && (
            <InlineErrorMessage 
              message={error} 
              errorType="validation"
              className="mt-1" 
            />
          )}
        </div>

        <div className="flex justify-start mt-3 sm:mt-4">
          <button
            type="submit"
            className={`w-full sm:w-auto px-6 py-3 bg-blue-600 text-white border-none rounded-lg text-sm sm:text-base font-medium cursor-pointer transition-all duration-200 shadow-md min-h-[48px] ${
              isSubmitting || !title.trim()
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : 'hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:bg-blue-800'
            }`}
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
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-6 animate-fade-in">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-slate-700 m-0">Additional Details</h3>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="todo-priority" className="text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                id="todo-priority"
                value={priority}
                onChange={handlePriorityChange}
                className={`px-3 sm:px-4 py-3 border border-slate-300 rounded-lg text-sm sm:text-base bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 min-h-[48px] ${
                  isSubmitting ? 'bg-slate-50 cursor-not-allowed opacity-60' : 'hover:border-slate-400'
                }`}
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Tags
              </label>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="Add tags (press Enter or comma to add)"
                disabled={isSubmitting}
                maxTags={10}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Memo
              </label>
              <MemoEditor
                value={memo}
                onChange={setMemo}
                placeholder="Add memo in markdown format..."
                disabled={isSubmitting}
                className="w-full min-h-24 sm:min-h-32 max-h-48 sm:max-h-72"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};


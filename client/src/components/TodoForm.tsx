/**
 * TodoForm Component
 * Form for creating new todo items with validation
 * Requirements: 1.1, 1.2, 1.3, 6.1, 6.2
 */

import React, { useState } from 'react';
import { CreateTodoItemInput, Priority } from '../types';
import { useTodoContext } from '../contexts';
import TagInput from './TagInput';
import './TodoForm.css';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface TodoFormProps {
  className?: string;
}

const TodoForm: React.FC<TodoFormProps> = ({ className }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        tags: tags
      };

      await createTodo(input);

      // Clear form on success
      setTitle('');
      setPriority('medium');
      setTags([]);
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

  return (
    <form
      className={`todo-form ${className || ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="todo-form__field">
        <label htmlFor="todo-title" className="todo-form__label">
          New Todo
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter todo title..."
          className={`todo-form__input ${error ? 'todo-form__input--error' : ''}`}
          disabled={isSubmitting}
          maxLength={200}
          required
        />
        {error && (
          <div className="todo-form__error" role="alert">
            {error}
          </div>
        )}
      </div>

      <div className="todo-form__field">
        <label htmlFor="todo-priority" className="todo-form__label">
          Priority
        </label>
        <select
          id="todo-priority"
          value={priority}
          onChange={handlePriorityChange}
          className="todo-form__select"
          disabled={isSubmitting}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="todo-form__field">
        <label className="todo-form__label">
          Tags
        </label>
        <TagInput
          tags={tags}
          onChange={setTags}
          placeholder="Add tags (press Enter or comma to add)"
          disabled={isSubmitting}
          maxTags={10}
          className="todo-form__tag-input"
        />
      </div>

      <button
        type="submit"
        className="todo-form__submit"
        disabled={isSubmitting || !title.trim()}
      >
        {isSubmitting ? 'Creating...' : 'Create Todo'}
      </button>
    </form>
  );
};

export default TodoForm;
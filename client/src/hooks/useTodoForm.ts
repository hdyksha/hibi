/**
 * Custom hook for managing TodoForm state, validation, and submission
 * Requirements: 2.2, 5.2
 */

import { useState, useCallback } from 'react';
import { CreateTodoItemInput, Priority } from '../types';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface UseTodoFormOptions {
  onSubmit: (input: CreateTodoItemInput) => Promise<unknown>;
  initialPriority?: Priority;
}

interface UseTodoFormReturn {
  // Form state
  title: string;
  priority: Priority;
  tags: string[];
  memo: string;
  showAdvanced: boolean;
  
  // UI state
  isSubmitting: boolean;
  error: string | null;
  
  // Form handlers
  setTitle: (title: string) => void;
  setPriority: (priority: Priority) => void;
  setTags: (tags: string[]) => void;
  setMemo: (memo: string) => void;
  toggleAdvanced: () => void;
  
  // Form actions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePriorityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  resetForm: () => void;
  
  // Validation
  validateTitle: (title: string) => ValidationResult;
}

/**
 * Custom hook for managing todo form state and logic
 * Extracts form management, validation, and submission logic from TodoForm component
 */
export const useTodoForm = ({ 
  onSubmit, 
  initialPriority = 'medium' 
}: UseTodoFormOptions): UseTodoFormReturn => {
  // Form state
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [tags, setTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates the title field
   * Requirements: 1.1, 1.2
   */
  const validateTitle = useCallback((title: string): ValidationResult => {
    if (!title.trim()) {
      return { isValid: false, error: 'Title is required' };
    }
    if (title.trim().length > 200) {
      return { isValid: false, error: 'Title must be 200 characters or less' };
    }
    return { isValid: true };
  }, []);

  /**
   * Resets the form to initial state
   */
  const resetForm = useCallback(() => {
    setTitle('');
    setPriority(initialPriority);
    setTags([]);
    setMemo('');
    setShowAdvanced(false);
    setError(null);
  }, [initialPriority]);

  /**
   * Handles form submission with validation
   * Requirements: 2.2, 5.2
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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

      await onSubmit(input);

      // Clear form on success
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, priority, tags, memo, onSubmit, validateTitle, resetForm]);

  /**
   * Handles title input change and clears error
   */
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  /**
   * Handles priority select change
   */
  const handlePriorityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as Priority);
  }, []);

  /**
   * Toggles advanced options visibility
   */
  const toggleAdvanced = useCallback(() => {
    setShowAdvanced(prev => !prev);
  }, []);

  return {
    // Form state
    title,
    priority,
    tags,
    memo,
    showAdvanced,
    
    // UI state
    isSubmitting,
    error,
    
    // Form handlers
    setTitle,
    setPriority,
    setTags,
    setMemo,
    toggleAdvanced,
    
    // Form actions
    handleSubmit,
    handleTitleChange,
    handlePriorityChange,
    resetForm,
    
    // Validation
    validateTitle,
  };
};

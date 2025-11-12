/**
 * Custom hook for managing TodoForm state, validation, and submission
 * Requirements: 2.2, 5.2
 */

import { useState, useCallback } from 'react';
import { CreateTodoItemInput, Priority, isPriority } from '../types';

/**
 * Result of a validation check
 */
interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Options for configuring the useTodoForm hook
 */
interface UseTodoFormOptions {
  /** Callback function to handle form submission */
  onSubmit: (input: CreateTodoItemInput) => Promise<unknown>;
  /** Initial priority value (defaults to 'medium') */
  initialPriority?: Priority;
}

/**
 * Return value from useTodoForm hook
 */
interface UseTodoFormReturn {
  // Form state
  /** Current title value */
  title: string;
  /** Current priority value */
  priority: Priority;
  /** Current tags array */
  tags: string[];
  /** Current memo content */
  memo: string;
  /** Whether advanced options are visible */
  showAdvanced: boolean;
  
  // UI state
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Current error message, if any */
  error: string | null;
  
  // Form handlers
  /** Set the title value */
  setTitle: (title: string) => void;
  /** Set the priority value */
  setPriority: (priority: Priority) => void;
  /** Set the tags array */
  setTags: (tags: string[]) => void;
  /** Set the memo content */
  setMemo: (memo: string) => void;
  /** Toggle advanced options visibility */
  toggleAdvanced: () => void;
  
  // Form actions
  /** Handle form submission */
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  /** Handle title input change */
  handleTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handle priority select change */
  handlePriorityChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Reset form to initial state */
  resetForm: () => void;
  
  // Validation
  /** Validate the title field */
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
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

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
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create todo');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, priority, tags, memo, onSubmit, validateTitle, resetForm]);

  /**
   * Handles title input change and clears error
   */
  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  /**
   * Handles priority select change
   */
  const handlePriorityChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (isPriority(value)) {
      setPriority(value);
    }
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

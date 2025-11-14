/**
 * TodoForm Component
 * Form for creating new todo items with validation
 * Refactored to use subcomponents and custom hook
 * Uses optimistic UI pattern for immediate feedback
 * Requirements: 2.1, 2.2, 5.1, 5.2
 */

import React from 'react';
import { useTodoContext } from '../contexts';
import { useTodoForm } from '../hooks/useTodoForm';
import { TodoFormBasic } from './TodoForm/TodoFormBasic';
import { TodoFormAdvanced } from './TodoForm/TodoFormAdvanced';

interface TodoFormProps {
  className?: string;
}

export const TodoForm: React.FC<TodoFormProps> = ({ className }) => {
  const { addTodoOptimistic } = useTodoContext();
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Use custom hook for form state and logic
  const {
    title,
    priority,
    tags,
    memo,
    showAdvanced,
    error,
    handleSubmit,
    handleTitleChange,
    setPriority,
    setTags,
    setMemo,
    toggleAdvanced,
  } = useTodoForm({
    onSubmit: async (input) => {
      // Show success animation immediately (optimistic UI)
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 300);
      
      // Call API in background
      await addTodoOptimistic(input);
    },
  });

  return (
    <div
      className={`bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-xl shadow-lg overflow-hidden mb-4 sm:mb-6 transition-all duration-200 ${
        showSuccess ? 'ring-2 ring-green-500/50' : ''
      } ${className || ''}`}
    >
      <TodoFormBasic
        title={title}
        onTitleChange={(value) => {
          // Create a synthetic event object that matches the expected type
          const syntheticEvent: React.ChangeEvent<HTMLInputElement> = {
            target: { value } as HTMLInputElement,
            currentTarget: { value } as HTMLInputElement,
          } as React.ChangeEvent<HTMLInputElement>;
          handleTitleChange(syntheticEvent);
        }}
        onSubmit={handleSubmit}
        onToggleAdvanced={toggleAdvanced}
        showAdvanced={showAdvanced}
        showSuccess={showSuccess}
        error={error}
      />

      {showAdvanced && (
        <TodoFormAdvanced
          priority={priority}
          tags={tags}
          memo={memo}
          onPriorityChange={setPriority}
          onTagsChange={setTags}
          onMemoChange={setMemo}
        />
      )}
    </div>
  );
};


/**
 * TodoItemHeader Component
 * Displays the completion checkbox, title, and priority badge
 * Enhanced with smooth checkbox state change animation (150ms)
 * Requirements: 2.1, 2.2, 2.3, 5.1
 */

import React from 'react';
import { TodoItem, Priority } from '../../types';
import { cn, todoItem } from '../../utils/styles';

/**
 * Props for TodoItemHeader component
 */
interface TodoItemHeaderProps {
  /** The todo item to display */
  todo: TodoItem;
  /** Callback function to toggle the completion status of the todo */
  onToggleComplete: (id: string) => void;
}

export const TodoItemHeader: React.FC<TodoItemHeaderProps> = ({
  todo,
  onToggleComplete,
}) => {
  const handleToggleClick = () => {
    onToggleComplete(todo.id);
  };

  const priorityStyles: Record<Priority, string> = {
    high: todoItem.priorityBadge.high,
    medium: todoItem.priorityBadge.medium,
    low: todoItem.priorityBadge.low,
  };

  return (
    <div className={todoItem.layout.headerContainer}>
      {/* Completion Toggle - Touch optimized with smooth animation */}
      <button
        className={cn(
          todoItem.checkbox.base,
          todo.completed ? todoItem.checkbox.completed : todoItem.checkbox.uncompleted,
          // Checkbox state change animation (150ms transition)
          'transition-all duration-150 ease-in-out',
          // Scale effect on state change
          'transform hover:scale-110 active:scale-95'
        )}
        onClick={handleToggleClick}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        <span className={cn(
          'transition-all duration-150 ease-in-out',
          todo.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        )}>
          ✓
        </span>
      </button>

      {/* Content */}
      <div className={todoItem.layout.headerContent}>
        {/* Header - Responsive layout */}
        <div className={todoItem.layout.headerRow}>
          <h3 className={cn(
            todoItem.title.base,
            todo.completed ? todoItem.title.completed : todoItem.title.uncompleted
          )}>
            {todo.title}
          </h3>

          {/* Priority Badge - Mobile responsive */}
          <span className={cn(
            todoItem.priorityBadge.base,
            priorityStyles[todo.priority]
          )}>
            {todo.priority}
          </span>
        </div>
      </div>
    </div>
  );
};

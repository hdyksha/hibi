/**
 * TodoItemHeader Component
 * Displays the completion checkbox, title, and priority badge
 * Requirements: 2.1, 2.2, 5.1
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
      {/* Completion Toggle - Touch optimized */}
      <button
        className={cn(
          'flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-xs font-bold min-h-[44px] sm:min-h-0',
          todo.completed
            ? 'bg-primary border-primary text-white shadow-md'
            : 'border-border'
        )}
        onClick={handleToggleClick}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed ? '✓' : ''}
      </button>

      {/* Content */}
      <div className={todoItem.layout.headerContent}>
        {/* Header - Responsive layout */}
        <div className={todoItem.layout.headerRow}>
          <h3 
            className={cn(
              'text-base sm:text-lg font-medium leading-tight flex-1',
              todo.completed ? 'line-through text-text-secondary' : 'text-text'
            )}
          >
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

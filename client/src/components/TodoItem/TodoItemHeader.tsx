/**
 * TodoItemHeader Component
 * Displays the completion checkbox, title, and priority badge
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { TodoItem, Priority } from '../../types';
import { cn, todoItem } from '../../utils/styles';

interface TodoItemHeaderProps {
  todo: TodoItem;
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
          todoItem.checkbox.base,
          todo.completed ? todoItem.checkbox.completed : todoItem.checkbox.uncompleted
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

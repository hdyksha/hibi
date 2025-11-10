/**
 * TodoItemHeader Component
 * Displays the completion checkbox, title, and priority badge
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { TodoItem, Priority } from '../../types';

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

  const priorityBg: Record<Priority, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className="flex items-start space-x-3 sm:space-x-4">
      {/* Completion Toggle - Touch optimized */}
      <button
        className={`
          flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-200
          flex items-center justify-center text-xs font-bold min-h-[44px] sm:min-h-0
          ${todo.completed
            ? 'bg-slate-600 border-slate-600 text-white shadow-md'
            : 'border-slate-300 hover:border-slate-500 hover:bg-slate-50 active:bg-slate-100'
          }
        `}
        onClick={handleToggleClick}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed ? '✓' : ''}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header - Responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 sm:mb-3 gap-2">
          <h3 className={`
            text-base sm:text-lg font-medium leading-tight flex-1
            ${todo.completed ? 'line-through text-slate-500' : 'text-slate-800'}
          `}>
            {todo.title}
          </h3>

          {/* Priority Badge - Mobile responsive */}
          <span className={`
            self-start px-2 sm:px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide
            border ${priorityBg[todo.priority]}
          `}>
            {todo.priority}
          </span>
        </div>
      </div>
    </div>
  );
};

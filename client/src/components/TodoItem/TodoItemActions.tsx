/**
 * TodoItemActions Component
 * Displays edit and delete action buttons
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { TodoItem } from '../../types';

interface TodoItemActionsProps {
  todo: TodoItem;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export const TodoItemActions: React.FC<TodoItemActionsProps> = ({
  todo,
  onEdit,
  onDelete,
}) => {
  const handleDeleteClick = () => {
    onDelete(todo.id);
  };

  return (
    <div className="flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
        <button
          className="
            p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
            rounded-md transition-colors duration-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0
            active:bg-slate-200 flex items-center justify-center
          "
          onClick={onEdit}
          aria-label={`Edit todo: ${todo.title}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          className="
            p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 
            rounded-md transition-colors duration-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0
            active:bg-red-100 flex items-center justify-center
          "
          onClick={handleDeleteClick}
          aria-label={`Delete todo: ${todo.title}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

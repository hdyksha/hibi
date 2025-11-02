/**
 * TodoItem Component
 * Displays individual todo item with toggle completion and delete functionality
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3, 6.3, 6.4
 */

import React, { useState } from 'react';
import { TodoItem, Priority } from '../types';
import { EditTaskModal } from './EditTaskModal';
import { MarkdownPreview } from './MarkdownPreview';

interface TodoItemProps {
  todo: TodoItem;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title?: string; priority?: Priority; tags?: string[]; memo?: string }) => void;
}

export const TodoItemComponent: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const handleToggleClick = () => {
    onToggleComplete(todo.id);
  };

  const handleDeleteClick = () => {
    onDelete(todo.id);
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleTaskUpdate = async (id: string, updates: { title?: string; priority?: Priority; tags?: string[]; memo?: string }) => {
    try {
      onUpdate(id, updates);
    } catch (error) {
      // Error handling is managed by the modal component
      throw error;
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const priorityBg = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div
      data-testid="todo-item"
      className={`
        group relative bg-white/95 backdrop-blur-xl rounded-lg shadow-md border border-slate-200/50 
        p-3 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up
        ${todo.completed ? 'opacity-70 bg-slate-50/80' : ''}
      `}>

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

          {/* Tags - Mobile responsive */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
              {todo.tags.map((tag, index) => (
                <span key={index} className="
                  px-2 sm:px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium
                  border border-slate-200
                ">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Memo - Mobile responsive */}
          {todo.memo && (
            <div className="overflow-hidden transition-all duration-200 group-hover:mb-2 sm:group-hover:mb-3 max-h-0 group-hover:max-h-96 opacity-0 group-hover:opacity-100">
              <button
                className="
                  flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 
                  rounded-md text-sm text-slate-600 transition-colors duration-200 min-h-[44px] sm:min-h-0
                  active:bg-slate-300
                "
                onClick={() => setShowMemo(!showMemo)}
                aria-label={showMemo ? 'Hide memo' : 'Show memo'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{showMemo ? 'Hide Memo' : 'Show Memo'}</span>
              </button>
              {showMemo && (
                <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <MarkdownPreview
                    content={todo.memo}
                    className="text-slate-700 text-sm sm:text-base"
                  />
                </div>
              )}
            </div>
          )}

          {/* Metadata - Mobile responsive */}
          <div className="overflow-hidden transition-all duration-200 max-h-0 group-hover:max-h-16 sm:group-hover:max-h-10 opacity-0 group-hover:opacity-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Created: {formatDate(todo.createdAt)}</span>
              </span>
              {todo.updatedAt !== todo.createdAt && (
                <span className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Updated: {formatDate(todo.updatedAt)}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions - Touch optimized */}
        <div className="flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <button
              className="
                p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                rounded-md transition-colors duration-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0
                active:bg-slate-200 flex items-center justify-center
              "
              onClick={handleEditClick}
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
      </div>

      <EditTaskModal
        task={todo}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleTaskUpdate}
        showPriority={true}
      />
    </div>
  );
};


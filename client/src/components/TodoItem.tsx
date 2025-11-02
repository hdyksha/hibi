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
      await onUpdate(id, updates);
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
    <div className={`
      group relative bg-white/95 backdrop-blur-xl rounded-lg shadow-md border border-slate-200/50 
      p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up
      ${todo.completed ? 'opacity-70 bg-slate-50/80' : ''}
    `}>
      
      <div className="flex items-start space-x-4">
        {/* Completion Toggle */}
        <button
          className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200
            flex items-center justify-center text-xs font-bold
            ${todo.completed 
              ? 'bg-slate-600 border-slate-600 text-white shadow-md' 
              : 'border-slate-300 hover:border-slate-500 hover:bg-slate-50'
            }
          `}
          onClick={handleToggleClick}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed ? '✓' : ''}
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className={`
              text-lg font-medium leading-tight
              ${todo.completed ? 'line-through text-slate-500' : 'text-slate-800'}
            `}>
              {todo.title}
            </h3>
            
            {/* Priority Badge */}
            <span className={`
              ml-3 px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide
              border ${priorityBg[todo.priority]}
            `}>
              {todo.priority}
            </span>
          </div>
          
          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {todo.tags.map((tag, index) => (
                <span key={index} className="
                  px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium
                  border border-slate-200
                ">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Memo */}
          {todo.memo && (
            <div className="overflow-hidden transition-all duration-200 group-hover:mb-3 max-h-0 group-hover:max-h-96 opacity-0 group-hover:opacity-100">
              <button
                className="
                  flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 
                  rounded-md text-sm text-slate-600 transition-colors duration-200
                "
                onClick={() => setShowMemo(!showMemo)}
                aria-label={showMemo ? 'Hide memo' : 'Show memo'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{showMemo ? 'メモを隠す' : 'メモを表示'}</span>
              </button>
              {showMemo && (
                <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <MarkdownPreview
                    content={todo.memo}
                    className="text-slate-700"
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Metadata */}
          <div className="overflow-hidden transition-all duration-200 max-h-0 group-hover:max-h-10 opacity-0 group-hover:opacity-100">
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>作成: {formatDate(todo.createdAt)}</span>
              </span>
              {todo.updatedAt !== todo.createdAt && (
                <span className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>更新: {formatDate(todo.updatedAt)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-2">
            <button
              className="
                p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                rounded-md transition-colors duration-200
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
                rounded-md transition-colors duration-200
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


/**
 * TodoItemContent Component
 * Displays tags, memo section, and metadata (creation/update dates)
 * Requirements: 2.1, 2.2, 5.1
 */

import React, { useState } from 'react';
import { TodoItem } from '../../types';
import { MarkdownPreview } from '../MarkdownPreview';

interface TodoItemContentProps {
  todo: TodoItem;
}

export const TodoItemContent: React.FC<TodoItemContentProps> = ({ todo }) => {
  const [showMemo, setShowMemo] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
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
    </>
  );
};

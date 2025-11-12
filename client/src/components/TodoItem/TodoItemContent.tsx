/**
 * TodoItemContent Component
 * Displays tags, memo section, and metadata (creation/update dates)
 * Requirements: 2.1, 2.2, 5.1
 */

import React, { useState } from 'react';
import { TodoItem } from '../../types';
import { MarkdownPreview } from '../MarkdownPreview';
import { todoItem } from '../../utils/styles';

/**
 * Props for TodoItemContent component
 */
interface TodoItemContentProps {
  /** The todo item whose content to display */
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
        <div className={todoItem.layout.tagsContainer}>
          {todo.tags.map((tag, index) => (
            <span key={index} className={todoItem.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Memo - Mobile responsive */}
      {todo.memo && (
        <div className={todoItem.transitions.memoReveal}>
          <button
            className={todoItem.memoButton}
            onClick={() => setShowMemo(!showMemo)}
            aria-label={showMemo ? 'Hide memo' : 'Show memo'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{showMemo ? 'Hide Memo' : 'Show Memo'}</span>
          </button>
          {showMemo && (
            <div className={todoItem.memoContent}>
              <MarkdownPreview
                content={todo.memo}
                className="text-slate-700 text-sm sm:text-base"
              />
            </div>
          )}
        </div>
      )}

      {/* Metadata - Mobile responsive */}
      <div className={todoItem.metadata.container}>
        <div className={todoItem.layout.metadataList}>
          <span className={todoItem.metadata.text}>
            <svg className={todoItem.metadata.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Created: {formatDate(todo.createdAt)}</span>
          </span>
          {todo.updatedAt !== todo.createdAt && (
            <span className={todoItem.metadata.text}>
              <svg className={todoItem.metadata.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

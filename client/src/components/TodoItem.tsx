/**
 * TodoItem Component
 * Displays individual todo item with toggle completion and delete functionality
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3, 6.3, 6.4
 */

import React, { useState } from 'react';
import { TodoItem, Priority } from '../types';
import { EditTaskModal } from './EditTaskModal';
import { MemoEditor } from './MemoEditor';
import './TodoItem.css';

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

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
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

  return (
    <div className={`todo-item ${todo.completed ? 'todo-item--completed' : ''} todo-item--priority-${todo.priority}`}>
      <div className="todo-item__content">
        <button
          className={`todo-item__toggle ${
            todo.completed ? 'todo-item__toggle--completed' : ''
          }`}
          onClick={handleToggleClick}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed ? '✓' : '○'}
        </button>
        
        <div className="todo-item__details">
          <div className="todo-item__header">
            <h3 className={`todo-item__title ${
              todo.completed ? 'todo-item__title--completed' : ''
            }`}>
              {todo.title}
            </h3>
            <span className={`todo-item__priority todo-item__priority--${todo.priority}`}>
              {getPriorityLabel(todo.priority)}
            </span>
          </div>
          
          {todo.tags && todo.tags.length > 0 && (
            <div className="todo-item__tags">
              {todo.tags.map((tag, index) => (
                <span key={index} className="todo-item__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {todo.memo && (
            <div className="todo-item__memo">
              <button
                className="todo-item__memo-toggle"
                onClick={() => setShowMemo(!showMemo)}
                aria-label={showMemo ? 'Hide memo' : 'Show memo'}
              >
                📝 {showMemo ? 'Hide Memo' : 'Show Memo'}
              </button>
              {showMemo && (
                <div className="todo-item__memo-content">
                  <MemoEditor
                    value={todo.memo}
                    onChange={() => {}} // Read-only in display mode
                    disabled={true}
                    className="todo-item__memo-display"
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="todo-item__metadata">
            <span className="todo-item__created">
              Created: {formatDate(todo.createdAt)}
            </span>
            {todo.updatedAt !== todo.createdAt && (
              <span className="todo-item__updated">
                Updated: {formatDate(todo.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="todo-item__actions">
        <button
          className="todo-item__edit"
          onClick={handleEditClick}
          aria-label={`Edit todo: ${todo.title}`}
        >
          ✏️
        </button>
        <button
          className="todo-item__delete"
          onClick={handleDeleteClick}
          aria-label={`Delete todo: ${todo.title}`}
        >
          🗑️
        </button>
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


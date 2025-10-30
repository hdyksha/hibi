/**
 * TodoItem Component
 * Displays individual todo item with toggle completion and delete functionality
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3, 6.3, 6.4
 */

import React, { useState } from 'react';
import { TodoItem, Priority } from '../types';
import './TodoItem.css';

interface TodoItemProps {
  todo: TodoItem;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title?: string; priority?: Priority }) => void;
}

const TodoItemComponent: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const handleToggleClick = () => {
    onToggleComplete(todo.id);
  };

  const handleDeleteClick = () => {
    onDelete(todo.id);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && (editTitle !== todo.title || editPriority !== todo.priority)) {
      onUpdate(todo.id, { 
        title: editTitle.trim(), 
        priority: editPriority 
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
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
          {isEditing ? (
            <div className="todo-item__edit-form">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="todo-item__edit-input"
                maxLength={200}
              />
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                className="todo-item__edit-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="todo-item__edit-actions">
                <button onClick={handleSaveEdit} className="todo-item__save">
                  Save
                </button>
                <button onClick={handleCancelEdit} className="todo-item__cancel">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
      
      <div className="todo-item__actions">
        {!isEditing && (
          <button
            className="todo-item__edit"
            onClick={handleEditClick}
            aria-label={`Edit todo: ${todo.title}`}
          >
            ✏️
          </button>
        )}
        <button
          className="todo-item__delete"
          onClick={handleDeleteClick}
          aria-label={`Delete todo: ${todo.title}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TodoItemComponent;
/**
 * TodoItem Component
 * Displays individual todo item with toggle completion and delete functionality
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3
 */

import React from 'react';
import { TodoItem } from '../types';
import './TodoItem.css';

interface TodoItemProps {
  todo: TodoItem;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItemComponent: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
}) => {
  const handleToggleClick = () => {
    onToggleComplete(todo.id);
  };

  const handleDeleteClick = () => {
    onDelete(todo.id);
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
    <div className={`todo-item ${todo.completed ? 'todo-item--completed' : ''}`}>
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
          <h3 className={`todo-item__title ${
            todo.completed ? 'todo-item__title--completed' : ''
          }`}>
            {todo.title}
          </h3>
          
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
      
      <button
        className="todo-item__delete"
        onClick={handleDeleteClick}
        aria-label={`Delete todo: ${todo.title}`}
      >
        🗑️
      </button>
    </div>
  );
};

export default TodoItemComponent;
/**
 * TodoList Component
 * Displays a list of todo items with toggle and delete functionality
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3, 6.3, 6.4
 */

import React from 'react';
import { useTodoContext } from '../contexts';
import { TodoItem as TodoItemComponent } from './';
import { Priority } from '../types';
import './TodoList.css';

interface TodoListProps {
  className?: string;
}

const TodoList: React.FC<TodoListProps> = ({ className }) => {
  const {
    todos,
    loading,
    error,
    refreshTodos,
    toggleTodoCompletion,
    deleteTodo,
    updateTodo,
  } = useTodoContext();

  const handleToggleComplete = async (id: string) => {
    try {
      await toggleTodoCompletion(id);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleUpdate = async (id: string, updates: { title?: string; priority?: Priority; tags?: string[] }) => {
    try {
      await updateTodo(id, updates);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  if (loading) {
    return (
      <div className={`todo-list ${className || ''}`}>
        <div className="todo-list__loading">Loading todos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`todo-list ${className || ''}`}>
        <div className="todo-list__error">
          Error: {error}
          <button onClick={refreshTodos} className="todo-list__retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-list ${className || ''}`}>
      {todos.length === 0 ? (
        <div className="todo-list__empty">
          No todos yet. Create your first todo!
        </div>
      ) : (
        <ul className="todo-list__items">
          {todos.map(todo => (
            <li key={todo.id} className="todo-list__item">
              <TodoItemComponent
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoList;
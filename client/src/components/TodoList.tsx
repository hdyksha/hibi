/**
 * TodoList Component
 * Displays a list of todo items with toggle and delete functionality
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3, 6.3, 6.4
 */

import React from 'react';
import { useTodoContext } from '../contexts';
import { TodoItem } from './';
import { Priority } from '../types';

interface TodoListProps {
  className?: string;
}

export const TodoList: React.FC<TodoListProps> = ({ className }) => {
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
      <div className={`w-full p-4 ${className || ''}`}>
        <div className="text-center py-8 text-slate-600 text-lg">Loading todos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full p-4 ${className || ''}`}>
        <div className="text-center py-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <div className="mb-4">Error: {error}</div>
          <button 
            onClick={refreshTodos} 
            className="px-4 py-2 bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full p-4 ${className || ''}`}>
      {!todos || todos.length === 0 ? (
        <div className="text-center py-8 text-slate-600 text-lg">
          No todos yet. Create your first todo!
        </div>
      ) : (
        <ul className="list-none p-0 m-0 space-y-3">
          {todos.map(todo => (
            <li key={todo.id}>
              <TodoItem
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


/**
 * TodoItem Component
 * Displays individual todo item with toggle completion and delete functionality
 * Refactored to use subcomponents and custom hooks
 * Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3, 5.1, 5.2, 6.3, 6.4
 */

import React from 'react';
import { TodoItem as TodoItemType, Priority } from '../types';
import { EditTaskModal } from './EditTaskModal';
import { TodoItemHeader } from './TodoItem/TodoItemHeader';
import { TodoItemContent } from './TodoItem/TodoItemContent';
import { TodoItemActions } from './TodoItem/TodoItemActions';
import { useTodoItemModal } from '../hooks/useTodoItemModal';

interface TodoItemProps {
  todo: TodoItemType;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title?: string; priority?: Priority; tags?: string[]; memo?: string }) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
}) => {
  const { isModalOpen, openModal, closeModal, handleTaskUpdate } = useTodoItemModal(onUpdate);

  return (
    <div
      data-testid="todo-item"
      className={`
        group relative bg-white/95 backdrop-blur-xl rounded-lg shadow-md border border-slate-200/50 
        p-3 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up
        ${todo.completed ? 'opacity-70 bg-slate-50/80' : ''}
      `}>

      <div className="flex items-start justify-between">
        <TodoItemHeader todo={todo} onToggleComplete={onToggleComplete} />
        <TodoItemActions todo={todo} onEdit={openModal} onDelete={onDelete} />
      </div>

      <div className="ml-10 sm:ml-10">
        <TodoItemContent todo={todo} />
      </div>

      <EditTaskModal
        task={todo}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleTaskUpdate}
        showPriority={true}
      />
    </div>
  );
};


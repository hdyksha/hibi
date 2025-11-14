/**
 * TodoItem Component
 * Displays individual todo item with toggle completion and delete functionality
 * Refactored to use subcomponents and custom hooks
 * Enhanced with smooth animations for enter, exit, and state changes
 * Requirements: 1.3, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.3, 5.1, 5.2, 6.3, 6.4
 */

import React, { useState, useEffect } from 'react';
import { TodoItem as TodoItemType, Priority } from '../types';
import { EditTaskModal } from './EditTaskModal';
import { TodoItemHeader } from './TodoItem/TodoItemHeader';
import { TodoItemContent } from './TodoItem/TodoItemContent';
import { TodoItemActions } from './TodoItem/TodoItemActions';
import { useTodoItemModal } from '../hooks/useTodoItemModal';
import { cn, todoItem } from '../utils/styles';

interface OptimisticTodoItem extends TodoItemType {
  isPending?: boolean;
  isExiting?: boolean;
}

interface TodoItemProps {
  todo: OptimisticTodoItem;
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
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Trigger enter animation on mount
  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 300); // Match animation duration

    return () => clearTimeout(timer);
  }, []);

  // Handle exit animation when isExiting flag is set
  useEffect(() => {
    if (todo.isExiting) {
      setIsExiting(true);
    }
  }, [todo.isExiting]);

  return (
    <div
      data-testid="todo-item"
      className={cn(
        todoItem.container,
        todo.completed && todoItem.containerCompleted,
        // Enter animation: fade-in + slide-down (300ms)
        isEntering && 'animate-enter',
        // Exit animation: fade-out + slide-up (250ms)
        isExiting && 'animate-exit',
        // Pending state visual indicator
        todo.isPending && 'opacity-70 ring-2 ring-blue-400 ring-opacity-50',
        // Smooth transitions for all state changes
        'transition-all-smooth'
      )}>

      <div className="flex items-start justify-between">
        <TodoItemHeader 
          todo={todo} 
          onToggleComplete={onToggleComplete}
        />
        <TodoItemActions todo={todo} onEdit={openModal} onDelete={onDelete} />
      </div>

      <div className={todoItem.layout.contentMargin}>
        <TodoItemContent todo={todo} />
      </div>

      {todo.isPending && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-blue-600">
          <span className="animate-pulse">●</span>
          <span>Saving...</span>
        </div>
      )}

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


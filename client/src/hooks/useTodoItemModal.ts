/**
 * useTodoItemModal Hook
 * Manages the edit modal state for TodoItem component
 * Requirements: 2.2, 5.2
 */

import { useState } from 'react';
import { Priority } from '../types';

/**
 * Custom hook for managing todo item edit modal state
 * 
 * @param onUpdate - Callback function to handle todo item updates
 * @returns Object containing modal state and handlers
 * 
 * @example
 * ```tsx
 * const { isModalOpen, openModal, closeModal, handleTaskUpdate } = useTodoItemModal(updateTodo);
 * ```
 */
export const useTodoItemModal = (
  onUpdate: (id: string, updates: { title?: string; priority?: Priority; tags?: string[]; memo?: string }) => void
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleTaskUpdate = async (
    id: string,
    updates: { title?: string; priority?: Priority; tags?: string[]; memo?: string }
  ) => {
    try {
      onUpdate(id, updates);
    } catch (error) {
      // Error handling is managed by the modal component
      throw error;
    }
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    handleTaskUpdate,
  };
};

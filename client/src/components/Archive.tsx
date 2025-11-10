/**
 * Archive Component
 * Displays completed todo items grouped by completion date
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React, { useState } from 'react';
import { TodoItem } from '../types';
import { EditTaskModal } from './EditTaskModal';
import { ArchiveFilter } from './ArchiveFilter';
import { LoadingSpinner, ErrorMessage } from './';
import { useTodoContext } from '../contexts/TodoContext';
import { ArchiveGroup } from './Archive/ArchiveGroup';

interface ArchiveProps {
  className?: string;
}

export const Archive: React.FC<ArchiveProps> = ({ className }) => {
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { updateTodo, archive } = useTodoContext();
  const {
    loading,
    error,
    filter,
    availableTags,
    filteredGroups,
    totalTasks,
    setFilter,
    refreshArchive,
  } = archive;

  const handleEditClick = (task: TodoItem) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskUpdate = async (id: string, updates: { title?: string; tags?: string[]; memo?: string }) => {
    try {
      await updateTodo(id, updates);
      // Reload archive data to reflect changes
      await refreshArchive();
    } catch (error) {
      // Error handling is managed by the modal component
      throw error;
    }
  };

  if (loading) {
    return (
      <div className={`p-3 sm:p-4 max-w-4xl mx-auto ${className || ''}`}>
        <LoadingSpinner message="Loading archive..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-3 sm:p-4 max-w-4xl mx-auto ${className || ''}`}>
        <ErrorMessage 
          message={error} 
          onRetry={refreshArchive}
          retryLabel="Retry"
        />
      </div>
    );
  }

  if (totalTasks === 0) {
    return (
      <div className={`p-3 sm:p-4 max-w-4xl mx-auto ${className || ''}`}>
        <div className="text-center py-6 sm:py-8 text-slate-600">
          <p className="text-sm sm:text-base">No completed tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 sm:p-4 max-w-4xl mx-auto ${className || ''}`}>
      <ArchiveFilter
        filter={filter}
        availableTags={availableTags}
        onFilterChange={setFilter}
        className="mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-6 shadow-md border border-slate-200"
        data-testid="archive-filter"
      />

      {filteredGroups.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-slate-600">
          <p className="text-sm sm:text-base">No tasks match the current filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8">
          {filteredGroups.map((group) => (
            <ArchiveGroup 
              key={group.date} 
              group={group} 
              onEditTask={handleEditClick}
            />
          ))}
        </div>
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleTaskUpdate}
          showPriority={false}
        />
      )}
    </div>
  );
};


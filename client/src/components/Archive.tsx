/**
 * Archive Component
 * Displays completed todo items grouped by completion date
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React, { useState } from 'react';
import { TodoItem } from '../types';
import { EditTaskModal } from './EditTaskModal';
import { ArchiveFilter } from './ArchiveFilter';
import { MarkdownPreview } from './MarkdownPreview';
import { LoadingSpinner, UserFriendlyError } from './';
import { useTodoContext } from '../contexts/TodoContext';

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return `${year}/${month}/${day} ${weekday}`;
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityStyles = (priority: string): string => {
    const styles = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return styles[priority as keyof typeof styles] || styles.medium;
  };

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
        <UserFriendlyError 
          error={error}
          context="fetch"
          errorType="network"
          onRetry={refreshArchive}
          variant="card"
          autoRetry={false}
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
            <div key={group.date} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 sm:p-7 shadow-md border border-slate-200" data-testid="archive-group">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 pb-2 border-b-2 border-slate-300 gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 m-0">
                  {formatDate(group.date)}
                </h3>
                <span className="bg-green-500 text-white px-3 py-1 rounded-xl text-sm font-medium self-start sm:self-auto">
                  {group.count} completed
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                {group.tasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-lg p-3 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative flex justify-between items-start" data-testid="archive-task">
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                        <h4 className="text-sm sm:text-base font-semibold text-slate-800 m-0 flex-1 break-words">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-start">
                          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase border ${getPriorityStyles(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.completedAt && (
                            <span className="text-slate-500 text-xs sm:text-sm">
                              {formatTime(task.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, index) => (
                            <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium border border-blue-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {task.memo && (
                        <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <MarkdownPreview
                            content={task.memo}
                            className="text-slate-700 text-sm sm:text-base"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-3 sm:ml-4 mt-1">
                      <button
                        className="bg-none border-none cursor-pointer p-2 rounded-md transition-all duration-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 hover:scale-110 active:scale-95 flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 min-h-[44px] sm:min-h-0"
                        onClick={() => handleEditClick(task)}
                        aria-label={`Edit task: ${task.title}`}
                        title="Edit task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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


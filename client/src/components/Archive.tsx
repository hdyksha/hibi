/**
 * Archive Component
 * Displays completed todo items grouped by completion date
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React, { useState } from 'react';
import { TodoItem } from '../types';
import { EditTaskModal } from './EditTaskModal';
import { ArchiveFilter } from './ArchiveFilter';
import { useTodoContext } from '../contexts/TodoContext';
import './Archive.css';

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
    filteredTasks,
    hasActiveFilter,
    setFilter,
    refreshArchive,
  } = archive;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityClass = (priority: string): string => {
    return `priority-${priority}`;
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
      <div className={`archive ${className || ''}`}>
        <div className="archive-loading">
          <p>アーカイブを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`archive ${className || ''}`}>
        <div className="archive-error">
          <p>エラー: {error}</p>
          <button onClick={refreshArchive} className="retry-button">
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (totalTasks === 0) {
    return (
      <div className={`archive ${className || ''}`}>
        <div className="archive-empty">
          <p>完了済みのタスクはありません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`archive ${className || ''}`}>
      <div className="archive-header">
        <h2>アーカイブ</h2>
        <p className="archive-summary">
          {hasActiveFilter ? (
            <>
              {filteredTasks} / {totalTasks} 件の完了済みタスク
              {filteredTasks !== totalTasks && (
                <span className="filter-indicator"> (フィルター適用中)</span>
              )}
            </>
          ) : (
            `${totalTasks} 件の完了済みタスク`
          )}
        </p>
      </div>

      <ArchiveFilter
        filter={filter}
        availableTags={availableTags}
        onFilterChange={setFilter}
        className="archive-filter"
      />

      {filteredGroups.length === 0 ? (
        <div className="archive-empty">
          <p>フィルター条件に一致するタスクがありません。</p>
        </div>
      ) : (
        <div className="archive-groups">
          {filteredGroups.map((group) => (
          <div key={group.date} className="archive-group">
            <div className="archive-group-header">
              <h3 className="archive-group-date">
                {formatDate(group.date)}
              </h3>
              <span className="archive-group-count">
                {group.count} 件完了
              </span>
            </div>

            <div className="archive-group-tasks">
              {group.tasks.map((task) => (
                <div key={task.id} className="archive-task">
                  <div className="archive-task-content">
                    <div className="archive-task-header">
                      <h4 className="archive-task-title">{task.title}</h4>
                      <div className="archive-task-meta">
                        <span className={`archive-task-priority ${getPriorityClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.completedAt && (
                          <span className="archive-task-time">
                            {formatTime(task.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {task.tags.length > 0 && (
                      <div className="archive-task-tags">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="archive-task-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {task.memo && (
                      <div className="archive-task-memo">
                        <p>{task.memo}</p>
                      </div>
                    )}
                  </div>

                  <div className="archive-task-actions">
                    <button
                      className="archive-task-edit"
                      onClick={() => handleEditClick(task)}
                      aria-label={`Edit task: ${task.title}`}
                      title="タスクを編集"
                    >
                      ✏️
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


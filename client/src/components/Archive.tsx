/**
 * Archive Component
 * Displays completed todo items grouped by completion date
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ArchiveGroup, TodoItem, TodoFilter } from '../types';
import { todoApiClient } from '../services';
import { EditTaskModal } from './EditTaskModal';
import { Filter } from './Filter';
import { useTodoContext } from '../contexts/TodoContext';
import './Archive.css';

interface ArchiveProps {
  className?: string;
}

export const Archive: React.FC<ArchiveProps> = ({ className }) => {
  const [archiveGroups, setArchiveGroups] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState<TodoFilter>({});
  
  const { updateTodo } = useTodoContext();

  useEffect(() => {
    loadArchiveData();
  }, []);

  // Get all available tags from archive data
  const availableArchiveTags = useMemo(() => {
    const tagSet = new Set<string>();
    archiveGroups.forEach(group => {
      group.tasks.forEach(task => {
        task.tags.forEach(tag => tagSet.add(tag));
      });
    });
    return Array.from(tagSet).sort();
  }, [archiveGroups]);

  // Filter archive groups based on current filter
  const filteredArchiveGroups = useMemo(() => {
    if (Object.keys(archiveFilter).length === 0) {
      return archiveGroups;
    }

    return archiveGroups.map(group => {
      const filteredTasks = group.tasks.filter(task => {
        // Priority filter
        if (archiveFilter.priority && task.priority !== archiveFilter.priority) {
          return false;
        }

        // Tags filter
        if (archiveFilter.tags && archiveFilter.tags.length > 0) {
          const hasMatchingTag = archiveFilter.tags.some(filterTag => 
            task.tags.includes(filterTag)
          );
          if (!hasMatchingTag) {
            return false;
          }
        }

        // Search text filter
        if (archiveFilter.searchText) {
          const searchLower = archiveFilter.searchText.toLowerCase();
          const titleMatch = task.title.toLowerCase().includes(searchLower);
          const memoMatch = task.memo?.toLowerCase().includes(searchLower) || false;
          const tagMatch = task.tags.some(tag => 
            tag.toLowerCase().includes(searchLower)
          );
          
          if (!titleMatch && !memoMatch && !tagMatch) {
            return false;
          }
        }

        return true;
      });

      return {
        ...group,
        tasks: filteredTasks,
        count: filteredTasks.length
      };
    }).filter(group => group.tasks.length > 0);
  }, [archiveGroups, archiveFilter]);

  const loadArchiveData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoApiClient.getArchive();
      setArchiveGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load archive data');
    } finally {
      setLoading(false);
    }
  };

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
      await loadArchiveData();
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
          <button onClick={loadArchiveData} className="retry-button">
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (archiveGroups.length === 0) {
    return (
      <div className={`archive ${className || ''}`}>
        <div className="archive-empty">
          <p>完了済みのタスクはありません。</p>
        </div>
      </div>
    );
  }

  const totalFilteredTasks = filteredArchiveGroups.reduce((total, group) => total + group.count, 0);
  const totalTasks = archiveGroups.reduce((total, group) => total + group.count, 0);
  const hasActiveFilter = Object.keys(archiveFilter).length > 0;

  return (
    <div className={`archive ${className || ''}`}>
      <div className="archive-header">
        <h2>アーカイブ</h2>
        <p className="archive-summary">
          {hasActiveFilter ? (
            <>
              {totalFilteredTasks} / {totalTasks} 件の完了済みタスク
              {totalFilteredTasks !== totalTasks && (
                <span className="filter-indicator"> (フィルター適用中)</span>
              )}
            </>
          ) : (
            `${totalTasks} 件の完了済みタスク`
          )}
        </p>
      </div>

      <Filter
        filter={archiveFilter}
        availableTags={availableArchiveTags}
        onFilterChange={setArchiveFilter}
        className="archive-filter"
        hideStatusFilter={true}
      />

      {filteredArchiveGroups.length === 0 ? (
        <div className="archive-empty">
          <p>フィルター条件に一致するタスクがありません。</p>
        </div>
      ) : (
        <div className="archive-groups">
          {filteredArchiveGroups.map((group) => (
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


/**
 * Archive Component
 * Displays completed todo items grouped by completion date
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import React, { useState, useEffect } from 'react';
import { ArchiveGroup } from '../types';
import { todoApiClient } from '../services';
import './Archive.css';

interface ArchiveProps {
  className?: string;
}

export const Archive: React.FC<ArchiveProps> = ({ className }) => {
  const [archiveGroups, setArchiveGroups] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArchiveData();
  }, []);

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

  return (
    <div className={`archive ${className || ''}`}>
      <div className="archive-header">
        <h2>アーカイブ</h2>
        <p className="archive-summary">
          {archiveGroups.reduce((total, group) => total + group.count, 0)} 件の完了済みタスク
        </p>
      </div>

      <div className="archive-groups">
        {archiveGroups.map((group) => (
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


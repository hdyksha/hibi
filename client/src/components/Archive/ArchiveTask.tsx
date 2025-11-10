/**
 * ArchiveTask Component
 * Displays an individual completed task in the archive
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { TodoItem } from '../../types';
import { MarkdownPreview } from '../MarkdownPreview';

interface ArchiveTaskProps {
  task: TodoItem;
  onEdit: (task: TodoItem) => void;
}

export const ArchiveTask: React.FC<ArchiveTaskProps> = ({ task, onEdit }) => {
  const formatTimeFromISO = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityBadgeStyles = (priority: string): string => {
    const priorityStyles = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return priorityStyles[priority as keyof typeof priorityStyles] || priorityStyles.medium;
  };

  return (
    <div 
      className="bg-white rounded-lg p-3 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative flex justify-between items-start" 
      data-testid="archive-task"
    >
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
          <h4 className="text-sm sm:text-base font-semibold text-slate-800 m-0 flex-1 break-words">
            {task.title}
          </h4>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-start">
            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase border ${getPriorityBadgeStyles(task.priority)}`}>
              {task.priority}
            </span>
            {task.completedAt && (
              <span className="text-slate-500 text-xs sm:text-sm">
                {formatTimeFromISO(task.completedAt)}
              </span>
            )}
          </div>
        </div>

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium border border-blue-200"
              >
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
          onClick={() => onEdit(task)}
          aria-label={`Edit task: ${task.title}`}
          title="Edit task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

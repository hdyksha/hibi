/**
 * ArchiveGroup Component
 * Displays a group of completed tasks for a specific date
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { ArchiveGroup as ArchiveGroupType } from '../../types';
import { ArchiveTask } from './ArchiveTask';

/**
 * Props for ArchiveGroup component
 */
interface ArchiveGroupProps {
  /** Archive group containing tasks completed on the same date */
  group: ArchiveGroupType;
  /** Callback function when a task edit is requested */
  onEditTask: (task: ArchiveGroupType['tasks'][number]) => void;
}

export const ArchiveGroup: React.FC<ArchiveGroupProps> = ({ group, onEditTask }) => {
  const formatDateWithWeekday = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return `${year}/${month}/${day} ${weekday}`;
  };

  return (
    <div 
      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 sm:p-7 shadow-md border border-slate-200" 
      data-testid="archive-group"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 pb-2 border-b-2 border-slate-300 gap-2">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-800 m-0">
          {formatDateWithWeekday(group.date)}
        </h3>
        <span className="bg-green-500 text-white px-3 py-1 rounded-xl text-sm font-medium self-start sm:self-auto">
          {group.count} completed
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3">
        {group.tasks.map((task) => (
          <ArchiveTask 
            key={task.id} 
            task={task} 
            onEdit={onEditTask}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * FilterPriority Component
 * Provides priority filter dropdown (high, medium, low)
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { Priority } from '../../types';

/**
 * Props for FilterPriority component
 */
interface FilterPriorityProps {
  /** Current priority filter value (undefined means all priorities) */
  priority?: Priority;
  /** Callback function when priority filter changes */
  onPriorityChange: (priority: string) => void;
}

export const FilterPriority: React.FC<FilterPriorityProps> = ({
  priority,
  onPriorityChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onPriorityChange(event.target.value);
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor="priority-select" 
        className="block text-sm font-medium flex items-center space-x-1"
        style={{ color: 'var(--color-text)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
        <span>Priority</span>
      </label>
      <select
        id="priority-select"
        value={priority || ''}
        onChange={handleChange}
        className="w-full px-3 sm:px-4 py-3 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 transition-all duration-200 min-h-[48px]"
        style={{
          backgroundColor: 'var(--color-background)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        <option value="">All Priorities</option>
        <option value="high">● 高</option>
        <option value="medium">● 中</option>
        <option value="low">● 低</option>
      </select>
    </div>
  );
};

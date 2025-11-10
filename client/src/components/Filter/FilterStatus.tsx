/**
 * FilterStatus Component
 * Provides status filter options (all, pending, completed)
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { FilterStatus as FilterStatusType } from '../../types';

interface FilterStatusProps {
  status: FilterStatusType;
  onStatusChange: (status: FilterStatusType) => void;
}

const FILTER_STATUS_OPTIONS: { value: FilterStatusType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export const FilterStatus: React.FC<FilterStatusProps> = ({
  status,
  onStatusChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 flex items-center space-x-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Status</span>
      </label>
      <div className="space-y-2">
        {FILTER_STATUS_OPTIONS.map(option => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="radio"
              name="status"
              value={option.value}
              checked={status === option.value}
              onChange={() => onStatusChange(option.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

/**
 * TodoFormAdvanced Component
 * Handles advanced todo form fields: priority, tags, and memo
 * Requirements: 2.1, 2.2, 5.1
 */

import React from 'react';
import { Priority } from '../../types';
import { TagInput } from '../TagInput';
import { MemoEditor } from '../MemoEditor';

export interface TodoFormAdvancedProps {
  priority: Priority;
  tags: string[];
  memo: string;
  onPriorityChange: (priority: Priority) => void;
  onTagsChange: (tags: string[]) => void;
  onMemoChange: (memo: string) => void;
  isSubmitting: boolean;
}

export const TodoFormAdvanced: React.FC<TodoFormAdvancedProps> = ({
  priority,
  tags,
  memo,
  onPriorityChange,
  onTagsChange,
  onMemoChange,
  isSubmitting,
}) => {
  const handlePriorityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onPriorityChange(event.target.value as Priority);
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-6 animate-fade-in">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-700 m-0">Additional Details</h3>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="todo-priority" className="text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="todo-priority"
            value={priority}
            onChange={handlePriorityChange}
            className={`px-3 sm:px-4 py-3 border border-slate-300 rounded-lg text-sm sm:text-base bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 min-h-[48px] ${
              isSubmitting ? 'bg-slate-50 cursor-not-allowed opacity-60' : 'hover:border-slate-400'
            }`}
            disabled={isSubmitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">
            Tags
          </label>
          <TagInput
            tags={tags}
            onChange={onTagsChange}
            placeholder="Add tags (press Enter or comma to add)"
            disabled={isSubmitting}
            maxTags={10}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">
            Memo
          </label>
          <MemoEditor
            value={memo}
            onChange={onMemoChange}
            placeholder="Add memo in markdown format..."
            disabled={isSubmitting}
            className="w-full min-h-24 sm:min-h-32 max-h-48 sm:max-h-72"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * EditTaskModal Component
 * Modal for editing archived tasks (title, memo, tags)
 * Requirements: 5.1, 5.2, 5.3, 9.4
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TodoItem, Priority, isPriority } from '../types';
import { TagInput } from './TagInput';
import { MemoEditor } from './MemoEditor';

interface EditTaskModalProps {
  task: TodoItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { title?: string; priority?: Priority; tags?: string[]; memo?: string }) => Promise<void>;
  showPriority?: boolean; // Optional prop to show/hide priority editing
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  showPriority = false,
}) => {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editTags, setEditTags] = useState(task.tags || []);
  const [editMemo, setEditMemo] = useState(task.memo || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setEditTitle(task.title);
      setEditPriority(task.priority);
      setEditTags(task.tags || []);
      setEditMemo(task.memo || '');
      setError(null);
    }
  }, [task, isOpen]);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setError('Title is required');
      return;
    }

    const hasChanges = 
      editTitle.trim() !== task.title || 
      editPriority !== task.priority ||
      JSON.stringify(editTags) !== JSON.stringify(task.tags || []) ||
      editMemo !== (task.memo || '');

    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const updates: { title?: string; priority?: Priority; tags?: string[]; memo?: string } = {
        title: editTitle.trim(),
        tags: editTags,
        memo: editMemo,
      };
      
      if (showPriority) {
        updates.priority = editPriority;
      }
      
      await onSave(task.id, updates);
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditTags(task.tags || []);
    setEditMemo(task.memo || '');
    setError(null);
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" role="dialog" aria-labelledby="edit-task-title">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
          <h2 id="edit-task-title" className="text-lg sm:text-xl font-semibold text-slate-800 m-0">Edit Task</h2>
          <button
            className={`bg-none border-none text-2xl cursor-pointer text-slate-500 p-2 rounded transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:text-slate-700 hover:bg-slate-200 active:bg-slate-300'
            }`}
            onClick={handleCancel}
            aria-label="Close"
            disabled={isSaving}
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <label htmlFor="edit-title" className="block font-medium text-slate-700 mb-2 text-sm">
              Title *
            </label>
            <input
              id="edit-title"
              type="text"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              className={`w-full px-3 py-3 border border-slate-300 rounded-md text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 min-h-[48px] ${
                isSaving ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
              }`}
              maxLength={200}
              disabled={isSaving}
              autoFocus
            />
          </div>

          {showPriority && (
            <div className="mb-4 sm:mb-6">
              <label htmlFor="edit-priority" className="block font-medium text-slate-700 mb-2 text-sm">
                Priority
              </label>
              <select
                id="edit-priority"
                value={editPriority}
                onChange={(event) => {
                  const value = event.target.value;
                  if (isPriority(value)) {
                    setEditPriority(value);
                  }
                }}
                className={`w-full px-3 py-3 border border-slate-300 rounded-md text-sm sm:text-base transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 min-h-[48px] ${
                  isSaving ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''
                }`}
                disabled={isSaving}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <label className="block font-medium text-slate-700 mb-2 text-sm">
              Tags
            </label>
            <TagInput
              tags={editTags}
              onChange={setEditTags}
              placeholder="Add tags..."
              maxTags={10}
              className="w-full"
              disabled={isSaving}
            />
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block font-medium text-slate-700 mb-2 text-sm">
              Memo
            </label>
            <MemoEditor
              value={editMemo}
              onChange={setEditMemo}
              placeholder="Enter memo in markdown format..."
              className="w-full min-h-32 sm:min-h-48"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end p-4 sm:p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleCancel}
            className={`w-full sm:w-auto px-6 py-3 rounded-md font-medium text-sm cursor-pointer transition-all duration-200 border border-slate-300 bg-white text-slate-700 min-h-[48px] ${
              isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100'
            }`}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`w-full sm:w-auto px-6 py-3 rounded-md font-medium text-sm cursor-pointer transition-all duration-200 bg-blue-600 text-white min-h-[48px] ${
              isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:bg-blue-800'
            }`}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
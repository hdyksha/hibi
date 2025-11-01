/**
 * EditTaskModal Component
 * Modal for editing archived tasks (title, memo, tags)
 * Requirements: 5.1, 5.2, 5.3, 9.4
 */

import React, { useState, useEffect } from 'react';
import { TodoItem, Priority } from '../types';
import { TagInput } from './TagInput';
import { MemoEditor } from './MemoEditor';
import './EditTaskModal.css';

interface EditTaskModalProps {
  task: TodoItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { title?: string; tags?: string[]; memo?: string }) => Promise<void>;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editTags, setEditTags] = useState(task.tags || []);
  const [editMemo, setEditMemo] = useState(task.memo || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setEditTitle(task.title);
      setEditTags(task.tags || []);
      setEditMemo(task.memo || '');
      setError(null);
    }
  }, [task, isOpen]);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setError('タイトルは必須です');
      return;
    }

    const hasChanges = 
      editTitle.trim() !== task.title || 
      JSON.stringify(editTags) !== JSON.stringify(task.tags || []) ||
      editMemo !== (task.memo || '');

    if (!hasChanges) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      await onSave(task.id, {
        title: editTitle.trim(),
        tags: editTags,
        memo: editMemo,
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditTags(task.tags || []);
    setEditMemo(task.memo || '');
    setError(null);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="edit-task-modal-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="edit-task-modal" role="dialog" aria-labelledby="edit-task-title">
        <div className="edit-task-modal-header">
          <h2 id="edit-task-title">タスクを編集</h2>
          <button
            className="edit-task-modal-close"
            onClick={handleCancel}
            aria-label="閉じる"
            disabled={isSaving}
          >
            ×
          </button>
        </div>

        <div className="edit-task-modal-content">
          {error && (
            <div className="edit-task-modal-error">
              {error}
            </div>
          )}

          <div className="edit-task-modal-field">
            <label htmlFor="edit-title" className="edit-task-modal-label">
              タイトル *
            </label>
            <input
              id="edit-title"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-task-modal-input"
              maxLength={200}
              disabled={isSaving}
              autoFocus
            />
          </div>

          <div className="edit-task-modal-field">
            <label className="edit-task-modal-label">
              タグ
            </label>
            <TagInput
              tags={editTags}
              onChange={setEditTags}
              placeholder="タグを追加..."
              maxTags={10}
              className="edit-task-modal-tags"
              disabled={isSaving}
            />
          </div>

          <div className="edit-task-modal-field">
            <label className="edit-task-modal-label">
              メモ
            </label>
            <MemoEditor
              value={editMemo}
              onChange={setEditMemo}
              placeholder="メモをマークダウン形式で入力..."
              className="edit-task-modal-memo"
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="edit-task-modal-actions">
          <button
            onClick={handleCancel}
            className="edit-task-modal-button edit-task-modal-button--cancel"
            disabled={isSaving}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="edit-task-modal-button edit-task-modal-button--save"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};
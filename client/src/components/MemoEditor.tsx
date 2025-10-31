/**
 * MemoEditor Component
 * Provides markdown editing with live preview functionality
 * Requirements: 8.1, 8.2, 8.3
 */

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './MemoEditor.css';

interface MemoEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MemoEditor: React.FC<MemoEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter memo in markdown format...",
  className = "",
  disabled = false,
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  }, [onChange]);

  const togglePreview = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
    setIsSplitView(false);
  }, [isPreviewMode]);

  const toggleSplitView = useCallback(() => {
    setIsSplitView(!isSplitView);
    setIsPreviewMode(false);
  }, [isSplitView]);

  const renderToolbar = () => (
    <div className="memo-editor__toolbar">
      <div className="memo-editor__toolbar-group">
        <button
          type="button"
          className={`memo-editor__toolbar-btn ${!isPreviewMode && !isSplitView ? 'memo-editor__toolbar-btn--active' : ''}`}
          onClick={() => {
            setIsPreviewMode(false);
            setIsSplitView(false);
          }}
          disabled={disabled}
          aria-label="Edit mode"
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          className={`memo-editor__toolbar-btn ${isPreviewMode ? 'memo-editor__toolbar-btn--active' : ''}`}
          onClick={togglePreview}
          disabled={disabled}
          aria-label="Preview mode"
        >
          👁️ Preview
        </button>
        <button
          type="button"
          className={`memo-editor__toolbar-btn ${isSplitView ? 'memo-editor__toolbar-btn--active' : ''}`}
          onClick={toggleSplitView}
          disabled={disabled}
          aria-label="Split view mode"
        >
          📱 Split
        </button>
      </div>
      <div className="memo-editor__toolbar-info">
        <span className="memo-editor__char-count">
          {value.length} characters
        </span>
      </div>
    </div>
  );

  const renderEditor = () => (
    <textarea
      className="memo-editor__textarea"
      value={value}
      onChange={handleTextChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-label="Memo editor"
    />
  );

  const renderPreview = () => (
    <div className="memo-editor__preview" aria-label="Memo preview">
      {value.trim() ? (
        <div className="memo-editor__markdown">
          <ReactMarkdown>
            {value}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="memo-editor__preview-empty">
          No content to preview
        </div>
      )}
    </div>
  );

  return (
    <div className={`memo-editor ${className}`}>
      {renderToolbar()}
      <div className="memo-editor__content">
        {isSplitView ? (
          <div className="memo-editor__split">
            <div className="memo-editor__split-pane">
              {renderEditor()}
            </div>
            <div className="memo-editor__split-pane">
              {renderPreview()}
            </div>
          </div>
        ) : isPreviewMode ? (
          renderPreview()
        ) : (
          renderEditor()
        )}
      </div>
    </div>
  );
};


/**
 * MemoEditor Component
 * Provides markdown editing with live preview functionality
 * Requirements: 8.1, 8.2, 8.3
 */

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className="flex justify-between items-center px-3 py-2 bg-slate-50 border-b border-slate-200 rounded-t">
      <div className="flex gap-1">
        <button
          type="button"
          className={`px-3 py-1.5 border rounded text-xs transition-all duration-200 ${
            !isPreviewMode && !isSplitView 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white border-slate-300 hover:bg-slate-100 hover:border-slate-400'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
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
          className={`px-3 py-1.5 border rounded text-xs transition-all duration-200 ${
            isPreviewMode 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white border-slate-300 hover:bg-slate-100 hover:border-slate-400'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={togglePreview}
          disabled={disabled}
          aria-label="Preview mode"
        >
          👁️ Preview
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 border rounded text-xs transition-all duration-200 ${
            isSplitView 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white border-slate-300 hover:bg-slate-100 hover:border-slate-400'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={toggleSplitView}
          disabled={disabled}
          aria-label="Split view mode"
        >
          📱 Split
        </button>
      </div>
      <div className="text-xs text-slate-500">
        <span className="font-medium">
          {value.length} characters
        </span>
      </div>
    </div>
  );

  const renderEditor = () => (
    <textarea
      className={`w-full h-48 p-3 border-none outline-none resize-y font-mono text-sm leading-relaxed bg-white rounded-b ${
        disabled ? 'bg-slate-50 text-slate-500' : ''
      }`}
      value={value}
      onChange={handleTextChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-label="Memo editor"
    />
  );

  const renderPreview = () => (
    <div className="p-3 min-h-48 max-h-96 overflow-y-auto bg-white rounded-b" aria-label="Memo preview">
      {value.trim() ? (
        <div className="prose prose-sm max-w-none leading-relaxed">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              ul: ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              code: ({ children, ...props }) => (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              ),
              pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded mb-4 overflow-x-auto">{children}</pre>,
              h1: ({ children }) => <h1 className="text-xl font-bold mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
              p: ({ children }) => <p className="mb-3">{children}</p>,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4">{children}</blockquote>,
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
            }}
          >
            {value}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="text-slate-500 italic text-center py-15 px-5">
          No content to preview
        </div>
      )}
    </div>
  );

  return (
    <div className={`border border-slate-300 rounded bg-white font-sans ${className}`}>
      {renderToolbar()}
      <div className="min-h-48 max-h-96">
        {isSplitView ? (
          <div className="flex h-48">
            <div className="flex-1 border-r border-slate-300">
              {renderEditor()}
            </div>
            <div className="flex-1">
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


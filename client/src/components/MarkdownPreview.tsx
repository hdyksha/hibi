/**
 * MarkdownPreview Component
 * Renders markdown content as HTML preview
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { baseMarkdownComponents } from '../utils/markdownComponents';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  className = '',
}) => {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown components={baseMarkdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
/**
 * Shared ReactMarkdown components configuration
 * Provides consistent styling across all markdown renderers
 */

import React from 'react';
import { Components } from 'react-markdown';

// Base components for general markdown rendering
export const baseMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-slate-800 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-semibold text-slate-700 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-medium text-slate-600 mb-1">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-slate-600 mb-2 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-sm text-slate-600 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-sm text-slate-600 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-slate-600">{children}</li>
  ),
  code: ({ children }) => (
    <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-slate-100 text-slate-800 p-3 rounded-md text-xs font-mono overflow-x-auto mb-2">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-slate-300 pl-3 text-sm text-slate-600 italic mb-2">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-700">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-600">{children}</em>
  ),
};

// Components optimized for editor preview (slightly larger text)
export const editorMarkdownComponents: Components = {
  ...baseMarkdownComponents,
  h1: ({ children }) => (
    <h1 className="text-xl font-bold mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-bold mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-4">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="mb-1">{children}</li>
  ),
  code: ({ children, ...props }) => (
    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-gray-100 p-3 rounded mb-4 overflow-x-auto">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4">{children}</blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-bold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),
};
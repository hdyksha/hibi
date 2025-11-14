/**
 * Client-side type definitions for Todo App
 * Based on server-side models
 */

export type Priority = 'high' | 'medium' | 'low';
export type FilterStatus = 'all' | 'pending' | 'completed';

/**
 * Type guard to check if a value is a valid Priority
 */
export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && ['high', 'medium', 'low'].includes(value);
}

/**
 * Type guard to check if a value is a valid FilterStatus
 */
export function isFilterStatus(value: unknown): value is FilterStatus {
  return typeof value === 'string' && ['all', 'pending', 'completed'].includes(value);
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  memo: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  // Animation state flags for optimistic updates
  isPending?: boolean;
  isExiting?: boolean;
}

export interface TodoFilter {
  status?: FilterStatus;
  priority?: Priority;
  tags?: string[];
  searchText?: string;
}

export interface CreateTodoItemInput {
  title: string;
  priority?: Priority;
  tags?: string[];
  memo?: string;
}

export interface UpdateTodoItemInput {
  title?: string;
  completed?: boolean;
  priority?: Priority;
  tags?: string[];
  memo?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: ValidationError[];
}

export interface ArchiveGroup {
  date: string;        // YYYY-MM-DD format
  tasks: TodoItem[];   // 完了済みtodoアイテム
  count: number;       // 完了タスク数
}

export interface FileInfo {
  files: string[];
  currentFile: string;
  directory: string;
}

export interface CurrentFileInfo {
  fileName: string;
  filePath: string;
  directory: string;
  todoCount: number;
}

export interface SwitchFileResponse {
  message: string;
  currentFile: string;
  filePath: string;
}
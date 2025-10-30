/**
 * Client-side type definitions for Todo App
 * Based on server-side models
 */

export type Priority = 'high' | 'medium' | 'low';
export type FilterStatus = 'all' | 'pending' | 'completed';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
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
}

export interface UpdateTodoItemInput {
  title?: string;
  completed?: boolean;
  priority?: Priority;
  tags?: string[];
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

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
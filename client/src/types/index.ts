/**
 * Client-side type definitions for Todo App
 * Based on server-side models
 */

export type Priority = 'high' | 'medium' | 'low';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoItemInput {
  title: string;
  priority?: Priority;
}

export interface UpdateTodoItemInput {
  title?: string;
  completed?: boolean;
  priority?: Priority;
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
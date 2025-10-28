/**
 * Client-side type definitions for Todo App
 * Based on server-side models
 */

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoItemInput {
  title: string;
}

export interface UpdateTodoItemInput {
  title?: string;
  completed?: boolean;
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
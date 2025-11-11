/**
 * ID generation utility
 * Requirements: 1.5 - 一意のIDを自動生成
 * 
 * This module provides utilities for generating unique identifiers
 * for TodoItem entities using UUID v4 standard.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID for TodoItem
 * Requirements: 1.5 - 一意のIDを自動生成
 * 
 * Uses UUID v4 to generate a universally unique identifier.
 * The generated ID is guaranteed to be unique across all TodoItems.
 * 
 * @returns A unique UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 * 
 * @example
 * ```typescript
 * const newTodo: TodoItem = {
 *   id: generateTodoId(),
 *   title: "Buy groceries",
 *   completed: false,
 *   // ... other fields
 * };
 * ```
 */
export function generateTodoId(): string {
    return uuidv4();
}
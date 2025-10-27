/**
 * ID generation utility
 * Requirements: 1.5 - 一意のIDを自動生成
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID for TodoItem
 * Requirements: 1.5 - 一意のIDを自動生成
 */
export function generateTodoId(): string {
    return uuidv4();
}
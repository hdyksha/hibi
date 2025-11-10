/**
 * Filter constants and default values
 * Centralized filter configuration to ensure consistency across the application
 */

import { TodoFilter } from '../types';

/**
 * Default filter applied to todo list
 * Shows only pending (incomplete) tasks by default
 */
export const DEFAULT_TODO_FILTER: TodoFilter = {
  status: 'pending'
};

/**
 * Default filter for archive view
 * Shows all archived items without filtering
 */
export const DEFAULT_ARCHIVE_FILTER: TodoFilter = {};

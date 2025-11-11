/**
 * Query parameter parsing utilities
 * Requirements: 1.1, 2.1, 4.1
 * 
 * This module provides utilities for parsing and validating query parameters
 * from HTTP requests, particularly for filtering operations.
 * 
 * The main function `buildFilterFromQuery` safely extracts and validates
 * filter parameters from Express request query objects, ensuring type safety
 * and preventing invalid data from reaching the business logic layer.
 */

import { TodoFilter, FilterStatus, Priority, FILTER_STATUS_VALUES, PRIORITY_VALUES } from '../models';

/**
 * Type guard to check if a value is a valid FilterStatus
 * 
 * @param value - The value to check
 * @returns True if the value is a valid FilterStatus ('all', 'pending', or 'completed')
 * 
 * @example
 * ```typescript
 * if (isFilterStatus(req.query.status)) {
 *   // TypeScript now knows status is FilterStatus
 *   filter.status = req.query.status;
 * }
 * ```
 */
function isFilterStatus(value: unknown): value is FilterStatus {
    return typeof value === 'string' && FILTER_STATUS_VALUES.includes(value as FilterStatus);
}

/**
 * Type guard to check if a value is a valid Priority
 * 
 * @param value - The value to check
 * @returns True if the value is a valid Priority ('high', 'medium', or 'low')
 * 
 * @example
 * ```typescript
 * if (isPriority(req.query.priority)) {
 *   // TypeScript now knows priority is Priority
 *   filter.priority = req.query.priority;
 * }
 * ```
 */
function isPriority(value: unknown): value is Priority {
    return typeof value === 'string' && PRIORITY_VALUES.includes(value as Priority);
}

/**
 * Type guard to check if a value is a string
 * 
 * @param value - The value to check
 * @returns True if the value is a string
 */
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

/**
 * Type guard to check if a value is an array of strings
 * 
 * @param value - The value to check
 * @returns True if the value is an array containing only strings
 */
function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Build a TodoFilter object from query parameters
 * Requirements: 2.1, 2.2
 * 
 * Safely extracts and validates filter parameters from Express request query objects.
 * Invalid or malformed parameters are silently ignored, ensuring the filter object
 * only contains valid, type-safe values.
 * 
 * Supported query parameters:
 * - `status`: Filter by completion status ('all', 'pending', 'completed')
 * - `priority`: Filter by priority level ('high', 'medium', 'low')
 * - `tags`: Filter by tags (can be a single string or array of strings)
 * - `search`: Search text to match against title, memo, and tags
 * 
 * @param query - The query object from Express request (req.query)
 * @returns A TodoFilter object with validated filter parameters
 * 
 * @example
 * ```typescript
 * // In a route handler
 * app.get('/todos', (req, res) => {
 *   const filter = buildFilterFromQuery(req.query);
 *   // filter is now type-safe and validated
 *   const todos = await todoService.getTodos(filter);
 *   res.json(todos);
 * });
 * 
 * // Example query strings:
 * // GET /todos?status=pending&priority=high
 * // GET /todos?tags=work&tags=urgent&search=meeting
 * // GET /todos?status=completed&search=project
 * ```
 */
export function buildFilterFromQuery(query: Record<string, unknown>): TodoFilter {
    const filter: TodoFilter = {};

    // Status filter
    if (isFilterStatus(query.status)) {
        filter.status = query.status;
    }

    // Priority filter
    if (isPriority(query.priority)) {
        filter.priority = query.priority;
    }

    // Tags filter
    if (query.tags) {
        if (isString(query.tags)) {
            filter.tags = [query.tags];
        } else if (isStringArray(query.tags)) {
            filter.tags = query.tags;
        } else if (Array.isArray(query.tags)) {
            // Filter out non-string elements
            filter.tags = query.tags.filter(isString);
        }
    }

    // Search text
    if (isString(query.search)) {
        filter.searchText = query.search.trim();
    }

    return filter;
}

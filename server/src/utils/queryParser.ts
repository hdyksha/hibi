/**
 * Query parameter parsing utilities
 * Requirements: 1.1, 2.1, 4.1
 * 
 * This module provides utilities for parsing and validating query parameters
 * from HTTP requests, particularly for filtering operations.
 */

import { TodoFilter, FilterStatus, Priority, FILTER_STATUS_VALUES, PRIORITY_VALUES } from '../models';

/**
 * Type guard to check if a value is a valid FilterStatus
 */
function isFilterStatus(value: unknown): value is FilterStatus {
    return typeof value === 'string' && FILTER_STATUS_VALUES.includes(value as FilterStatus);
}

/**
 * Type guard to check if a value is a valid Priority
 */
function isPriority(value: unknown): value is Priority {
    return typeof value === 'string' && PRIORITY_VALUES.includes(value as Priority);
}

/**
 * Type guard to check if a value is a string
 */
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

/**
 * Type guard to check if a value is an array of strings
 */
function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Build a TodoFilter object from query parameters
 * Requirements: 2.1, 2.2
 * 
 * @param query - The query object from Express request
 * @returns A TodoFilter object with validated filter parameters
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

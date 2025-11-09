/**
 * Query parameter parsing utilities
 * Requirements: 1.1, 2.1, 4.1
 * 
 * This module provides utilities for parsing and validating query parameters
 * from HTTP requests, particularly for filtering operations.
 */

import { TodoFilter, FilterStatus, Priority, FILTER_STATUS_VALUES, PRIORITY_VALUES } from '../models';

/**
 * Build a TodoFilter object from query parameters
 * Requirements: 2.1, 2.2
 * 
 * @param query - The query object from Express request
 * @returns A TodoFilter object with validated filter parameters
 */
export function buildFilterFromQuery(query: any): TodoFilter {
    const filter: TodoFilter = {};

    // Status filter
    if (query.status && FILTER_STATUS_VALUES.includes(query.status)) {
        filter.status = query.status as FilterStatus;
    }

    // Priority filter
    if (query.priority && PRIORITY_VALUES.includes(query.priority)) {
        filter.priority = query.priority as Priority;
    }

    // Tags filter
    if (query.tags) {
        if (typeof query.tags === 'string') {
            filter.tags = [query.tags];
        } else if (Array.isArray(query.tags)) {
            filter.tags = query.tags.filter((tag: any) => typeof tag === 'string');
        }
    }

    // Search text
    if (query.search && typeof query.search === 'string') {
        filter.searchText = query.search.trim();
    }

    return filter;
}

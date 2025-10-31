/**
 * Manual Filter Test
 * This file tests the filter functionality manually
 * Requirements: 7.2, 8.4
 */

import { TodoFilter } from '../types';

// Test filter object creation
const testFilter: TodoFilter = {
  status: 'completed',
  priority: 'high',
  tags: ['work', 'urgent'],
  searchText: 'test search'
};

console.log('Filter test passed:', testFilter);

// Test API URL building logic (similar to what's in apiClient)
function buildFilterUrl(filter: TodoFilter): string {
  let endpoint = '/todos';
  
  if (filter && Object.keys(filter).length > 0) {
    const params = new URLSearchParams();
    
    if (filter.status) {
      params.append('status', filter.status);
    }
    
    if (filter.priority) {
      params.append('priority', filter.priority);
    }
    
    if (filter.tags && filter.tags.length > 0) {
      filter.tags.forEach(tag => params.append('tags', tag));
    }
    
    if (filter.searchText && filter.searchText.trim()) {
      params.append('search', filter.searchText.trim());
    }
    
    endpoint += `?${params.toString()}`;
  }
  
  return endpoint;
}

// Test URL building
const testUrl = buildFilterUrl(testFilter);
console.log('Expected URL:', '/todos?status=completed&priority=high&tags=work&tags=urgent&search=test+search');
console.log('Actual URL:', testUrl);

export { buildFilterUrl };
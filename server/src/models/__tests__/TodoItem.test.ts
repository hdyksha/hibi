/**
 * Unit tests for TodoItem validation functions
 * Requirements: 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect } from 'vitest';
import {
  TodoItem,
  CreateTodoItemInput,
  UpdateTodoItemInput,
  Priority,
  validateTitle,
  validateCompleted,
  validateId,
  validateCreatedAt,
  validatePriority,
  validateTags,
  validateMemo,
  validateCreateTodoItemInput,
  validateUpdateTodoItemInput,
  validateTodoItem
} from '../TodoItem';

describe('TodoItem Validation Functions', () => {
  describe('validateTitle', () => {
    it('should pass validation for valid title', () => {
      const result = validateTitle('Valid todo title');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty string', () => {
      const result = validateTitle('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('title');
      expect(result.errors[0].message).toBe('Title cannot be empty');
    });

    it('should fail validation for whitespace only', () => {
      const result = validateTitle('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('title');
      expect(result.errors[0].message).toBe('Title cannot be empty');
    });

    it('should fail validation for non-string input', () => {
      const result = validateTitle(123 as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('title');
      expect(result.errors[0].message).toBe('Title is required and must be a string');
    });

    it('should fail validation for title exceeding 200 characters', () => {
      const longTitle = 'a'.repeat(201);
      const result = validateTitle(longTitle);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('title');
      expect(result.errors[0].message).toBe('Title cannot exceed 200 characters');
    });

    it('should pass validation for title with exactly 200 characters', () => {
      const maxTitle = 'a'.repeat(200);
      const result = validateTitle(maxTitle);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateCompleted', () => {
    it('should pass validation for true', () => {
      const result = validateCompleted(true);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for false', () => {
      const result = validateCompleted(false);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for non-boolean input', () => {
      const result = validateCompleted('true' as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('completed');
      expect(result.errors[0].message).toBe('Completed must be a boolean value');
    });
  });

  describe('validateId', () => {
    it('should pass validation for valid ID', () => {
      const result = validateId('valid-id-123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty string', () => {
      const result = validateId('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('id');
      expect(result.errors[0].message).toBe('ID cannot be empty');
    });

    it('should fail validation for whitespace only', () => {
      const result = validateId('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('id');
      expect(result.errors[0].message).toBe('ID cannot be empty');
    });

    it('should fail validation for non-string input', () => {
      const result = validateId(123 as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('id');
      expect(result.errors[0].message).toBe('ID is required and must be a string');
    });
  });

  describe('validateCreatedAt', () => {
    it('should pass validation for valid ISO 8601 date', () => {
      const result = validateCreatedAt('2023-12-01T10:30:00.000Z');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for current date', () => {
      const now = new Date().toISOString();
      const result = validateCreatedAt(now);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid date string', () => {
      const result = validateCreatedAt('invalid-date');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('createdAt');
      expect(result.errors[0].message).toBe('CreatedAt must be a valid ISO 8601 date string');
    });

    it('should fail validation for empty string', () => {
      const result = validateCreatedAt('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('createdAt');
      expect(result.errors[0].message).toBe('CreatedAt is required and must be a string');
    });

    it('should fail validation for non-string input', () => {
      const result = validateCreatedAt(123 as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('createdAt');
      expect(result.errors[0].message).toBe('CreatedAt is required and must be a string');
    });
  });

  describe('validatePriority', () => {
    it('should pass validation for high priority', () => {
      const result = validatePriority('high');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for medium priority', () => {
      const result = validatePriority('medium');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for low priority', () => {
      const result = validatePriority('low');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid priority string', () => {
      const result = validatePriority('urgent' as Priority);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('priority');
      expect(result.errors[0].message).toBe('Priority must be one of: high, medium, low');
    });

    it('should fail validation for non-string input', () => {
      const result = validatePriority(123 as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('priority');
      expect(result.errors[0].message).toBe('Priority is required and must be a string');
    });

    it('should fail validation for empty string', () => {
      const result = validatePriority('' as Priority);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('priority');
      expect(result.errors[0].message).toBe('Priority must be one of: high, medium, low');
    });
  });

  describe('validateTags', () => {
    it('should pass validation for empty tags array', () => {
      const result = validateTags([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid tags array', () => {
      const result = validateTags(['work', 'urgent', 'personal']);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for single tag', () => {
      const result = validateTags(['work']);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for non-array input', () => {
      const result = validateTags('work' as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tags must be an array');
    });

    it('should fail validation for array with non-string elements', () => {
      const result = validateTags(['work', 123, 'personal'] as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tag at index 1 must be a string');
    });

    it('should fail validation for array with empty string', () => {
      const result = validateTags(['work', '', 'personal']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tag at index 1 cannot be empty');
    });

    it('should fail validation for array with whitespace-only string', () => {
      const result = validateTags(['work', '   ', 'personal']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tag at index 1 cannot be empty');
    });

    it('should fail validation for tag exceeding 50 characters', () => {
      const longTag = 'a'.repeat(51);
      const result = validateTags(['work', longTag]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tag at index 1 cannot exceed 50 characters');
    });

    it('should pass validation for tag with exactly 50 characters', () => {
      const maxTag = 'a'.repeat(50);
      const result = validateTags(['work', maxTag]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for duplicate tags (case-insensitive)', () => {
      const result = validateTags(['work', 'WORK', 'personal']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tags must be unique (case-insensitive)');
    });

    it('should fail validation for exact duplicate tags', () => {
      const result = validateTags(['work', 'work', 'personal']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tags must be unique (case-insensitive)');
    });

    it('should fail validation for multiple errors', () => {
      const result = validateTags(['work', '', 123, 'a'.repeat(51)] as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      
      const messages = result.errors.map(error => error.message);
      expect(messages).toContain('Tag at index 1 cannot be empty');
      expect(messages).toContain('Tag at index 2 must be a string');
      expect(messages).toContain('Tag at index 3 cannot exceed 50 characters');
    });
  });

  describe('validateMemo', () => {
    it('should pass validation for empty string', () => {
      const result = validateMemo('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid memo text', () => {
      const result = validateMemo('This is a valid memo');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for memo with markdown', () => {
      const result = validateMemo('# Header\n\n**Bold text** and *italic text*\n\n- List item 1\n- List item 2');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for long memo text', () => {
      const longMemo = 'a'.repeat(1000);
      const result = validateMemo(longMemo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for non-string input', () => {
      const result = validateMemo(123 as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('memo');
      expect(result.errors[0].message).toBe('Memo must be a string');
    });

    it('should fail validation for null input', () => {
      const result = validateMemo(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('memo');
      expect(result.errors[0].message).toBe('Memo must be a string');
    });

    it('should fail validation for undefined input', () => {
      const result = validateMemo(undefined as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('memo');
      expect(result.errors[0].message).toBe('Memo must be a string');
    });
  });

  describe('validateCreateTodoItemInput', () => {
    it('should pass validation for valid input without priority and tags', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid todo title'
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid input with priority', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid todo title',
        priority: 'high'
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid input with tags', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid todo title',
        tags: ['work', 'urgent']
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid input with priority and tags', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid todo title',
        priority: 'high',
        tags: ['work', 'urgent']
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid input with memo', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid todo title',
        memo: 'This is a memo for the task'
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid input with all fields', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid todo title',
        priority: 'high',
        tags: ['work', 'urgent'],
        memo: 'Complete task memo'
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid input with empty tags array', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid todo title',
        tags: []
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid title', () => {
      const input: CreateTodoItemInput = {
        title: ''
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('title');
    });

    it('should fail validation for invalid priority', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid title',
        priority: 'urgent' as Priority
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('priority');
      expect(result.errors[0].message).toBe('Priority must be one of: high, medium, low');
    });

    it('should fail validation for invalid tags', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid title',
        tags: ['work', ''] // empty tag
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tag at index 1 cannot be empty');
    });

    it('should fail validation for invalid memo', () => {
      const input: CreateTodoItemInput = {
        title: 'Valid title',
        memo: 123 as any
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('memo');
      expect(result.errors[0].message).toBe('Memo must be a string');
    });

    it('should fail validation for both invalid title and priority', () => {
      const input: CreateTodoItemInput = {
        title: '',
        priority: 'invalid' as Priority
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      
      const fieldNames = result.errors.map(error => error.field);
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('priority');
    });

    it('should fail validation for multiple invalid fields', () => {
      const input: CreateTodoItemInput = {
        title: '',
        priority: 'invalid' as Priority,
        tags: ['work', ''] // empty tag
      };
      const result = validateCreateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      
      const fieldNames = result.errors.map(error => error.field);
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('priority');
      expect(fieldNames).toContain('tags');
    });
  });

  describe('validateUpdateTodoItemInput', () => {
    it('should pass validation for valid title update', () => {
      const input: UpdateTodoItemInput = {
        title: 'Updated title'
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid completed update', () => {
      const input: UpdateTodoItemInput = {
        completed: true
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid priority update', () => {
      const input: UpdateTodoItemInput = {
        priority: 'low'
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid tags update', () => {
      const input: UpdateTodoItemInput = {
        tags: ['work', 'urgent']
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid memo update', () => {
      const input: UpdateTodoItemInput = {
        memo: 'Updated memo content'
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for all fields update', () => {
      const input: UpdateTodoItemInput = {
        title: 'Updated title',
        completed: true,
        priority: 'high',
        tags: ['work', 'completed'],
        memo: 'Updated memo'
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for empty update object', () => {
      const input: UpdateTodoItemInput = {};
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for empty tags array update', () => {
      const input: UpdateTodoItemInput = {
        tags: []
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid title', () => {
      const input: UpdateTodoItemInput = {
        title: ''
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('title');
    });

    it('should fail validation for invalid completed', () => {
      const input: UpdateTodoItemInput = {
        completed: 'true' as any
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('completed');
    });

    it('should fail validation for invalid priority', () => {
      const input: UpdateTodoItemInput = {
        priority: 'critical' as Priority
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('priority');
      expect(result.errors[0].message).toBe('Priority must be one of: high, medium, low');
    });

    it('should fail validation for invalid tags', () => {
      const input: UpdateTodoItemInput = {
        tags: ['work', ''] // empty tag
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tag at index 1 cannot be empty');
    });

    it('should fail validation for invalid memo', () => {
      const input: UpdateTodoItemInput = {
        memo: null as any
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('memo');
      expect(result.errors[0].message).toBe('Memo must be a string');
    });

    it('should fail validation for multiple invalid fields', () => {
      const input: UpdateTodoItemInput = {
        title: '',
        completed: 'false' as any,
        priority: 'urgent' as Priority,
        tags: ['work', ''], // empty tag
        memo: 123 as any
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5);
      
      const fieldNames = result.errors.map(error => error.field);
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('completed');
      expect(fieldNames).toContain('priority');
      expect(fieldNames).toContain('tags');
      expect(fieldNames).toContain('memo');
    });
  });

  describe('validateTodoItem', () => {
    it('should pass validation for valid TodoItem with medium priority and empty tags', () => {
      const todoItem: TodoItem = {
        id: 'valid-id-123',
        title: 'Valid todo title',
        completed: false,
        priority: 'medium',
        tags: [],
        memo: '',
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z',
        completedAt: null
      };
      const result = validateTodoItem(todoItem);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid TodoItem with high priority and tags', () => {
      const todoItem: TodoItem = {
        id: 'high-priority-todo',
        title: 'High priority task',
        completed: false,
        priority: 'high',
        tags: ['work', 'urgent'],
        memo: 'Important task memo',
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z',
        completedAt: null
      };
      const result = validateTodoItem(todoItem);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid TodoItem with low priority', () => {
      const todoItem: TodoItem = {
        id: 'low-priority-todo',
        title: 'Low priority task',
        completed: false,
        priority: 'low',
        tags: ['personal'],
        memo: 'Personal task memo',
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z',
        completedAt: null
      };
      const result = validateTodoItem(todoItem);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for TodoItem with multiple invalid fields', () => {
      const todoItem: TodoItem = {
        id: '',
        title: '',
        completed: 'false' as any,
        priority: 'urgent' as Priority,
        tags: ['work', ''] as any, // empty tag
        memo: '',
        createdAt: 'invalid-date',
        updatedAt: 'invalid-date',
        completedAt: 'invalid-date' as any
      };
      const result = validateTodoItem(todoItem);
      expect(result.errors).toHaveLength(8);
      
      const fieldNames = result.errors.map(error => error.field);
      expect(fieldNames).toContain('id');
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('completed');
      expect(fieldNames).toContain('priority');
      expect(fieldNames).toContain('tags');
      expect(fieldNames).toContain('createdAt');
      expect(fieldNames).toContain('updatedAt');
      expect(fieldNames).toContain('completedAt');
    });

    it('should pass validation for completed TodoItem with tags', () => {
      const todoItem: TodoItem = {
        id: 'completed-todo-456',
        title: 'Completed todo',
        completed: true,
        priority: 'medium',
        tags: ['work', 'completed'],
        memo: 'Completed task memo',
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z',
        completedAt: '2023-12-01T11:00:00.000Z'
      };
      const result = validateTodoItem(todoItem);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for TodoItem with invalid priority only', () => {
      const todoItem: TodoItem = {
        id: 'valid-id-123',
        title: 'Valid todo title',
        completed: false,
        priority: 'critical' as Priority,
        tags: ['work'],
        memo: '',
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z',
        completedAt: null
      };
      const result = validateTodoItem(todoItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('priority');
      expect(result.errors[0].message).toBe('Priority must be one of: high, medium, low');
    });

    it('should fail validation for TodoItem with invalid tags only', () => {
      const todoItem: TodoItem = {
        id: 'valid-id-123',
        title: 'Valid todo title',
        completed: false,
        priority: 'medium',
        tags: ['work', ''], // empty tag
        memo: '',
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z',
        completedAt: null
      };
      const result = validateTodoItem(todoItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('tags');
      expect(result.errors[0].message).toBe('Tag at index 1 cannot be empty');
    });
  });
});
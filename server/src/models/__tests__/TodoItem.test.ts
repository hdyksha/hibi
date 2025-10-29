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

  describe('validateCreateTodoItemInput', () => {
    it('should pass validation for valid input without priority', () => {
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

    it('should pass validation for all fields update', () => {
      const input: UpdateTodoItemInput = {
        title: 'Updated title',
        completed: true,
        priority: 'high'
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

    it('should fail validation for multiple invalid fields', () => {
      const input: UpdateTodoItemInput = {
        title: '',
        completed: 'false' as any,
        priority: 'urgent' as Priority
      };
      const result = validateUpdateTodoItemInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      
      const fieldNames = result.errors.map(error => error.field);
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('completed');
      expect(fieldNames).toContain('priority');
    });
  });

  describe('validateTodoItem', () => {
    it('should pass validation for valid TodoItem with medium priority', () => {
      const todoItem: TodoItem = {
        id: 'valid-id-123',
        title: 'Valid todo title',
        completed: false,
        priority: 'medium',
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z'
      };
      const result = validateTodoItem(todoItem);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for valid TodoItem with high priority', () => {
      const todoItem: TodoItem = {
        id: 'high-priority-todo',
        title: 'High priority task',
        completed: false,
        priority: 'high',
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z'
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
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z'
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
        createdAt: 'invalid-date',
        updatedAt: 'invalid-date'
      };
      const result = validateTodoItem(todoItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(6);
      
      const fieldNames = result.errors.map(error => error.field);
      expect(fieldNames).toContain('id');
      expect(fieldNames).toContain('title');
      expect(fieldNames).toContain('completed');
      expect(fieldNames).toContain('priority');
      expect(fieldNames).toContain('createdAt');
      expect(fieldNames).toContain('updatedAt');
    });

    it('should pass validation for completed TodoItem', () => {
      const todoItem: TodoItem = {
        id: 'completed-todo-456',
        title: 'Completed todo',
        completed: true,
        priority: 'medium',
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z'
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
        createdAt: '2023-12-01T10:30:00.000Z',
        updatedAt: '2023-12-01T10:30:00.000Z'
      };
      const result = validateTodoItem(todoItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('priority');
      expect(result.errors[0].message).toBe('Priority must be one of: high, medium, low');
    });
  });
});
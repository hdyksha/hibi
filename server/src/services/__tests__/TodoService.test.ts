/**
 * TodoService tests
 * Requirements: 9.3 - Basic tests for TodoService core functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TodoService } from '../TodoService';
import { FileStorageService } from '../FileStorageService';
import { TodoItem, Priority } from '../../models';
import { join } from 'path';
import { promises as fs } from 'fs';

describe('TodoService', () => {
  let service: TodoService;
  let testFilePath: string;
  let storage: FileStorageService;

  beforeEach(async () => {
    // Create a unique test file for each test
    testFilePath = join(__dirname, `test-todos-${Date.now()}.json`);
    storage = new FileStorageService(testFilePath);
    service = new TodoService(storage);

    // Initialize with empty array
    await fs.writeFile(testFilePath, '[]', 'utf-8');
  });

  afterEach(async () => {
    // Clean up test file
    try {
      await fs.unlink(testFilePath);
    } catch {
      // Ignore if file doesn't exist
    }
  });

  describe('getTodos', () => {
    it('should return empty array when no todos exist', async () => {
      const todos = await service.getTodos();
      expect(todos).toEqual([]);
    });

    it('should return all todos when no filter is provided', async () => {
      // Create test todos
      await service.createTodo({ title: 'Test 1', priority: 'high' });
      await service.createTodo({ title: 'Test 2', priority: 'low' });

      const todos = await service.getTodos();
      expect(todos).toHaveLength(2);
      expect(todos[0].title).toBe('Test 1');
      expect(todos[1].title).toBe('Test 2');
    });
  });

  describe('createTodo', () => {
    it('should create a new todo with required fields', async () => {
      const input = { title: 'New Task', priority: 'medium' as Priority };
      const todo = await service.createTodo(input);

      expect(todo.title).toBe('New Task');
      expect(todo.priority).toBe('medium');
      expect(todo.completed).toBe(false);
      expect(todo.id).toBeDefined();
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });

    it('should create todo with optional fields', async () => {
      const input = {
        title: 'Task with details',
        priority: 'high' as Priority,
        tags: ['work', 'urgent'],
        memo: 'Important task'
      };
      const todo = await service.createTodo(input);

      expect(todo.tags).toEqual(['work', 'urgent']);
      expect(todo.memo).toBe('Important task');
    });

    it('should reject invalid input', async () => {
      await expect(service.createTodo({ title: '', priority: 'medium' }))
        .rejects.toThrow();
    });
  });

  describe('updateTodo', () => {
    it('should update todo fields', async () => {
      const created = await service.createTodo({ title: 'Original', priority: 'low' });
      
      const updated = await service.updateTodo(created.id, {
        title: 'Updated',
        priority: 'high'
      });

      expect(updated.title).toBe('Updated');
      expect(updated.priority).toBe('high');
    });

    it('should set completedAt when marking as completed', async () => {
      const created = await service.createTodo({ title: 'Task', priority: 'medium' });
      
      const updated = await service.updateTodo(created.id, { completed: true });

      expect(updated.completed).toBe(true);
      expect(updated.completedAt).toBeDefined();
    });

    it('should reject update for non-existent todo', async () => {
      await expect(service.updateTodo('non-existent-id', { title: 'Updated' }))
        .rejects.toThrow();
    });
  });

  describe('deleteTodo', () => {
    it('should delete existing todo', async () => {
      const created = await service.createTodo({ title: 'To Delete', priority: 'low' });
      
      const result = await service.deleteTodo(created.id);
      expect(result).toBe(true);

      const todos = await service.getTodos();
      expect(todos).toHaveLength(0);
    });

    it('should reject deletion of non-existent todo', async () => {
      await expect(service.deleteTodo('non-existent-id'))
        .rejects.toThrow();
    });
  });

  describe('applyFilter', () => {
    let todos: TodoItem[];

    beforeEach(async () => {
      // Create test data
      const todo1 = await service.createTodo({
        title: 'High priority task',
        priority: 'high',
        tags: ['work', 'urgent']
      });
      
      const todo2 = await service.createTodo({
        title: 'Low priority task',
        priority: 'low',
        tags: ['personal']
      });
      
      const todo3 = await service.createTodo({
        title: 'Medium task with memo',
        priority: 'medium',
        memo: 'Important notes here'
      });

      // Mark one as completed
      await service.updateTodo(todo2.id, { completed: true });

      todos = await service.getTodos();
    });

    it('should filter by status - pending', () => {
      const filtered = service.applyFilter(todos, { status: 'pending' });
      expect(filtered.length).toBe(2);
      expect(filtered.every(t => !t.completed)).toBe(true);
    });

    it('should filter by status - completed', () => {
      const filtered = service.applyFilter(todos, { status: 'completed' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].completed).toBe(true);
    });

    it('should filter by priority', () => {
      const filtered = service.applyFilter(todos, { priority: 'high' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].priority).toBe('high');
    });

    it('should filter by tags', () => {
      const filtered = service.applyFilter(todos, { tags: ['work'] });
      expect(filtered.length).toBe(1);
      expect(filtered[0].tags).toContain('work');
    });

    it('should filter by search text in title', () => {
      const filtered = service.applyFilter(todos, { searchText: 'High' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toContain('High');
    });

    it('should filter by search text in memo', () => {
      const filtered = service.applyFilter(todos, { searchText: 'Important' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].memo).toContain('Important');
    });

    it('should filter by search text in tags', () => {
      const filtered = service.applyFilter(todos, { searchText: 'urgent' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].tags).toContain('urgent');
    });

    it('should combine multiple filters', () => {
      const filtered = service.applyFilter(todos, {
        status: 'pending',
        priority: 'high'
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].priority).toBe('high');
      expect(filtered[0].completed).toBe(false);
    });
  });

  describe('getArchive', () => {
    it('should return empty array when no completed todos', async () => {
      await service.createTodo({ title: 'Pending task', priority: 'medium' });
      
      const archive = await service.getArchive();
      expect(archive).toEqual([]);
    });

    it('should return completed todos grouped by date', async () => {
      const todo1 = await service.createTodo({ title: 'Task 1', priority: 'high' });
      const todo2 = await service.createTodo({ title: 'Task 2', priority: 'low' });
      
      await service.updateTodo(todo1.id, { completed: true });
      await service.updateTodo(todo2.id, { completed: true });

      const archive = await service.getArchive();
      expect(archive.length).toBeGreaterThan(0);
      expect(archive[0].tasks.length).toBe(2);
      expect(archive[0].count).toBe(2);
    });

    it('should sort groups by date (newest first)', async () => {
      const todo = await service.createTodo({ title: 'Task', priority: 'medium' });
      await service.updateTodo(todo.id, { completed: true });

      const archive = await service.getArchive();
      expect(archive.length).toBe(1);
      expect(archive[0].date).toBeDefined();
    });
  });
});

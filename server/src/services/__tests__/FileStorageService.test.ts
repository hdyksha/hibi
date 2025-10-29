/**
 * Unit tests for FileStorageService
 * Requirements: 1.2, 3.3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { FileStorageService, StorageError } from '../FileStorageService';
import { TodoItem } from '../../models';

describe('FileStorageService', () => {
  const testDataDir = join(process.cwd(), 'test-data');
  const testFilePath = join(testDataDir, 'test-tasks.json');
  let storageService: FileStorageService;

  // Sample test data
  const sampleTodo1: TodoItem = {
    id: 'test-id-1',
    title: 'Test Todo 1',
    completed: false,
    priority: 'medium',
    createdAt: '2023-12-01T10:30:00.000Z',
    updatedAt: '2023-12-01T10:30:00.000Z'
  };

  const sampleTodo2: TodoItem = {
    id: 'test-id-2',
    title: 'Test Todo 2',
    completed: true,
    priority: 'high',
    createdAt: '2023-12-01T11:30:00.000Z',
    updatedAt: '2023-12-01T11:30:00.000Z'
  };

  beforeEach(() => {
    storageService = new FileStorageService(testFilePath);
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('should create instance with default file path', () => {
      const defaultService = new FileStorageService();
      expect(defaultService.getFilePath()).toContain('data/tasks.json');
    });

    it('should create instance with custom file path', () => {
      const customPath = '/custom/path/tasks.json';
      const customService = new FileStorageService(customPath);
      expect(customService.getFilePath()).toBe(customPath);
    });
  });

  describe('readTodos', () => {
    it('should return empty array when file does not exist', async () => {
      const todos = await storageService.readTodos();
      expect(todos).toEqual([]);
    });

    it('should return empty array when file is empty', async () => {
      // Create empty file
      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(testFilePath, '', 'utf-8');

      const todos = await storageService.readTodos();
      expect(todos).toEqual([]);
    });

    it('should read todos from valid JSON file', async () => {
      // Create test file with sample data
      await fs.mkdir(testDataDir, { recursive: true });
      const testData = [sampleTodo1, sampleTodo2];
      await fs.writeFile(testFilePath, JSON.stringify(testData, null, 2), 'utf-8');

      const todos = await storageService.readTodos();
      expect(todos).toEqual(testData);
    });

    it('should throw StorageError for invalid JSON', async () => {
      // Create file with invalid JSON
      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(testFilePath, '{ invalid json }', 'utf-8');

      await expect(storageService.readTodos()).rejects.toThrow(StorageError);
      await expect(storageService.readTodos()).rejects.toThrow('Invalid JSON format');
    });

    it('should throw StorageError for non-array data', async () => {
      // Create file with non-array JSON
      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(testFilePath, '{"not": "an array"}', 'utf-8');

      await expect(storageService.readTodos()).rejects.toThrow(StorageError);
      await expect(storageService.readTodos()).rejects.toThrow('Invalid data format');
    });
  });

  describe('writeTodos', () => {
    it('should write todos to file', async () => {
      const testData = [sampleTodo1, sampleTodo2];
      
      await storageService.writeTodos(testData);

      // Verify file was created and contains correct data
      const fileContent = await fs.readFile(testFilePath, 'utf-8');
      const parsedData = JSON.parse(fileContent);
      expect(parsedData).toEqual(testData);
    });

    it('should write empty array to file', async () => {
      await storageService.writeTodos([]);

      const fileContent = await fs.readFile(testFilePath, 'utf-8');
      const parsedData = JSON.parse(fileContent);
      expect(parsedData).toEqual([]);
    });

    it('should create directory if it does not exist', async () => {
      const testData = [sampleTodo1];
      
      await storageService.writeTodos(testData);

      // Verify directory was created
      const dirExists = await fs.access(testDataDir).then(() => true).catch(() => false);
      expect(dirExists).toBe(true);
    });

    it('should format JSON with proper indentation', async () => {
      const testData = [sampleTodo1];
      
      await storageService.writeTodos(testData);

      const fileContent = await fs.readFile(testFilePath, 'utf-8');
      expect(fileContent).toContain('  '); // Should have indentation
      expect(fileContent).toContain('\n'); // Should have line breaks
    });
  });

  describe('addTodo', () => {
    it('should add todo to empty storage', async () => {
      await storageService.addTodo(sampleTodo1);

      const todos = await storageService.readTodos();
      expect(todos).toEqual([sampleTodo1]);
    });

    it('should add todo to existing storage', async () => {
      // First add one todo
      await storageService.addTodo(sampleTodo1);
      
      // Then add another
      await storageService.addTodo(sampleTodo2);

      const todos = await storageService.readTodos();
      expect(todos).toEqual([sampleTodo1, sampleTodo2]);
    });
  });

  describe('updateTodo', () => {
    beforeEach(async () => {
      // Setup initial data
      await storageService.writeTodos([sampleTodo1, sampleTodo2]);
    });

    it('should update existing todo', async () => {
      const updatedTodo: TodoItem = {
        ...sampleTodo1,
        title: 'Updated Title',
        completed: true
      };

      const result = await storageService.updateTodo(sampleTodo1.id, updatedTodo);
      expect(result).toBe(true);

      const todos = await storageService.readTodos();
      expect(todos[0]).toEqual(updatedTodo);
      expect(todos[1]).toEqual(sampleTodo2); // Other todo unchanged
    });

    it('should return false for non-existent todo', async () => {
      const updatedTodo: TodoItem = {
        ...sampleTodo1,
        id: 'non-existent-id'
      };

      const result = await storageService.updateTodo('non-existent-id', updatedTodo);
      expect(result).toBe(false);

      // Verify original data unchanged
      const todos = await storageService.readTodos();
      expect(todos).toEqual([sampleTodo1, sampleTodo2]);
    });
  });

  describe('removeTodo', () => {
    beforeEach(async () => {
      // Setup initial data
      await storageService.writeTodos([sampleTodo1, sampleTodo2]);
    });

    it('should remove existing todo', async () => {
      const result = await storageService.removeTodo(sampleTodo1.id);
      expect(result).toBe(true);

      const todos = await storageService.readTodos();
      expect(todos).toEqual([sampleTodo2]);
    });

    it('should return false for non-existent todo', async () => {
      const result = await storageService.removeTodo('non-existent-id');
      expect(result).toBe(false);

      // Verify original data unchanged
      const todos = await storageService.readTodos();
      expect(todos).toEqual([sampleTodo1, sampleTodo2]);
    });

    it('should handle removing from empty storage', async () => {
      await storageService.writeTodos([]);
      
      const result = await storageService.removeTodo('any-id');
      expect(result).toBe(false);

      const todos = await storageService.readTodos();
      expect(todos).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should throw StorageError with proper error chaining', async () => {
      // Try to read from an invalid path (permission denied scenario)
      const invalidService = new FileStorageService('/root/invalid/path/tasks.json');
      
      try {
        await invalidService.writeTodos([sampleTodo1]);
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).message).toContain('Failed to write todos to storage');
        expect((error as StorageError).cause).toBeDefined();
      }
    });

    it('should preserve original error information', async () => {
      // Create file with invalid JSON
      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(testFilePath, '{ invalid json }', 'utf-8');

      try {
        await storageService.readTodos();
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).message).toContain('Invalid JSON format');
        expect((error as StorageError).cause).toBeInstanceOf(SyntaxError);
      }
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete CRUD operations', async () => {
      // Create
      await storageService.addTodo(sampleTodo1);
      let todos = await storageService.readTodos();
      expect(todos).toHaveLength(1);

      // Read
      expect(todos[0]).toEqual(sampleTodo1);

      // Update
      const updatedTodo = { ...sampleTodo1, completed: true };
      await storageService.updateTodo(sampleTodo1.id, updatedTodo);
      todos = await storageService.readTodos();
      expect(todos[0].completed).toBe(true);

      // Delete
      await storageService.removeTodo(sampleTodo1.id);
      todos = await storageService.readTodos();
      expect(todos).toHaveLength(0);
    });

    it('should handle concurrent operations safely', async () => {
      // Simulate concurrent adds
      const promises = [
        storageService.addTodo(sampleTodo1),
        storageService.addTodo(sampleTodo2)
      ];

      await Promise.all(promises);

      const todos = await storageService.readTodos();
      expect(todos).toHaveLength(2);
      expect(todos).toContainEqual(sampleTodo1);
      expect(todos).toContainEqual(sampleTodo2);
    });
  });
});
/**
 * File management API routes tests
 * Requirements: ファイル選択機能の動作確認テスト
 */

import request from 'supertest';
import { app } from '../../index';
import { promises as fs } from 'fs';
import { join } from 'path';
import { setDefaultStorageService, FileStorageService } from '../../services/FileStorageService';
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';

/**
 * Get the project root directory for tests
 * This file is at: server/src/routes/__tests__/files.test.ts
 * Project root is 4 levels up: ../../../../
 */
function getTestProjectRoot(): string {
    return join(__dirname, '..', '..', '..', '..');
}

describe('File Management API', () => {
  // Get the data directory based on environment variable or default
  function getTestDataDir(): string {
    const projectRoot = getTestProjectRoot();
    return process.env.TODO_DATA_DIR 
      ? join(projectRoot, process.env.TODO_DATA_DIR)
      : join(projectRoot, 'server', 'data');
  }
  
  beforeAll(async () => {
    const testDataDir = getTestDataDir();
    
    // Ensure test data directory exists
    await fs.mkdir(testDataDir, { recursive: true });
    
    // Create personal-tasks.json for testing
    const personalTasksPath = join(testDataDir, 'personal-tasks.json');
    await fs.writeFile(personalTasksPath, JSON.stringify([
      {
        id: 'personal-1',
        title: 'Personal task 1',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ], null, 2));
  });
  
  beforeEach(() => {
    // Reset to default storage service before each test
    setDefaultStorageService(new FileStorageService());
  });

  describe('GET /api/files', () => {
    it('should return list of JSON files in data directory', async () => {
      const response = await request(app)
        .get('/api/files')
        .expect(200);

      expect(response.body).toHaveProperty('files');
      expect(response.body).toHaveProperty('currentFile');
      expect(response.body).toHaveProperty('directory');
      expect(Array.isArray(response.body.files)).toBe(true);
      expect(response.body.files.every((file: string) => file.endsWith('.json'))).toBe(true);
    });

    it('should include tasks.json in the file list', async () => {
      const response = await request(app)
        .get('/api/files')
        .expect(200);

      expect(response.body.files).toContain('tasks.json');
    });
  });

  describe('POST /api/files/switch', () => {
    it('should switch to a different data file', async () => {
      const response = await request(app)
        .post('/api/files/switch')
        .send({ fileName: 'tasks.json' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('currentFile', 'tasks.json');
      expect(response.body).toHaveProperty('filePath');
    });

    it('should reject invalid file name', async () => {
      const response = await request(app)
        .post('/api/files/switch')
        .send({ fileName: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject file name with invalid characters', async () => {
      const response = await request(app)
        .post('/api/files/switch')
        .send({ fileName: '../../../etc/passwd' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject non-existent file', async () => {
      const response = await request(app)
        .post('/api/files/switch')
        .send({ fileName: 'nonexistent.json' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing fileName', async () => {
      const response = await request(app)
        .post('/api/files/switch')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/files/current', () => {
    it('should return current file information', async () => {
      const response = await request(app)
        .get('/api/files/current')
        .expect(200);

      expect(response.body).toHaveProperty('fileName');
      expect(response.body).toHaveProperty('filePath');
      expect(response.body).toHaveProperty('directory');
      expect(response.body).toHaveProperty('todoCount');
      expect(typeof response.body.todoCount).toBe('number');
    });

    it('should return correct todo count', async () => {
      const response = await request(app)
        .get('/api/files/current')
        .expect(200);

      expect(response.body.todoCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('File switching integration', () => {
    it('should load todos from switched file', async () => {
      // Switch to personal-tasks.json
      const switchResponse = await request(app)
        .post('/api/files/switch')
        .send({ fileName: 'personal-tasks.json' })
        .expect(200);

      expect(switchResponse.body.currentFile).toBe('personal-tasks.json');

      // Get todos from the switched file
      const todosResponse = await request(app)
        .get('/api/todos')
        .expect(200);

      // Verify we're getting todos from personal-tasks.json
      expect(Array.isArray(todosResponse.body)).toBe(true);
      
      // Get current file info
      const fileInfoResponse = await request(app)
        .get('/api/files/current')
        .expect(200);

      expect(fileInfoResponse.body).toHaveProperty('fileName');
      expect(fileInfoResponse.body.fileName).toBe('personal-tasks.json');
      expect(fileInfoResponse.body.todoCount).toBe(todosResponse.body.length);
    });
  });
});

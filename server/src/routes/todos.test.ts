/**
 * Tests for Todo API routes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { app, server } from '../index';
import { TodoItem } from '../models';

describe('POST /api/todos', () => {
    const testDataPath = join(process.cwd(), 'data', 'tasks.json');

    beforeEach(async () => {
        // Clean up test data before each test
        try {
            await fs.unlink(testDataPath);
        } catch {
            // File doesn't exist, which is fine
        }
    });

    afterAll(async () => {
        // Clean up test data after all tests
        try {
            await fs.unlink(testDataPath);
        } catch {
            // File doesn't exist, which is fine
        }
        if (server) {
            server.close();
        }
    });

    describe('正常系テスト', () => {
        it('should create a new todo with valid title', async () => {
            const todoData = {
                title: 'Test Todo Item'
            };

            const response = await request(app)
                .post('/api/todos')
                .send(todoData)
                .expect(201);

            const createdTodo: TodoItem = response.body;

            // 要件 1.5: 一意のIDを自動生成
            expect(createdTodo.id).toBeDefined();
            expect(typeof createdTodo.id).toBe('string');
            expect(createdTodo.id.length).toBeGreaterThan(0);

            // 要件 1.3: タイトルは必須
            expect(createdTodo.title).toBe('Test Todo Item');

            // 要件 1.4: デフォルトで未完了ステータス
            expect(createdTodo.completed).toBe(false);

            // 要件 1.6: 作成日時を自動記録
            expect(createdTodo.createdAt).toBeDefined();
            expect(typeof createdTodo.createdAt).toBe('string');

            // Validate ISO 8601 format
            const createdDate = new Date(createdTodo.createdAt);
            expect(createdDate.toISOString()).toBe(createdTodo.createdAt);
        });

        it('should trim whitespace from title', async () => {
            const todoData = {
                title: '  Test Todo with Spaces  '
            };

            const response = await request(app)
                .post('/api/todos')
                .send(todoData)
                .expect(201);

            expect(response.body.title).toBe('Test Todo with Spaces');
        });

        it('should persist todo to storage', async () => {
            const todoData = {
                title: 'Persistent Todo'
            };

            await request(app)
                .post('/api/todos')
                .send(todoData)
                .expect(201);

            // Check if file was created and contains the todo
            const fileContent = await fs.readFile(testDataPath, 'utf-8');
            const todos: TodoItem[] = JSON.parse(fileContent);

            expect(todos).toHaveLength(1);
            expect(todos[0].title).toBe('Persistent Todo');
            expect(todos[0].completed).toBe(false);
        });

        it('should generate unique IDs for multiple todos', async () => {
            const todo1Data = { title: 'First Todo' };
            const todo2Data = { title: 'Second Todo' };

            const response1 = await request(app)
                .post('/api/todos')
                .send(todo1Data)
                .expect(201);

            const response2 = await request(app)
                .post('/api/todos')
                .send(todo2Data)
                .expect(201);

            expect(response1.body.id).not.toBe(response2.body.id);
        });
    });

    describe('異常系テスト', () => {
        it('should return 400 when title is missing', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({})
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details).toBeDefined();
            expect(response.body.details).toHaveLength(1);
            expect(response.body.details[0].field).toBe('title');
        });

        it('should return 400 when title is empty string', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: '' })
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details[0].field).toBe('title');
            expect(response.body.details[0].message).toBe('Title cannot be empty');
        });

        it('should return 400 when title is only whitespace', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: '   ' })
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details[0].field).toBe('title');
            expect(response.body.details[0].message).toBe('Title cannot be empty');
        });

        it('should return 400 when title is not a string', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: 123 })
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details[0].field).toBe('title');
            expect(response.body.details[0].message).toBe('Title is required and must be a string');
        });

        it('should return 400 when title exceeds 200 characters', async () => {
            const longTitle = 'a'.repeat(201);

            const response = await request(app)
                .post('/api/todos')
                .send({ title: longTitle })
                .expect(400);

            expect(response.body.error).toBe('Validation failed');
            expect(response.body.details[0].field).toBe('title');
            expect(response.body.details[0].message).toBe('Title cannot exceed 200 characters');
        });

        it('should return 400 when request body is not JSON', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send('invalid json')
                .expect(400);

            // Express will handle malformed JSON and return 400
        });
    });
});
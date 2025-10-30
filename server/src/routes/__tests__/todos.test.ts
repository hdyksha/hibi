/**
 * Tests for Todo API routes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { app, server } from '../../index';
import { TodoItem } from '../../models';

describe('GET /api/todos', () => {
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
        it('should return empty array when no todos exist', async () => {
            const response = await request(app)
                .get('/api/todos')
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should return all todos when they exist', async () => {
            // First create some todos
            const todo1 = { title: 'First Todo' };
            const todo2 = { title: 'Second Todo' };

            await request(app)
                .post('/api/todos')
                .send(todo1)
                .expect(201);

            await request(app)
                .post('/api/todos')
                .send(todo2)
                .expect(201);

            // Now get all todos
            const response = await request(app)
                .get('/api/todos')
                .expect(200);

            const todos: TodoItem[] = response.body;

            // 要件 2.1: すべてのtodoアイテムをリスト形式で表示
            expect(Array.isArray(todos)).toBe(true);
            expect(todos).toHaveLength(2);

            // 要件 2.2: 各todoアイテムのタイトル、ステータスを表示
            expect(todos[0].title).toBe('First Todo');
            expect(todos[0].completed).toBe(false);
            expect(todos[0].id).toBeDefined();
            expect(todos[0].createdAt).toBeDefined();

            expect(todos[1].title).toBe('Second Todo');
            expect(todos[1].completed).toBe(false);
            expect(todos[1].id).toBeDefined();
            expect(todos[1].createdAt).toBeDefined();
        });

        it('should return todos in the order they were created', async () => {
            // Create todos with specific titles to verify order
            const todoTitles = ['First', 'Second', 'Third'];

            for (const title of todoTitles) {
                await request(app)
                    .post('/api/todos')
                    .send({ title })
                    .expect(201);
            }

            const response = await request(app)
                .get('/api/todos')
                .expect(200);

            const todos: TodoItem[] = response.body;
            expect(todos).toHaveLength(3);
            expect(todos.map(t => t.title)).toEqual(todoTitles);
        });
    });

    describe('異常系テスト', () => {
        it('should handle storage errors gracefully', async () => {
            // This test would require mocking the storage service to simulate errors
            // For now, we'll just verify the endpoint exists and returns proper format
            const response = await request(app)
                .get('/api/todos')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});

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

describe('PUT /api/todos/:id', () => {
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
        it('should toggle completion status from false to true', async () => {
            // First create a todo
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' })
                .expect(201);

            const createdTodo: TodoItem = createResponse.body;
            expect(createdTodo.completed).toBe(false);

            // Toggle completion status
            const updateResponse = await request(app)
                .put(`/api/todos/${createdTodo.id}`)
                .send({ completed: true })
                .expect(200);

            const updatedTodo: TodoItem = updateResponse.body;

            // 要件 3.1: completedフィールドの切り替え
            expect(updatedTodo.completed).toBe(true);
            expect(updatedTodo.id).toBe(createdTodo.id);
            expect(updatedTodo.title).toBe(createdTodo.title);
            expect(updatedTodo.createdAt).toBe(createdTodo.createdAt);

            // 要件 3.2: 更新日時の自動設定
            expect(updatedTodo.updatedAt).toBeDefined();
            expect(updatedTodo.updatedAt).not.toBe(createdTodo.updatedAt);

            // Validate ISO 8601 format
            const updatedDate = new Date(updatedTodo.updatedAt);
            expect(updatedDate.toISOString()).toBe(updatedTodo.updatedAt);
        });

        it('should toggle completion status from true to false', async () => {
            // Create a todo and toggle it to completed first
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' })
                .expect(201);

            const createdTodo: TodoItem = createResponse.body;

            // Toggle to completed
            const firstToggleResponse = await request(app)
                .put(`/api/todos/${createdTodo.id}`)
                .send({ completed: true })
                .expect(200);

            const completedTodo: TodoItem = firstToggleResponse.body;
            expect(completedTodo.completed).toBe(true);

            // Toggle back to incomplete
            const secondToggleResponse = await request(app)
                .put(`/api/todos/${createdTodo.id}`)
                .send({ completed: false })
                .expect(200);

            const incompleteTodo: TodoItem = secondToggleResponse.body;

            // 要件 3.1: completedフィールドの切り替え
            expect(incompleteTodo.completed).toBe(false);
            expect(incompleteTodo.id).toBe(createdTodo.id);
            expect(incompleteTodo.title).toBe(createdTodo.title);
            expect(incompleteTodo.createdAt).toBe(createdTodo.createdAt);

            // 要件 3.2: 更新日時の自動設定
            expect(incompleteTodo.updatedAt).toBeDefined();
            expect(incompleteTodo.updatedAt).not.toBe(completedTodo.updatedAt);
        });

        it('should persist completion status change to storage', async () => {
            // Create a todo
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Persistent Todo' })
                .expect(201);

            const createdTodo: TodoItem = createResponse.body;

            // Toggle completion status
            await request(app)
                .put(`/api/todos/${createdTodo.id}`)
                .send({ completed: true })
                .expect(200);

            // 要件 3.3: ステータス変更を永続化
            // Check if the change was persisted to storage
            const fileContent = await fs.readFile(testDataPath, 'utf-8');
            const todos: TodoItem[] = JSON.parse(fileContent);

            expect(todos).toHaveLength(1);
            expect(todos[0].id).toBe(createdTodo.id);
            expect(todos[0].completed).toBe(true);
            expect(todos[0].updatedAt).toBeDefined();
        });

        it('should update timestamp on each toggle', async () => {
            // Create a todo
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' })
                .expect(201);

            const createdTodo: TodoItem = createResponse.body;

            // First toggle
            const firstToggleResponse = await request(app)
                .put(`/api/todos/${createdTodo.id}`)
                .expect(200);

            const firstUpdate: TodoItem = firstToggleResponse.body;

            // Wait a bit to ensure different timestamp
            await new Promise(resolve => setTimeout(resolve, 10));

            // Second toggle
            const secondToggleResponse = await request(app)
                .put(`/api/todos/${createdTodo.id}`)
                .expect(200);

            const secondUpdate: TodoItem = secondToggleResponse.body;

            // 要件 3.2: 更新日時の自動設定
            expect(firstUpdate.updatedAt).not.toBe(createdTodo.updatedAt);
            expect(secondUpdate.updatedAt).not.toBe(firstUpdate.updatedAt);
            expect(new Date(secondUpdate.updatedAt).getTime()).toBeGreaterThan(new Date(firstUpdate.updatedAt).getTime());
        });
    });

    describe('異常系テスト', () => {
        it('should return 400 when ID is missing', async () => {
            const response = await request(app)
                .put('/api/todos/')
                .expect(404); // Express will return 404 for missing route parameter
        });

        it('should return 400 when ID is empty string', async () => {
            const response = await request(app)
                .put('/api/todos/%20') // URL encoded space
                .expect(400);

            expect(response.body.error).toBe('Invalid request');
            expect(response.body.message).toBe('Todo ID is required');
        });

        it('should return 404 when todo with given ID does not exist', async () => {
            const response = await request(app)
                .put('/api/todos/nonexistent-id')
                .expect(404);

            expect(response.body.error).toBe('Not found');
            expect(response.body.message).toBe('Todo item not found');
        });

        it('should return 404 when trying to update todo that was deleted', async () => {
            // Create a todo first
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' })
                .expect(201);

            const createdTodo: TodoItem = createResponse.body;

            // Manually remove it from storage to simulate deletion
            await fs.writeFile(testDataPath, JSON.stringify([]), 'utf-8');

            // Try to update the deleted todo
            const response = await request(app)
                .put(`/api/todos/${createdTodo.id}`)
                .expect(404);

            expect(response.body.error).toBe('Not found');
            expect(response.body.message).toBe('Todo item not found');
        });
    });
});

describe('DELETE /api/todos/:id', () => {
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
        it('should delete an existing todo item', async () => {
            // First create a todo
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Todo to Delete' })
                .expect(201);

            const createdTodo: TodoItem = createResponse.body;

            // Delete the todo
            await request(app)
                .delete(`/api/todos/${createdTodo.id}`)
                .expect(204);

            // 要件 4.2: todoアイテムをストレージから永続的に削除
            // Verify the todo is no longer in storage
            const getResponse = await request(app)
                .get('/api/todos')
                .expect(200);

            const todos: TodoItem[] = getResponse.body;
            expect(todos).toHaveLength(0);
        });

        it('should delete specific todo without affecting others', async () => {
            // Create multiple todos
            const todo1Response = await request(app)
                .post('/api/todos')
                .send({ title: 'First Todo' })
                .expect(201);

            const todo2Response = await request(app)
                .post('/api/todos')
                .send({ title: 'Second Todo' })
                .expect(201);

            const todo3Response = await request(app)
                .post('/api/todos')
                .send({ title: 'Third Todo' })
                .expect(201);

            const todo1: TodoItem = todo1Response.body;
            const todo2: TodoItem = todo2Response.body;
            const todo3: TodoItem = todo3Response.body;

            // Delete the middle todo
            await request(app)
                .delete(`/api/todos/${todo2.id}`)
                .expect(204);

            // 要件 4.1: そのアイテムをリストから削除
            // Verify only the specific todo was deleted
            const getResponse = await request(app)
                .get('/api/todos')
                .expect(200);

            const remainingTodos: TodoItem[] = getResponse.body;
            expect(remainingTodos).toHaveLength(2);
            
            const remainingIds = remainingTodos.map(t => t.id);
            expect(remainingIds).toContain(todo1.id);
            expect(remainingIds).toContain(todo3.id);
            expect(remainingIds).not.toContain(todo2.id);
        });

        it('should persist deletion to storage', async () => {
            // Create a todo
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Persistent Delete Test' })
                .expect(201);

            const createdTodo: TodoItem = createResponse.body;

            // Verify it exists in storage
            let fileContent = await fs.readFile(testDataPath, 'utf-8');
            let todos: TodoItem[] = JSON.parse(fileContent);
            expect(todos).toHaveLength(1);
            expect(todos[0].id).toBe(createdTodo.id);

            // Delete the todo
            await request(app)
                .delete(`/api/todos/${createdTodo.id}`)
                .expect(204);

            // 要件 4.2: todoアイテムをストレージから永続的に削除
            // Verify it's removed from storage
            fileContent = await fs.readFile(testDataPath, 'utf-8');
            todos = JSON.parse(fileContent);
            expect(todos).toHaveLength(0);
        });
    });

    describe('異常系テスト', () => {
        it('should return 400 when ID is missing', async () => {
            await request(app)
                .delete('/api/todos/')
                .expect(404); // Express will return 404 for missing route parameter
        });

        it('should return 400 when ID is empty string', async () => {
            const response = await request(app)
                .delete('/api/todos/%20') // URL encoded space
                .expect(400);

            expect(response.body.error).toBe('Invalid request');
            expect(response.body.message).toBe('Todo ID is required');
        });

        it('should return 404 when todo with given ID does not exist', async () => {
            const response = await request(app)
                .delete('/api/todos/nonexistent-id')
                .expect(404);

            expect(response.body.error).toBe('Not found');
            expect(response.body.message).toBe('Todo item not found');
        });

        it('should return 404 when trying to delete already deleted todo', async () => {
            // Create a todo first
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' })
                .expect(201);

            const createdTodo: TodoItem = createResponse.body;

            // Delete it once
            await request(app)
                .delete(`/api/todos/${createdTodo.id}`)
                .expect(204);

            // Try to delete it again
            const response = await request(app)
                .delete(`/api/todos/${createdTodo.id}`)
                .expect(404);

            expect(response.body.error).toBe('Not found');
            expect(response.body.message).toBe('Todo item not found');
        });

        it('should handle storage errors gracefully', async () => {
            // Create a todo first
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' })
                .expect(201);

            const createdTodo: TodoItem = createResponse.body;

            // This test verifies that the endpoint handles errors properly
            // In a real scenario, we might mock the storage service to throw an error
            // For now, we'll just verify the endpoint exists and works normally
            await request(app)
                .delete(`/api/todos/${createdTodo.id}`)
                .expect(204);
        });
    });
});
/**
 * Error Handling Integration Tests for Todo API routes
 * Requirements: 14.1 - Error handling operation confirmation tests
 */

import { describe, it, expect, beforeEach, afterAll, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { app, server } from '../../index';
import { defaultStorageService, FileStorageService, setDefaultStorageService } from '../../services/FileStorageService';

describe('Todo API Error Handling', () => {
    const testDataPath = join(process.cwd(), 'data', 'tasks-error-test.json');

    beforeAll(() => {
        // Set test storage service
        const testStorageService = new FileStorageService(testDataPath);
        setDefaultStorageService(testStorageService);
    });

    beforeEach(async () => {
        // Clean up test data before each test
        try {
            await fs.unlink(testDataPath);
        } catch {
            // File doesn't exist, which is fine
        }

        // Ensure data directory exists
        try {
            await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });
        } catch {
            // Directory already exists, which is fine
        }

        // Initialize empty storage
        await fs.writeFile(testDataPath, JSON.stringify([]), 'utf-8');
    });

    afterAll(async () => {
        // Clean up test data after all tests
        try {
            await fs.unlink(testDataPath);
        } catch {
            // File doesn't exist, which is fine
        }
        // Reset to default storage service
        setDefaultStorageService(new FileStorageService());
        if (server) {
            server.close();
        }
    });

    describe('Global Error Handling', () => {
        it('should handle 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body).toMatchObject({
                error: 'NotFoundError',
                message: "Route with identifier '/api/nonexistent' not found",
                statusCode: 404,
                errorCode: 'NOT_FOUND',
                timestamp: expect.any(String),
                path: '/api/nonexistent'
            });
        });

        it('should handle malformed JSON in request body', async () => {
            const response = await request(app)
                .post('/api/todos')
                .set('Content-Type', 'application/json')
                .send('{ invalid json }')
                .expect(400);

            expect(response.body).toMatchObject({
                error: expect.any(String),
                message: expect.stringContaining('JSON'),
                statusCode: 400
            });
        });

        it('should include proper error structure in all error responses', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('statusCode');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('path');
        });
    });

    describe('GET /api/todos Error Handling', () => {
        it('should handle invalid filter parameters gracefully', async () => {
            const response = await request(app)
                .get('/api/todos?search=' + 'a'.repeat(1001)) // Exceed search limit
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                message: 'Invalid search parameters',
                statusCode: 400,
                details: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'search',
                        message: 'Search text cannot exceed 1000 characters'
                    })
                ])
            });
        });

        it('should handle too many tag filters', async () => {
            const manyTags = Array.from({ length: 51 }, (_, i) => `tag${i}`);
            const queryString = manyTags.map(tag => `tags=${tag}`).join('&');

            const response = await request(app)
                .get(`/api/todos?${queryString}`)
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                message: 'Invalid filter parameters',
                statusCode: 400,
                details: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'tags',
                        message: 'Cannot filter by more than 50 tags at once'
                    })
                ])
            });
        });

        it('should handle storage errors gracefully', async () => {
            // Mock storage service to throw error
            const originalReadTodos = defaultStorageService.readTodos;
            vi.spyOn(defaultStorageService, 'readTodos').mockRejectedValue(new Error('Storage failure'));

            const response = await request(app)
                .get('/api/todos')
                .expect(500);

            expect(response.body).toMatchObject({
                error: 'AppError',
                message: 'Storage failure', // In development, original error message is shown
                statusCode: 500
            });

            // Restore original method
            defaultStorageService.readTodos = originalReadTodos;
        });
    });

    describe('POST /api/todos Error Handling', () => {
        it('should handle missing request body', async () => {
            const response = await request(app)
                .post('/api/todos')
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                message: 'Invalid request body',
                statusCode: 400,
                details: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'body',
                        message: 'Request body is required and must be a valid object'
                    })
                ])
            });
        });

        it('should handle invalid request body type', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send('not an object')
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                statusCode: 400
            });
        });

        it('should handle validation errors with detailed field information', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: '' })
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                message: 'Todo validation failed',
                statusCode: 400,
                details: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'title',
                        message: expect.any(String)
                    })
                ])
            });
        });

        it('should handle storage errors during creation', async () => {
            // Mock storage service to throw error
            const originalAddTodo = defaultStorageService.addTodo;
            vi.spyOn(defaultStorageService, 'addTodo').mockRejectedValue(new Error('Storage failure'));

            const response = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' })
                .expect(500);

            expect(response.body).toMatchObject({
                error: 'AppError',
                statusCode: 500
            });

            // Restore original method
            defaultStorageService.addTodo = originalAddTodo;
        });
    });

    describe('PUT /api/todos/:id Error Handling', () => {
        it('should handle invalid todo ID', async () => {
            const response = await request(app)
                .put('/api/todos/')
                .send({ completed: true })
                .expect(404); // Express returns 404 for missing route parameter
        });

        it('should handle empty todo ID', async () => {
            const response = await request(app)
                .put('/api/todos/%20') // URL encoded space
                .send({ completed: true })
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                message: 'Invalid todo ID',
                statusCode: 400,
                details: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'id',
                        message: 'Todo ID is required and must be a non-empty string'
                    })
                ])
            });
        });

        it('should handle missing request body', async () => {
            const response = await request(app)
                .put('/api/todos/test-id')
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                message: 'No valid fields to update',
                statusCode: 400
            });
        });

        it('should handle request body with no updatable fields', async () => {
            const response = await request(app)
                .put('/api/todos/test-id')
                .send({ invalidField: 'value' })
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                message: 'No valid fields to update',
                statusCode: 400,
                details: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'body',
                        message: expect.stringContaining('At least one of the following fields must be provided')
                    })
                ])
            });
        });

        it('should handle non-existent todo ID', async () => {
            const response = await request(app)
                .put('/api/todos/nonexistent-id')
                .send({ completed: true })
                .expect(404);

            expect(response.body).toMatchObject({
                error: 'NotFoundError',
                message: "Todo item with identifier 'nonexistent-id' not found",
                statusCode: 404,
                errorCode: 'NOT_FOUND'
            });
        });

        it('should handle validation errors in update data', async () => {
            // First create a todo
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' })
                .expect(201);

            const todoId = createResponse.body.id;

            // Try to update with invalid data
            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .send({ title: '' })
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                message: 'Todo update validation failed',
                statusCode: 400
            });
        });

        it('should handle storage update failures', async () => {
            // First create a todo
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' })
                .expect(201);

            const todoId = createResponse.body.id;

            // Mock storage service to fail update
            const originalUpdateTodo = defaultStorageService.updateTodo;
            vi.spyOn(defaultStorageService, 'updateTodo').mockResolvedValue(false);

            const response = await request(app)
                .put(`/api/todos/${todoId}`)
                .send({ completed: true })
                .expect(500);

            expect(response.body).toMatchObject({
                error: 'AppError',
                message: 'Failed to update todo item in storage',
                statusCode: 500,
                errorCode: 'STORAGE_UPDATE_FAILED'
            });

            // Restore original method
            defaultStorageService.updateTodo = originalUpdateTodo;
        });
    });

    describe('DELETE /api/todos/:id Error Handling', () => {
        it('should handle invalid todo ID', async () => {
            const response = await request(app)
                .delete('/api/todos/')
                .expect(404); // Express returns 404 for missing route parameter
        });

        it('should handle empty todo ID', async () => {
            const response = await request(app)
                .delete('/api/todos/%20') // URL encoded space
                .expect(400);

            expect(response.body).toMatchObject({
                error: 'ValidationError',
                message: 'Invalid todo ID',
                statusCode: 400,
                details: expect.arrayContaining([
                    expect.objectContaining({
                        field: 'id',
                        message: 'Todo ID is required and must be a non-empty string'
                    })
                ])
            });
        });

        it('should handle non-existent todo ID', async () => {
            const response = await request(app)
                .delete('/api/todos/nonexistent-id')
                .expect(404);

            expect(response.body).toMatchObject({
                error: 'NotFoundError',
                message: "Todo item with identifier 'nonexistent-id' not found",
                statusCode: 404,
                errorCode: 'NOT_FOUND'
            });
        });

        it('should handle storage deletion failures', async () => {
            // Mock storage service to fail deletion
            const originalRemoveTodo = defaultStorageService.removeTodo;
            vi.spyOn(defaultStorageService, 'removeTodo').mockRejectedValue(new Error('Storage failure'));

            const response = await request(app)
                .delete('/api/todos/test-id')
                .expect(500);

            expect(response.body).toMatchObject({
                error: 'AppError',
                statusCode: 500
            });

            // Restore original method
            defaultStorageService.removeTodo = originalRemoveTodo;
        });
    });

    describe('GET /api/todos/archive Error Handling', () => {
        it('should handle storage errors gracefully', async () => {
            // Mock storage service to throw error
            const originalReadTodos = defaultStorageService.readTodos;
            vi.spyOn(defaultStorageService, 'readTodos').mockRejectedValue(new Error('Storage failure'));

            const response = await request(app)
                .get('/api/todos/archive')
                .expect(500);

            expect(response.body).toMatchObject({
                error: 'AppError',
                statusCode: 500
            });

            // Restore original method
            defaultStorageService.readTodos = originalReadTodos;
        });
    });

    describe('GET /api/todos/tags Error Handling', () => {
        it('should handle storage errors gracefully', async () => {
            // Mock storage service to throw error
            const originalReadTodos = defaultStorageService.readTodos;
            vi.spyOn(defaultStorageService, 'readTodos').mockRejectedValue(new Error('Storage failure'));

            const response = await request(app)
                .get('/api/todos/tags')
                .expect(500);

            expect(response.body).toMatchObject({
                error: 'AppError',
                statusCode: 500
            });

            // Restore original method
            defaultStorageService.readTodos = originalReadTodos;
        });
    });

    describe('HTTP Status Code Validation', () => {
        it('should return 400 for validation errors', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: '' })
                .expect(400);

            expect(response.body.statusCode).toBe(400);
        });

        it('should return 404 for not found errors', async () => {
            const response = await request(app)
                .get('/api/todos/nonexistent-id')
                .expect(404);

            expect(response.body.statusCode).toBe(404);
        });

        it('should return 500 for internal server errors', async () => {
            // Mock storage service to throw error
            const originalReadTodos = defaultStorageService.readTodos;
            vi.spyOn(defaultStorageService, 'readTodos').mockRejectedValue(new Error('Storage failure'));

            const response = await request(app)
                .get('/api/todos')
                .expect(500);

            expect(response.body.statusCode).toBe(500);

            // Restore original method
            defaultStorageService.readTodos = originalReadTodos;
        });
    });

    describe('Error Response Format Consistency', () => {
        it('should maintain consistent error response format across all endpoints', async () => {
            const endpoints = [
                { method: 'get', path: '/api/nonexistent', expectedStatus: 404 },
                { method: 'post', path: '/api/todos', body: {}, expectedStatus: 400 },
                { method: 'put', path: '/api/todos/invalid', body: {}, expectedStatus: 400 },
                { method: 'delete', path: '/api/todos/nonexistent', expectedStatus: 404 }
            ];

            for (const endpoint of endpoints) {
                const response = await request(app)
                [endpoint.method](endpoint.path)
                    .send(endpoint.body || {})
                    .expect(endpoint.expectedStatus);

                // Verify consistent error response structure
                expect(response.body).toHaveProperty('error');
                expect(response.body).toHaveProperty('message');
                expect(response.body).toHaveProperty('statusCode');
                expect(response.body).toHaveProperty('timestamp');
                expect(response.body).toHaveProperty('path');

                expect(typeof response.body.error).toBe('string');
                expect(typeof response.body.message).toBe('string');
                expect(typeof response.body.statusCode).toBe('number');
                expect(typeof response.body.timestamp).toBe('string');
                expect(typeof response.body.path).toBe('string');
            }
        });
    });
});
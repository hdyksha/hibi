/**
 * Tests for Enhanced Error Handling Middleware
 * Requirements: 14.1 - Error handling tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { 
    errorHandler, 
    notFoundHandler, 
    asyncHandler, 
    timeoutHandler,
    AppError, 
    ValidationError, 
    NotFoundError, 
    ConflictError 
} from '../errorHandler';
import { StorageError } from '../../services/FileStorageService';

// Mock Express Request and Response objects
const createMockRequest = (overrides: Partial<Request> = {}): Request => ({
    method: 'GET',
    url: '/test',
    path: '/test',
    ip: '127.0.0.1',
    get: vi.fn().mockReturnValue('test-user-agent'),
    ...overrides
} as any);

const createMockResponse = (): Response => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        headersSent: false,
        on: vi.fn()
    };
    return res as any;
};

const createMockNext = (): NextFunction => vi.fn();

describe('Error Handler Middleware', () => {
    let mockConsoleError: any;
    let mockConsoleWarn: any;

    beforeEach(() => {
        mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.clearAllMocks();
    });

    describe('AppError', () => {
        it('should create AppError with default values', () => {
            const error = new AppError('Test error');
            
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(true);
            expect(error.errorCode).toBeUndefined();
            expect(error.name).toBe('AppError');
        });

        it('should create AppError with custom values', () => {
            const error = new AppError('Custom error', 400, false, 'CUSTOM_ERROR');
            
            expect(error.message).toBe('Custom error');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(false);
            expect(error.errorCode).toBe('CUSTOM_ERROR');
        });
    });

    describe('ValidationError', () => {
        it('should create ValidationError with details', () => {
            const details = [
                { field: 'title', message: 'Title is required' },
                { field: 'priority', message: 'Invalid priority', value: 'invalid' }
            ];
            const error = new ValidationError('Validation failed', details);
            
            expect(error.message).toBe('Validation failed');
            expect(error.statusCode).toBe(400);
            expect(error.errorCode).toBe('VALIDATION_ERROR');
            expect(error.details).toEqual(details);
        });
    });

    describe('NotFoundError', () => {
        it('should create NotFoundError without identifier', () => {
            const error = new NotFoundError('Todo');
            
            expect(error.message).toBe('Todo not found');
            expect(error.statusCode).toBe(404);
            expect(error.errorCode).toBe('NOT_FOUND');
        });

        it('should create NotFoundError with identifier', () => {
            const error = new NotFoundError('Todo', 'abc123');
            
            expect(error.message).toBe("Todo with identifier 'abc123' not found");
            expect(error.statusCode).toBe(404);
        });
    });

    describe('ConflictError', () => {
        it('should create ConflictError', () => {
            const error = new ConflictError('Resource already exists');
            
            expect(error.message).toBe('Resource already exists');
            expect(error.statusCode).toBe(409);
            expect(error.errorCode).toBe('CONFLICT');
        });
    });

    describe('errorHandler', () => {
        it('should handle AppError correctly', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            const error = new AppError('Test error', 400, true, 'TEST_ERROR');

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'AppError',
                    message: 'Test error',
                    statusCode: 400,
                    errorCode: 'TEST_ERROR',
                    timestamp: expect.any(String),
                    path: '/test'
                })
            );
        });

        it('should handle ValidationError with details', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            const details = [{ field: 'title', message: 'Required' }];
            const error = new ValidationError('Validation failed', details);

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'ValidationError',
                    message: 'Validation failed',
                    statusCode: 400,
                    details: details
                })
            );
        });

        it('should handle StorageError', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            const error = new StorageError('Storage failed');

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'AppError',
                    message: 'Data storage operation failed',
                    statusCode: 500,
                    errorCode: 'STORAGE_ERROR'
                })
            );
        });

        it('should handle JSON SyntaxError', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            const error = new SyntaxError('Unexpected token in JSON');

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'ValidationError',
                    message: 'Invalid JSON format in request body',
                    statusCode: 400,
                    details: expect.arrayContaining([
                        expect.objectContaining({
                            field: 'body',
                            message: 'Request body must be valid JSON'
                        })
                    ])
                })
            );
        });

        it('should handle unknown errors', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            const error = new Error('Unknown error');

            // Mock production environment
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'AppError',
                    message: 'Internal server error',
                    statusCode: 500,
                    errorCode: 'INTERNAL_ERROR'
                })
            );

            // Restore environment
            process.env.NODE_ENV = originalEnv;
        });

        it('should include stack trace in development', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            const error = new AppError('Test error');

            // Mock development environment
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            errorHandler(error, req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    stack: expect.any(String)
                })
            );

            // Restore environment
            process.env.NODE_ENV = originalEnv;
        });

        it('should log client errors as warnings', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            const error = new AppError('Client error', 400);

            errorHandler(error, req, res, next);

            expect(mockConsoleWarn).toHaveBeenCalled();
            expect(mockConsoleError).not.toHaveBeenCalled();
        });

        it('should log server errors as errors', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            const error = new AppError('Server error', 500);

            errorHandler(error, req, res, next);

            expect(mockConsoleError).toHaveBeenCalled();
            expect(mockConsoleWarn).not.toHaveBeenCalled();
        });
    });

    describe('notFoundHandler', () => {
        it('should create NotFoundError for undefined routes', () => {
            const req = createMockRequest({ path: '/nonexistent' });
            const res = createMockResponse();
            const next = createMockNext();

            notFoundHandler(req, res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: "Route with identifier '/nonexistent' not found",
                    statusCode: 404
                })
            );
        });
    });

    describe('asyncHandler', () => {
        it('should handle successful async operations', async () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();

            const asyncFn = vi.fn().mockResolvedValue('success');
            const wrappedFn = asyncHandler(asyncFn);

            wrappedFn(req, res, next);

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(asyncFn).toHaveBeenCalledWith(req, res, next);
            expect(next).not.toHaveBeenCalled();
        });

        it('should catch and forward async errors', async () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();

            const error = new Error('Async error');
            const asyncFn = vi.fn().mockRejectedValue(error);
            const wrappedFn = asyncHandler(asyncFn);

            wrappedFn(req, res, next);

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('timeoutHandler', () => {
        it('should create timeout middleware with default timeout', () => {
            const middleware = timeoutHandler();
            expect(typeof middleware).toBe('function');
        });

        it('should create timeout middleware with custom timeout', () => {
            const middleware = timeoutHandler(5000);
            expect(typeof middleware).toBe('function');
        });

        it('should call next() immediately for normal requests', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();

            const middleware = timeoutHandler(1000);
            middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should handle timeout when response is not sent', (done) => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();

            const middleware = timeoutHandler(10); // Very short timeout

            middleware(req, res, next);

            setTimeout(() => {
                expect(next).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: 'Request timeout',
                        statusCode: 408,
                        errorCode: 'REQUEST_TIMEOUT'
                    })
                );
                done();
            }, 20);
        });

        it('should not timeout when response is already sent', (done) => {
            const req = createMockRequest();
            const res = createMockResponse();
            res.headersSent = true;
            const next = createMockNext();

            const middleware = timeoutHandler(10);
            middleware(req, res, next);

            setTimeout(() => {
                expect(next).toHaveBeenCalledTimes(1); // Only the initial call
                done();
            }, 20);
        });
    });
});
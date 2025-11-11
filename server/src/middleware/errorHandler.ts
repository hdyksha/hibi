/**
 * Enhanced Error Handling Middleware
 * Requirements: 14.1 - Detailed error processing, appropriate HTTP status codes
 */

import { Request, Response, NextFunction } from 'express';
import { StorageError } from '../services/FileStorageService';

/**
 * Custom application error types
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errorCode?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        errorCode?: string
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errorCode = errorCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation error detail interface
 */
export interface ValidationErrorDetail {
    field: string;
    message: string;
    value?: unknown;
}

export class ValidationError extends AppError {
    public readonly details: ValidationErrorDetail[];

    constructor(message: string, details: ValidationErrorDetail[]) {
        super(message, 400, true, 'VALIDATION_ERROR');
        this.details = details;
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, identifier?: string) {
        const message = identifier 
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(message, 404, true, 'NOT_FOUND');
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, true, 'CONFLICT');
    }
}

/**
 * Error response interface
 */
interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
    errorCode?: string;
    details?: ValidationErrorDetail[];
    timestamp: string;
    path: string;
    requestId?: string;
}

/**
 * Development error response (includes stack trace)
 */
interface DevErrorResponse extends ErrorResponse {
    stack?: string;
}

/**
 * Log error details for monitoring and debugging
 */
function logError(error: Error, req: Request): void {
    // Skip logging during tests to reduce output noise
    if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
        return;
    }
    
    const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        }
    };

    if (error instanceof AppError && error.statusCode < 500) {
        // Client errors (4xx) - log as warning
        console.warn('Client Error:', JSON.stringify(logData, null, 2));
    } else {
        // Server errors (5xx) - log as error
        console.error('Server Error:', JSON.stringify(logData, null, 2));
    }
}

/**
 * Convert known error types to AppError instances
 */
function normalizeError(error: Error): AppError {
    // Handle storage errors
    if (error instanceof StorageError) {
        return new AppError(
            'Data storage operation failed',
            500,
            true,
            'STORAGE_ERROR'
        );
    }

    // Handle validation errors (already AppError)
    if (error instanceof AppError) {
        return error;
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return new ValidationError('Invalid JSON format in request body', [
            { field: 'body', message: 'Request body must be valid JSON' }
        ]);
    }

    // Handle other known error types
    if (error.name === 'CastError') {
        return new ValidationError('Invalid data format', [
            { field: 'unknown', message: 'Data type conversion failed' }
        ]);
    }

    // Default to internal server error
    return new AppError(
        process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message,
        500,
        false,
        'INTERNAL_ERROR'
    );
}

/**
 * Create error response object
 */
function createErrorResponse(error: AppError, req: Request): ErrorResponse | DevErrorResponse {
    const baseResponse: ErrorResponse = {
        error: error.name,
        message: error.message,
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        timestamp: new Date().toISOString(),
        path: req.path
    };

    // Add validation details for validation errors
    if (error instanceof ValidationError) {
        baseResponse.details = error.details;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        (baseResponse as DevErrorResponse).stack = error.stack;
    }

    return baseResponse;
}

/**
 * Global error handling middleware
 * Must be the last middleware in the chain
 */
export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Log the error
    logError(error, req);

    // Normalize error to AppError
    const normalizedError = normalizeError(error);

    // Create response
    const errorResponse = createErrorResponse(normalizedError, req);

    // Send response
    res.status(normalizedError.statusCode).json(errorResponse);
}

/**
 * Handle 404 errors for undefined routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
    const error = new NotFoundError('Route', req.path);
    next(error);
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error middleware
 */
export function asyncHandler<T extends Request, U extends Response>(
    routeHandler: (req: T, res: U, next: NextFunction) => Promise<void | Response>
) {
    return (req: T, res: U, next: NextFunction): void => {
        Promise.resolve(routeHandler(req, res, next)).catch(next);
    };
}

/**
 * Request timeout middleware
 */
export function timeoutHandler(timeoutMs: number = 30000) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                const error = new AppError(
                    'Request timeout',
                    408,
                    true,
                    'REQUEST_TIMEOUT'
                );
                next(error);
            }
        }, timeoutMs);

        // Clear timeout when response is finished
        res.on('finish', () => clearTimeout(timeout));
        res.on('close', () => clearTimeout(timeout));

        next();
    };
}
/**
 * Enhanced Error Handling Middleware
 * Requirements: 14.1 - Detailed error processing, appropriate HTTP status codes
 */

import { Request, Response, NextFunction } from 'express';
import { StorageError } from '../services/FileStorageService';

/**
 * Base application error class
 * 
 * Extends the standard Error class with additional properties for HTTP status codes,
 * operational error flags, and error codes for better error handling and logging.
 * 
 * @example
 * ```typescript
 * throw new AppError('Database connection failed', 503, true, 'DB_CONNECTION_ERROR');
 * ```
 */
export class AppError extends Error {
    /** HTTP status code for the error */
    public readonly statusCode: number;
    /** Whether this is an operational error (expected) or a programming error (unexpected) */
    public readonly isOperational: boolean;
    /** Optional machine-readable error code */
    public readonly errorCode?: string;

    /**
     * Create a new AppError
     * 
     * @param message - Human-readable error message
     * @param statusCode - HTTP status code (default: 500)
     * @param isOperational - Whether this is an operational error (default: true)
     * @param errorCode - Optional machine-readable error code
     */
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
 * 
 * Represents a single field validation error with optional value information.
 */
export interface ValidationErrorDetail {
    /** The name of the field that failed validation */
    field: string;
    /** Human-readable error message */
    message: string;
    /** Optional value that failed validation (for debugging) */
    value?: unknown;
}

/**
 * Validation error class
 * 
 * Specialized error for validation failures, includes detailed information
 * about which fields failed validation and why.
 * 
 * @example
 * ```typescript
 * throw new ValidationError('Invalid input', [
 *   { field: 'title', message: 'Title is required' },
 *   { field: 'priority', message: 'Priority must be high, medium, or low' }
 * ]);
 * ```
 */
export class ValidationError extends AppError {
    /** Array of validation error details */
    public readonly details: ValidationErrorDetail[];

    /**
     * Create a new ValidationError
     * 
     * @param message - General error message
     * @param details - Array of field-specific validation errors
     */
    constructor(message: string, details: ValidationErrorDetail[]) {
        super(message, 400, true, 'VALIDATION_ERROR');
        this.details = details;
    }
}

/**
 * Not found error class
 * 
 * Specialized error for resource not found scenarios (404 errors).
 * 
 * @example
 * ```typescript
 * throw new NotFoundError('Todo item', '123');
 * // Results in: "Todo item with identifier '123' not found"
 * 
 * throw new NotFoundError('Route', req.path);
 * // Results in: "Route with identifier '/api/invalid' not found"
 * ```
 */
export class NotFoundError extends AppError {
    /**
     * Create a new NotFoundError
     * 
     * @param resource - The type of resource that was not found (e.g., 'Todo item', 'Route')
     * @param identifier - Optional identifier of the resource (e.g., ID, path)
     */
    constructor(resource: string, identifier?: string) {
        const message = identifier 
            ? `${resource} with identifier '${identifier}' not found`
            : `${resource} not found`;
        super(message, 404, true, 'NOT_FOUND');
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
 * 
 * Logs errors with contextual information including request details.
 * Client errors (4xx) are logged as warnings, server errors (5xx) as errors.
 * Logging is suppressed during tests to reduce noise.
 * 
 * @param error - The error to log
 * @param req - The Express request object for context
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
 * 
 * Normalizes various error types (StorageError, SyntaxError, etc.) into
 * consistent AppError instances with appropriate status codes and messages.
 * This ensures all errors are handled uniformly by the error middleware.
 * 
 * @param error - The error to normalize
 * @returns An AppError instance
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
 * 
 * Constructs a standardized error response with appropriate details.
 * In development mode, includes stack traces for debugging.
 * For validation errors, includes detailed field-level error information.
 * 
 * @param error - The AppError to convert to a response
 * @param req - The Express request object for context
 * @returns An error response object ready to be sent to the client
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
 * 
 * Catches all errors thrown in route handlers and other middleware,
 * normalizes them to AppError instances, logs them appropriately,
 * and sends a standardized error response to the client.
 * 
 * This middleware must be registered last in the middleware chain
 * to catch errors from all other middleware and routes.
 * 
 * @param error - The error that was thrown
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next function (unused but required by Express)
 * 
 * @example
 * ```typescript
 * // In your Express app setup
 * app.use(errorHandler);
 * ```
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
 * 
 * Middleware that catches requests to undefined routes and creates
 * a NotFoundError. Should be registered after all route handlers
 * but before the error handler.
 * 
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next function
 * 
 * @example
 * ```typescript
 * // In your Express app setup
 * app.use('/api/todos', todosRouter);
 * app.use('/api/files', filesRouter);
 * app.use(notFoundHandler);  // Catch undefined routes
 * app.use(errorHandler);     // Handle all errors
 * ```
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
    const error = new NotFoundError('Route', req.path);
    next(error);
}

/**
 * Async error wrapper for route handlers
 * 
 * Wraps async route handlers to automatically catch rejected promises
 * and pass them to the error handling middleware. This eliminates the
 * need for try-catch blocks in every async route handler.
 * 
 * @template T - Request type (extends Express Request)
 * @template U - Response type (extends Express Response)
 * @param routeHandler - The async route handler function to wrap
 * @returns A wrapped route handler that catches async errors
 * 
 * @example
 * ```typescript
 * // Without asyncHandler (requires try-catch)
 * app.get('/todos', async (req, res, next) => {
 *   try {
 *     const todos = await todoService.getTodos();
 *     res.json(todos);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 * 
 * // With asyncHandler (automatic error handling)
 * app.get('/todos', asyncHandler(async (req, res) => {
 *   const todos = await todoService.getTodos();
 *   res.json(todos);
 * }));
 * ```
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
 * 
 * Sets a timeout for each request. If the request takes longer than the
 * specified timeout, a REQUEST_TIMEOUT error is generated.
 * 
 * @param timeoutMs - Timeout duration in milliseconds (default: 30000ms = 30s)
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * // Use default 30 second timeout
 * app.use(timeoutHandler());
 * 
 * // Use custom 10 second timeout
 * app.use(timeoutHandler(10000));
 * ```
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
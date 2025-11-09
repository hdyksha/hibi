/**
 * Todo API routes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { Router, Request, Response } from 'express';
import { getDefaultTodoService } from '../services/TodoService';
import { buildFilterFromQuery } from '../utils';
import { asyncHandler, ValidationError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/todos - Get all todo items with optional filtering
 * Requirements: 2.1, 2.2, 7.2, 8.4
 * Query parameters:
 * - status: 'all' | 'pending' | 'completed'
 * - priority: 'high' | 'medium' | 'low'
 * - tags: string or string[] (comma-separated or multiple params)
 * - search: string (searches in title, memo, and tags)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    // Build filter from query parameters
    const filter = buildFilterFromQuery(req.query);

    // Get todos with filtering from TodoService
    const todoService = getDefaultTodoService();
    const filteredTodos = await todoService.getTodos(
        Object.keys(filter).length > 0 ? filter : undefined
    );

    // Return filtered todo items
    res.status(200).json(filteredTodos);
}));

/**
 * POST /api/todos - Create a new todo item
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
    // Validate request body exists (Express sets req.body to {} for empty JSON)
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length === 0) {
        throw new ValidationError('Invalid request body', [
            { field: 'body', message: 'Request body is required and must be a valid object' }
        ]);
    }

    // Delegate to TodoService
    const todoService = getDefaultTodoService();
    const newTodo = await todoService.createTodo(req.body);

    // Return created todo
    res.status(201).json(newTodo);
}));

/**
 * PUT /api/todos/:id - Update a todo item (completion status, title, priority)
 * Requirements: 3.1, 3.2, 3.3, 6.1, 6.2
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validate request body (Express sets req.body to {} for empty JSON)
    if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
        throw new ValidationError('Invalid request body', [
            { field: 'body', message: 'Request body is required and must be a valid object' }
        ]);
    }

    // Delegate to TodoService
    const todoService = getDefaultTodoService();
    const updatedTodo = await todoService.updateTodo(id, updateData);

    // Return updated todo
    res.status(200).json(updatedTodo);
}));

/**
 * DELETE /api/todos/:id - Delete a todo item permanently
 * Requirements: 4.1, 4.2, 4.3
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Delegate to TodoService
    const todoService = getDefaultTodoService();
    await todoService.deleteTodo(id);

    // 要件 4.1, 4.2: todoアイテムをリストから削除し、ストレージから永続的に削除
    // 要件 4.3: 削除時に表示を即座に更新（クライアント側で処理）
    res.status(204).send(); // No content response for successful deletion
}));

/**
 * GET /api/todos/archive - Get completed todo items grouped by completion date
 * Requirements: 9.1, 9.2, 9.3, 9.5
 */
router.get('/archive', asyncHandler(async (_req: Request, res: Response) => {
    // Get archive from TodoService
    const todoService = getDefaultTodoService();
    const archiveGroups = await todoService.getArchive();

    res.status(200).json(archiveGroups);
}));

/**
 * GET /api/todos/tags - Get all unique tags used in todo items
 * Requirements: 7.3, 7.4
 */
router.get('/tags', asyncHandler(async (_req: Request, res: Response) => {
    // Delegate to TodoService
    const todoService = getDefaultTodoService();
    const uniqueTags = await todoService.getTags();

    res.status(200).json(uniqueTags);
}));

export default router;
/**
 * Todo API routes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { Router, Request, Response } from 'express';
import { TodoItem, CreateTodoItemInput, validateCreateTodoItemInput, validateUpdateTodoItemInput } from '../models';
import { getDefaultStorageService } from '../services/FileStorageService';
import { getDefaultTodoService } from '../services/TodoService';
import { generateTodoId, buildFilterFromQuery } from '../utils';
import { asyncHandler, ValidationError, NotFoundError, AppError } from '../middleware/errorHandler';

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

    // Extract input data
    const input: CreateTodoItemInput = req.body;

    // Validate input
    const validation = validateCreateTodoItemInput(input);
    if (!validation.isValid) {
        throw new ValidationError('Todo validation failed', validation.errors);
    }

    // Create new TodoItem with auto-generated fields
    const now = new Date().toISOString();
    const newTodo: TodoItem = {
        id: generateTodoId(),                    // 要件 1.5: 一意のIDを自動生成
        title: input.title.trim(),               // 要件 1.3: タイトルは必須
        completed: false,                        // 要件 1.4: デフォルトで未完了ステータス
        priority: input.priority || 'medium',   // 要件 6.2: デフォルトでmedium優先度を割り当てる
        tags: input.tags || [],                  // 要件 7.1: デフォルトで空のタグ配列
        memo: input.memo || '',                  // 要件 8.1: デフォルトで空のメモ
        createdAt: now,                          // 要件 1.6: 作成日時を自動記録
        updatedAt: now,                          // 要件 3.5: 更新日時を自動設定
        completedAt: null                        // 要件 3.4: 初期状態では未完了なのでnull
    };

    // Save to storage
    await getDefaultStorageService().addTodo(newTodo);

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

    // Validate ID parameter
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new ValidationError('Invalid todo ID', [
            { field: 'id', message: 'Todo ID is required and must be a non-empty string', value: id }
        ]);
    }

    // Validate request body (Express sets req.body to {} for empty JSON)
    if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
        throw new ValidationError('Invalid request body', [
            { field: 'body', message: 'Request body is required and must be a valid object' }
        ]);
    }

    // Check if at least one field is being updated
    const updatableFields = ['completed', 'title', 'priority', 'tags', 'memo'];
    const hasUpdatableField = updatableFields.some(field => updateData.hasOwnProperty(field));
    
    if (!hasUpdatableField) {
        throw new ValidationError('No valid fields to update', [
            { field: 'body', message: `At least one of the following fields must be provided: ${updatableFields.join(', ')}` }
        ]);
    }

    // Get all todos from storage
    const todos = await getDefaultStorageService().readTodos();

    // Find the todo item to update
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
        throw new NotFoundError('Todo item', id);
    }

    // Get the existing todo
    const existingTodo = todos[todoIndex];

    // Validate update input
    const validation = validateUpdateTodoItemInput(updateData);
    if (!validation.isValid) {
        throw new ValidationError('Todo update validation failed', validation.errors);
    }

    // Prepare updated todo with selective updates
    const updatedTodo: TodoItem = {
        ...existingTodo,
        updatedAt: new Date().toISOString()      // 要件 3.2: 更新日時の自動設定
    };

    // Handle different types of updates
    if (updateData.hasOwnProperty('completed')) {
        const newCompletedStatus = Boolean(updateData.completed);
        updatedTodo.completed = newCompletedStatus;  // 要件 3.1: completedフィールドの更新
        
        // 要件 3.4: todoアイテムが完了済みになった時、完了日時を記録する
        if (newCompletedStatus && !existingTodo.completed) {
            // 未完了から完了に変更された場合、完了日時を設定
            updatedTodo.completedAt = new Date().toISOString();
        } else if (!newCompletedStatus && existingTodo.completed) {
            // 完了から未完了に変更された場合、完了日時をクリア
            updatedTodo.completedAt = null;
        }
    }

    if (updateData.hasOwnProperty('title')) {
        updatedTodo.title = updateData.title.trim();  // タイトルの更新
    }

    if (updateData.hasOwnProperty('priority')) {
        updatedTodo.priority = updateData.priority;  // 要件 6.1, 6.2: 優先度の更新
    }

    if (updateData.hasOwnProperty('tags')) {
        updatedTodo.tags = updateData.tags;  // 要件 7.1: タグの更新
    }

    if (updateData.hasOwnProperty('memo')) {
        updatedTodo.memo = updateData.memo;  // 要件 8.1: メモの更新
    }

    // Update in storage
    const updateSuccess = await getDefaultStorageService().updateTodo(id, updatedTodo);
    
    if (!updateSuccess) {
        throw new AppError('Failed to update todo item in storage', 500, true, 'STORAGE_UPDATE_FAILED');
    }

    // Return updated todo
    res.status(200).json(updatedTodo);
}));

/**
 * DELETE /api/todos/:id - Delete a todo item permanently
 * Requirements: 4.1, 4.2, 4.3
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ID parameter
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new ValidationError('Invalid todo ID', [
            { field: 'id', message: 'Todo ID is required and must be a non-empty string', value: id }
        ]);
    }

    // Remove todo from storage
    const deleteSuccess = await getDefaultStorageService().removeTodo(id);
    
    if (!deleteSuccess) {
        throw new NotFoundError('Todo item', id);
    }

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
    // Retrieve all todos from storage
    const todos = await getDefaultStorageService().readTodos();

    // Extract all unique tags
    const allTags = todos.reduce((tags: string[], todo) => {
        return tags.concat(todo.tags);
    }, []);

    // Remove duplicates and sort alphabetically
    const uniqueTags = Array.from(new Set(allTags)).sort();

    res.status(200).json(uniqueTags);
}));

export default router;
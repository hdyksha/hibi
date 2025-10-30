/**
 * Todo API routes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { Router, Request, Response } from 'express';
import { TodoItem, CreateTodoItemInput, validateCreateTodoItemInput, validateUpdateTodoItemInput } from '../models';
import { defaultStorageService } from '../services/FileStorageService';
import { generateTodoId } from '../utils';

const router = Router();

/**
 * GET /api/todos - Get all todo items
 * Requirements: 2.1, 2.2
 */
router.get('/', async (_req: Request, res: Response) => {
    try {
        // Retrieve all todos from storage
        const todos = await defaultStorageService.readTodos();

        // Return all todo items
        return res.status(200).json(todos);
    } catch (error) {
        console.error('Error retrieving todos:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve todo items'
        });
    }
});

/**
 * POST /api/todos - Create a new todo item
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        // Extract input data
        const input: CreateTodoItemInput = req.body;

        // Validate input
        const validation = validateCreateTodoItemInput(input);
        if (!validation.isValid) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.errors
            });
        }

        // Create new TodoItem with auto-generated fields
        const now = new Date().toISOString();
        const newTodo: TodoItem = {
            id: generateTodoId(),                    // 要件 1.5: 一意のIDを自動生成
            title: input.title.trim(),               // 要件 1.3: タイトルは必須
            completed: false,                        // 要件 1.4: デフォルトで未完了ステータス
            priority: input.priority || 'medium',   // 要件 6.2: デフォルトでmedium優先度を割り当てる
            tags: input.tags || [],                  // 要件 7.1: デフォルトで空のタグ配列
            createdAt: now,                          // 要件 1.6: 作成日時を自動記録
            updatedAt: now                           // 要件 3.5: 更新日時を自動設定
        };

        // Save to storage
        await defaultStorageService.addTodo(newTodo);

        // Return created todo
        return res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create todo item'
        });
    }
});

/**
 * PUT /api/todos/:id - Update a todo item (completion status, title, priority)
 * Requirements: 3.1, 3.2, 3.3, 6.1, 6.2
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate ID parameter
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Todo ID is required'
            });
        }

        // Get all todos from storage
        const todos = await defaultStorageService.readTodos();

        // Find the todo item to update
        const todoIndex = todos.findIndex(todo => todo.id === id);
        if (todoIndex === -1) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Todo item not found'
            });
        }

        // Get the existing todo
        const existingTodo = todos[todoIndex];

        // Validate update input
        const validation = validateUpdateTodoItemInput(updateData);
        if (!validation.isValid) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.errors
            });
        }

        // Prepare updated todo with selective updates
        const updatedTodo: TodoItem = {
            ...existingTodo,
            updatedAt: new Date().toISOString()      // 要件 3.2: 更新日時の自動設定
        };

        // Handle different types of updates
        if (updateData.hasOwnProperty('completed')) {
            updatedTodo.completed = Boolean(updateData.completed);  // 要件 3.1: completedフィールドの更新
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

        // Update in storage
        const updateSuccess = await defaultStorageService.updateTodo(id, updatedTodo);
        
        if (!updateSuccess) {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to update todo item'
            });
        }

        // Return updated todo
        return res.status(200).json(updatedTodo);
    } catch (error) {
        console.error('Error updating todo:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update todo item'
        });
    }
});

/**
 * DELETE /api/todos/:id - Delete a todo item permanently
 * Requirements: 4.1, 4.2, 4.3
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validate ID parameter
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Todo ID is required'
            });
        }

        // Remove todo from storage
        const deleteSuccess = await defaultStorageService.removeTodo(id);
        
        if (!deleteSuccess) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Todo item not found'
            });
        }

        // 要件 4.1, 4.2: todoアイテムをリストから削除し、ストレージから永続的に削除
        // 要件 4.3: 削除時に表示を即座に更新（クライアント側で処理）
        return res.status(204).send(); // No content response for successful deletion
    } catch (error) {
        console.error('Error deleting todo:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete todo item'
        });
    }
});

export default router;
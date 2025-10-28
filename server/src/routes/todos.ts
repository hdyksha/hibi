/**
 * Todo API routes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { Router, Request, Response } from 'express';
import { TodoItem, CreateTodoItemInput, validateCreateTodoItemInput } from '../models';
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
 * PUT /api/todos/:id - Toggle completion status of a todo item
 * Requirements: 3.1, 3.2, 3.3
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

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

        // Toggle completion status and update timestamp
        const updatedTodo: TodoItem = {
            ...existingTodo,
            completed: !existingTodo.completed,      // 要件 3.1: completedフィールドの切り替え
            updatedAt: new Date().toISOString()      // 要件 3.2: 更新日時の自動設定
        };

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

export default router;
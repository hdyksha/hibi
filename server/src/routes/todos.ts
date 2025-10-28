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
        const newTodo: TodoItem = {
            id: generateTodoId(),                    // 要件 1.5: 一意のIDを自動生成
            title: input.title.trim(),               // 要件 1.3: タイトルは必須
            completed: false,                        // 要件 1.4: デフォルトで未完了ステータス
            createdAt: new Date().toISOString()      // 要件 1.6: 作成日時を自動記録
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

export default router;
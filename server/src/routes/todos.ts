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
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create todo item'
        });
    }
});

export default router;
/**
 * Todo API routes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { Router, Request, Response } from 'express';
import { TodoItem, CreateTodoItemInput, validateCreateTodoItemInput, validateUpdateTodoItemInput, TodoFilter, FilterStatus, Priority, FILTER_STATUS_VALUES, PRIORITY_VALUES, ArchiveGroup } from '../models';
import { defaultStorageService } from '../services/FileStorageService';
import { generateTodoId } from '../utils';
import { asyncHandler, ValidationError, NotFoundError, AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * フィルタリング関数
 * 要件 7.2: タグによるフィルタリング機能を提供する
 * 要件 8.4: メモの内容を検索対象に含める
 */
function filterTodos(todos: TodoItem[], filter: TodoFilter): TodoItem[] {
    return todos.filter(todo => {
        // ステータスフィルター
        if (filter.status && filter.status !== 'all') {
            if (filter.status === 'completed' && !todo.completed) return false;
            if (filter.status === 'pending' && todo.completed) return false;
        }

        // 優先度フィルター
        if (filter.priority && todo.priority !== filter.priority) {
            return false;
        }

        // タグフィルター (要件 7.2)
        if (filter.tags && filter.tags.length > 0) {
            const hasMatchingTag = filter.tags.some(filterTag => 
                todo.tags.some(todoTag => 
                    todoTag.toLowerCase().includes(filterTag.toLowerCase())
                )
            );
            if (!hasMatchingTag) return false;
        }

        // 検索テキストフィルター (要件 8.4: メモの内容を検索対象に含める)
        if (filter.searchText && filter.searchText.trim().length > 0) {
            const searchTerm = filter.searchText.toLowerCase();
            const titleMatch = todo.title.toLowerCase().includes(searchTerm);
            const memoMatch = todo.memo.toLowerCase().includes(searchTerm);
            const tagMatch = todo.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            
            if (!titleMatch && !memoMatch && !tagMatch) return false;
        }

        return true;
    });
}

/**
 * クエリパラメータからフィルターオブジェクトを構築
 */
function buildFilterFromQuery(query: any): TodoFilter {
    const filter: TodoFilter = {};

    // ステータスフィルター
    if (query.status && FILTER_STATUS_VALUES.includes(query.status)) {
        filter.status = query.status as FilterStatus;
    }

    // 優先度フィルター
    if (query.priority && PRIORITY_VALUES.includes(query.priority)) {
        filter.priority = query.priority as Priority;
    }

    // タグフィルター
    if (query.tags) {
        if (typeof query.tags === 'string') {
            filter.tags = [query.tags];
        } else if (Array.isArray(query.tags)) {
            filter.tags = query.tags.filter((tag: any) => typeof tag === 'string');
        }
    }

    // 検索テキスト
    if (query.search && typeof query.search === 'string') {
        filter.searchText = query.search.trim();
    }

    return filter;
}

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
    // Retrieve all todos from storage
    const todos = await defaultStorageService.readTodos();

    // Build filter from query parameters
    const filter = buildFilterFromQuery(req.query);

    // Validate filter parameters
    if (filter.searchText && filter.searchText.length > 1000) {
        throw new ValidationError('Invalid search parameters', [
            { field: 'search', message: 'Search text cannot exceed 1000 characters', value: filter.searchText.length }
        ]);
    }

    if (filter.tags && filter.tags.length > 50) {
        throw new ValidationError('Invalid filter parameters', [
            { field: 'tags', message: 'Cannot filter by more than 50 tags at once', value: filter.tags.length }
        ]);
    }

    // Apply filtering if any filters are specified
    const filteredTodos = Object.keys(filter).length > 0 
        ? filterTodos(todos, filter) 
        : todos;

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
    await defaultStorageService.addTodo(newTodo);

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
    const todos = await defaultStorageService.readTodos();

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
    const updateSuccess = await defaultStorageService.updateTodo(id, updatedTodo);
    
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
    const deleteSuccess = await defaultStorageService.removeTodo(id);
    
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
    // Retrieve all todos from storage
    const todos = await defaultStorageService.readTodos();

    // Filter only completed todos that have a completedAt date
    // 要件 9.1: 完了済みのtodoアイテムをアーカイブビューで表示する
    const completedTodos = todos.filter(todo => todo.completed && todo.completedAt);

    // Group todos by completion date (YYYY-MM-DD format)
    // 要件 9.2: アーカイブビューで完了日によるグルーピング機能を提供する
    const groupedTodos = new Map<string, TodoItem[]>();
    
    completedTodos.forEach(todo => {
        if (todo.completedAt) {
            // Extract date part from ISO string (YYYY-MM-DD)
            const completionDate = todo.completedAt.split('T')[0];
            
            if (!groupedTodos.has(completionDate)) {
                groupedTodos.set(completionDate, []);
            }
            groupedTodos.get(completionDate)!.push(todo);
        }
    });

    // Convert to ArchiveGroup array and sort by date (newest first)
    // 要件 9.3: 完了日が新しいものから順に表示する
    // 要件 9.5: アーカイブビューで各グループの完了タスク数を表示する
    const archiveGroups: ArchiveGroup[] = Array.from(groupedTodos.entries())
        .map(([date, tasks]) => ({
            date,
            tasks: tasks.sort((a, b) => {
                // Sort tasks within each group by completion time (newest first)
                return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
            }),
            count: tasks.length
        }))
        .sort((a, b) => {
            // Sort groups by date (newest first)
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

    res.status(200).json(archiveGroups);
}));

/**
 * GET /api/todos/tags - Get all unique tags used in todo items
 * Requirements: 7.3, 7.4
 */
router.get('/tags', asyncHandler(async (_req: Request, res: Response) => {
    // Retrieve all todos from storage
    const todos = await defaultStorageService.readTodos();

    // Extract all unique tags
    const allTags = todos.reduce((tags: string[], todo) => {
        return tags.concat(todo.tags);
    }, []);

    // Remove duplicates and sort alphabetically
    const uniqueTags = Array.from(new Set(allTags)).sort();

    res.status(200).json(uniqueTags);
}));

export default router;
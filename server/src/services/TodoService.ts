/**
 * TodoService - Business logic layer for Todo operations
 * Requirements: 2.1, 2.2, 5.2
 * 
 * This service encapsulates all business logic related to Todo items,
 * separating it from route handlers and providing a clean interface
 * for Todo operations.
 */

import { TodoItem, CreateTodoItemInput, UpdateTodoItemInput, validateCreateTodoItemInput, validateUpdateTodoItemInput, validateId, TodoFilter, ArchiveGroup } from '../models';
import { FileStorageService, getDefaultStorageService } from './FileStorageService';
import { generateTodoId } from '../utils';
import { ValidationError, NotFoundError, AppError } from '../middleware/errorHandler';

/**
 * TodoService class
 * Handles all business logic for Todo operations
 */
export class TodoService {
    constructor(private storage: FileStorageService) {}

    /**
     * Get the storage service instance
     * Useful for testing and debugging
     */
    getStorage(): FileStorageService {
        return this.storage;
    }

    /**
     * Get all todos with optional filtering
     * Requirements: 2.1, 2.2, 5.2
     */
    async getTodos(filter?: TodoFilter): Promise<TodoItem[]> {
        const todos = await this.storage.readTodos();
        
        if (!filter || Object.keys(filter).length === 0) {
            return todos;
        }

        // Validate filter parameters
        this.validateFilter(filter);

        return this.applyFilter(todos, filter);
    }

    /**
     * Create a new todo item
     * Requirements: 2.1, 2.2
     */
    async createTodo(input: CreateTodoItemInput): Promise<TodoItem> {
        // Validate input
        const validation = validateCreateTodoItemInput(input);
        if (!validation.isValid) {
            throw new ValidationError('Todo validation failed', validation.errors);
        }

        // Create new TodoItem with auto-generated fields
        const now = new Date().toISOString();
        const newTodo: TodoItem = {
            id: generateTodoId(),
            title: input.title.trim(),
            completed: false,
            priority: input.priority || 'medium',
            tags: input.tags || [],
            memo: input.memo || '',
            createdAt: now,
            updatedAt: now,
            completedAt: null
        };

        // Save to storage
        await this.storage.addTodo(newTodo);

        return newTodo;
    }

    /**
     * Update an existing todo item
     * Requirements: 2.1, 2.2
     */
    async updateTodo(id: string, input: UpdateTodoItemInput): Promise<TodoItem> {
        // Validate ID
        const idValidation = validateId(id);
        if (!idValidation.isValid) {
            throw new ValidationError('Invalid todo ID', idValidation.errors);
        }

        // Check if at least one field is being updated
        const updatableFields = ['completed', 'title', 'priority', 'tags', 'memo'];
        const hasUpdatableField = updatableFields.some(field => input.hasOwnProperty(field));
        
        if (!hasUpdatableField) {
            throw new ValidationError('No valid fields to update', [
                { field: 'body', message: `At least one of the following fields must be provided: ${updatableFields.join(', ')}` }
            ]);
        }

        // Validate update input
        const validation = validateUpdateTodoItemInput(input);
        if (!validation.isValid) {
            throw new ValidationError('Todo update validation failed', validation.errors);
        }

        // Get all todos from storage
        const todos = await this.storage.readTodos();

        // Find the todo item to update
        const existingTodo = todos.find(todo => todo.id === id);
        if (!existingTodo) {
            throw new NotFoundError('Todo item', id);
        }

        // Prepare updated todo
        const updatedTodo: TodoItem = {
            ...existingTodo,
            updatedAt: new Date().toISOString()
        };

        // Apply updates
        if (input.hasOwnProperty('completed')) {
            const newCompletedStatus = Boolean(input.completed);
            updatedTodo.completed = newCompletedStatus;
            
            // Handle completedAt timestamp
            if (newCompletedStatus && !existingTodo.completed) {
                updatedTodo.completedAt = new Date().toISOString();
            } else if (!newCompletedStatus && existingTodo.completed) {
                updatedTodo.completedAt = null;
            }
        }

        if (input.hasOwnProperty('title')) {
            updatedTodo.title = input.title!.trim();
        }

        if (input.hasOwnProperty('priority')) {
            updatedTodo.priority = input.priority!;
        }

        if (input.hasOwnProperty('tags')) {
            updatedTodo.tags = input.tags!;
        }

        if (input.hasOwnProperty('memo')) {
            updatedTodo.memo = input.memo!;
        }

        // Update in storage
        const updateSuccess = await this.storage.updateTodo(id, updatedTodo);
        
        if (!updateSuccess) {
            throw new AppError('Failed to update todo item in storage', 500, true, 'STORAGE_UPDATE_FAILED');
        }

        return updatedTodo;
    }

    /**
     * Delete a todo item
     * Requirements: 2.1, 2.2
     */
    async deleteTodo(id: string): Promise<boolean> {
        // Validate ID
        const idValidation = validateId(id);
        if (!idValidation.isValid) {
            throw new ValidationError('Invalid todo ID', idValidation.errors);
        }

        // Remove todo from storage
        const deleteSuccess = await this.storage.removeTodo(id);
        
        if (!deleteSuccess) {
            throw new NotFoundError('Todo item', id);
        }

        return true;
    }

    /**
     * Apply filter to todos
     * Requirements: 2.1, 2.2, 5.2
     * 
     * Filters todos based on status, priority, tags, and search text.
     * - Status filter: 'all', 'pending', or 'completed'
     * - Priority filter: 'high', 'medium', or 'low'
     * - Tags filter: matches if any todo tag contains any filter tag (case-insensitive)
     * - Search text: searches in title, memo, and tags (case-insensitive)
     * 
     * Requirements: 7.2 (tag filtering), 8.4 (memo search)
     */
    applyFilter(todos: TodoItem[], filter: TodoFilter): TodoItem[] {
        return todos.filter(todo => {
            // Status filter
            if (filter.status && filter.status !== 'all') {
                if (filter.status === 'completed' && !todo.completed) return false;
                if (filter.status === 'pending' && todo.completed) return false;
            }

            // Priority filter
            if (filter.priority && todo.priority !== filter.priority) {
                return false;
            }

            // Tags filter (要件 7.2: タグによるフィルタリング機能を提供する)
            if (filter.tags && filter.tags.length > 0) {
                const hasMatchingTag = filter.tags.some(filterTag => 
                    todo.tags.some(todoTag => 
                        todoTag.toLowerCase().includes(filterTag.toLowerCase())
                    )
                );
                if (!hasMatchingTag) return false;
            }

            // Search text filter (要件 8.4: メモの内容を検索対象に含める)
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
     * Get archived (completed) todos grouped by completion date
     * Requirements: 2.1, 2.2, 5.2, 9.1, 9.2, 9.3, 9.5
     * 
     * Returns completed todos grouped by completion date (YYYY-MM-DD format).
     * Groups are sorted by date (newest first), and tasks within each group
     * are sorted by completion time (newest first).
     */
    async getArchive(): Promise<ArchiveGroup[]> {
        // Retrieve all todos from storage
        const todos = await this.storage.readTodos();

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
        const archiveGroups = Array.from(groupedTodos.entries())
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

        return archiveGroups;
    }

    /**
     * Validate filter parameters
     * Requirements: 2.1
     * 
     * Validates that filter parameters are within acceptable limits:
     * - Search text must not exceed 1000 characters
     * - Cannot filter by more than 50 tags at once
     */
    validateFilter(filter: TodoFilter): void {
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
    }
}

/**
 * Default TodoService instance
 * Lazy initialization pattern
 */
let _defaultTodoService: TodoService | null = null;

/**
 * Get the default TodoService instance
 * Lazy initialization ensures the storage service is ready
 */
export function getDefaultTodoService(): TodoService {
    if (!_defaultTodoService) {
        _defaultTodoService = new TodoService(getDefaultStorageService());
    }
    return _defaultTodoService;
}

/**
 * Set a new default TodoService instance (mainly for testing)
 */
export function setDefaultTodoService(service: TodoService) {
    _defaultTodoService = service;
}

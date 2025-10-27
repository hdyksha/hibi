/**
 * Simple JSON File Storage Service
 * Requirements: 1.2, 3.3
 * 
 * Provides basic file read/write functionality for TodoItem data
 * with simple error handling and data persistence.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { TodoItem } from '../models';

/**
 * Storage error types
 */
export class StorageError extends Error {
    constructor(message: string, public readonly cause?: Error) {
        super(message);
        this.name = 'StorageError';
    }
}

/**
 * File storage service for TodoItem data
 */
export class FileStorageService {
    private readonly filePath: string;
    private writeQueue: Promise<void> = Promise.resolve();

    constructor(filePath: string = join(process.cwd(), 'data', 'tasks.json')) {
        this.filePath = filePath;
    }

    /**
     * Read all TodoItems from the JSON file
     * Requirements: 1.2 - Data persistence
     */
    async readTodos(): Promise<TodoItem[]> {
        try {
            // Ensure directory exists
            await this.ensureDirectoryExists();

            // Check if file exists
            const fileExists = await this.fileExists();
            if (!fileExists) {
                // Return empty array if file doesn't exist
                return [];
            }

            // Read file content
            const fileContent = await fs.readFile(this.filePath, 'utf-8');

            // Handle empty file
            if (!fileContent.trim()) {
                return [];
            }

            // Parse JSON content
            const data = JSON.parse(fileContent);

            // Validate that data is an array
            if (!Array.isArray(data)) {
                throw new StorageError('Invalid data format: expected array of TodoItems');
            }

            return data as TodoItem[];
        } catch (error) {
            if (error instanceof StorageError) {
                throw error;
            }

            if (error instanceof SyntaxError) {
                throw new StorageError('Invalid JSON format in storage file', error);
            }

            throw new StorageError(`Failed to read todos from storage: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Write all TodoItems to the JSON file
     * Requirements: 3.3 - Data persistence for status changes
     */
    async writeTodos(todos: TodoItem[]): Promise<void> {
        // Queue write operations to prevent concurrent file corruption
        this.writeQueue = this.writeQueue.then(async () => {
            await this.writeToFileDirectly(todos);
        });

        return this.writeQueue;
    }

    /**
     * Direct file write helper method
     */
    private async writeToFileDirectly(todos: TodoItem[]): Promise<void> {
        try {
            // Ensure directory exists
            await this.ensureDirectoryExists();

            // Convert to JSON with proper formatting
            const jsonContent = JSON.stringify(todos, null, 2);

            // Write to file
            await fs.writeFile(this.filePath, jsonContent, 'utf-8');
        } catch (error) {
            throw new StorageError(`Failed to write todos to storage: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Add a single TodoItem to storage
     * Requirements: 1.2 - Data persistence for new items
     */
    async addTodo(todo: TodoItem): Promise<void> {
        // Queue operations to prevent race conditions
        this.writeQueue = this.writeQueue.then(async () => {
            try {
                const todos = await this.readTodos();
                todos.push(todo);
                await this.writeToFileDirectly(todos);
            } catch (error) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new StorageError(`Failed to add todo to storage: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
            }
        });

        return this.writeQueue;
    }

    /**
     * Update a TodoItem in storage
     * Requirements: 3.3 - Data persistence for status changes
     */
    async updateTodo(id: string, updatedTodo: TodoItem): Promise<boolean> {
        let result = false;

        // Queue operations to prevent race conditions
        this.writeQueue = this.writeQueue.then(async () => {
            try {
                const todos = await this.readTodos();
                const index = todos.findIndex(todo => todo.id === id);

                if (index === -1) {
                    result = false; // Todo not found
                    return;
                }

                todos[index] = updatedTodo;
                await this.writeToFileDirectly(todos);
                result = true;
            } catch (error) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new StorageError(`Failed to update todo in storage: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
            }
        });

        await this.writeQueue;
        return result;
    }

    /**
     * Remove a TodoItem from storage
     * Requirements: Data persistence for deletions
     */
    async removeTodo(id: string): Promise<boolean> {
        let result = false;

        // Queue operations to prevent race conditions
        this.writeQueue = this.writeQueue.then(async () => {
            try {
                const todos = await this.readTodos();
                const initialLength = todos.length;
                const filteredTodos = todos.filter(todo => todo.id !== id);

                if (filteredTodos.length === initialLength) {
                    result = false; // Todo not found
                    return;
                }

                await this.writeToFileDirectly(filteredTodos);
                result = true;
            } catch (error) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new StorageError(`Failed to remove todo from storage: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
            }
        });

        await this.writeQueue;
        return result;
    }

    /**
     * Get the file path being used for storage
     */
    getFilePath(): string {
        return this.filePath;
    }

    /**
     * Check if the storage file exists
     */
    private async fileExists(): Promise<boolean> {
        try {
            await fs.access(this.filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Ensure the directory for the storage file exists
     */
    private async ensureDirectoryExists(): Promise<void> {
        try {
            const dir = dirname(this.filePath);
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            throw new StorageError(`Failed to create storage directory: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
        }
    }
}

/**
 * Default storage service instance
 */
export const defaultStorageService = new FileStorageService();
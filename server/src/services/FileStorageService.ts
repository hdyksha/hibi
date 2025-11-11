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
import { getProjectRoot } from '../utils/path';

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
 * StorageContext - Manages the current storage file path globally
 * This allows file switching without recreating service instances
 */
class StorageContext {
    private static currentFilePath: string | null = null;

    /**
     * Set the current storage file path
     * All FileStorageService instances without a fixed path will use this
     */
    static setFilePath(filePath: string): void {
        this.currentFilePath = filePath;
    }

    /**
     * Get the current storage file path
     * Returns the set path or the default path
     */
    static getFilePath(): string {
        return this.currentFilePath || this.getDefaultFilePath();
    }

    /**
     * Get the default storage file path based on environment configuration
     */
    private static getDefaultFilePath(): string {
        const projectRoot = getProjectRoot();
        const dataDir = process.env.TODO_DATA_DIR
            ? join(projectRoot, process.env.TODO_DATA_DIR)
            : join(projectRoot, 'server', 'data');
        return join(dataDir, 'tasks.json');
    }

    /**
     * Reset to default path (useful for testing)
     */
    static reset(): void {
        this.currentFilePath = null;
    }
}

/**
 * File storage service for TodoItem data
 * Supports dynamic file switching via StorageContext
 */
export class FileStorageService {
    private readonly fixedFilePath: string | null;

    /**
     * Create a new FileStorageService
     * @param filePath - Optional fixed file path. If provided, this instance will always use this path.
     *                   If not provided, the instance will use the current StorageContext path.
     */
    constructor(filePath?: string) {
        // If filePath is provided, use it as a fixed path (useful for testing)
        // Otherwise, use null to indicate this instance should use StorageContext
        this.fixedFilePath = filePath || null;
    }

    /**
     * Get the current file path
     * Uses the fixed path if provided in constructor, otherwise uses StorageContext
     */
    private getCurrentFilePath(): string {
        return this.fixedFilePath || StorageContext.getFilePath();
    }

    private pendingWriteOperations: Promise<void> = Promise.resolve();

    /**
     * Read all TodoItems from the JSON file
     * Requirements: 1.2 - Data persistence
     */
    async readTodos(): Promise<TodoItem[]> {
        try {
            // Ensure directory exists
            await this.ensureDirectoryExists();

            // Check if file exists
            const doesFileExist = await this.fileExists();
            if (!doesFileExist) {
                // Return empty array if file doesn't exist
                return [];
            }

            // Read file content
            const fileContent = await fs.readFile(this.getCurrentFilePath(), 'utf-8');

            // Handle empty file
            if (!fileContent.trim()) {
                return [];
            }

            // Parse JSON content
            const parsedData = JSON.parse(fileContent);

            // Validate that data is an array
            if (!Array.isArray(parsedData)) {
                throw new StorageError('Invalid data format: expected array of TodoItems');
            }

            return parsedData as TodoItem[];
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
        this.pendingWriteOperations = this.pendingWriteOperations.then(async () => {
            await this.writeToFileDirectly(todos);
        });

        return this.pendingWriteOperations;
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
            await fs.writeFile(this.getCurrentFilePath(), jsonContent, 'utf-8');
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
        this.pendingWriteOperations = this.pendingWriteOperations.then(async () => {
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

        return this.pendingWriteOperations;
    }

    /**
     * Update a TodoItem in storage
     * Requirements: 3.3 - Data persistence for status changes
     */
    async updateTodo(id: string, updatedTodo: TodoItem): Promise<boolean> {
        let wasUpdateSuccessful = false;

        // Queue operations to prevent race conditions
        this.pendingWriteOperations = this.pendingWriteOperations.then(async () => {
            try {
                const todos = await this.readTodos();
                const todoIndex = todos.findIndex(todo => todo.id === id);

                if (todoIndex === -1) {
                    wasUpdateSuccessful = false; // Todo not found
                    return;
                }

                todos[todoIndex] = updatedTodo;
                await this.writeToFileDirectly(todos);
                wasUpdateSuccessful = true;
            } catch (error) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new StorageError(`Failed to update todo in storage: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
            }
        });

        await this.pendingWriteOperations;
        return wasUpdateSuccessful;
    }

    /**
     * Remove a TodoItem from storage
     * Requirements: Data persistence for deletions
     */
    async removeTodo(id: string): Promise<boolean> {
        let wasRemovalSuccessful = false;

        // Queue operations to prevent race conditions
        this.pendingWriteOperations = this.pendingWriteOperations.then(async () => {
            try {
                const todos = await this.readTodos();
                const todosBeforeRemoval = todos.length;
                const remainingTodos = todos.filter(todo => todo.id !== id);

                if (remainingTodos.length === todosBeforeRemoval) {
                    wasRemovalSuccessful = false; // Todo not found
                    return;
                }

                await this.writeToFileDirectly(remainingTodos);
                wasRemovalSuccessful = true;
            } catch (error) {
                if (error instanceof StorageError) {
                    throw error;
                }
                throw new StorageError(`Failed to remove todo from storage: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
            }
        });

        await this.pendingWriteOperations;
        return wasRemovalSuccessful;
    }

    /**
     * Get the file path being used for storage
     */
    getFilePath(): string {
        return this.getCurrentFilePath();
    }

    /**
     * Check if the storage file exists
     */
    private async fileExists(): Promise<boolean> {
        try {
            await fs.access(this.getCurrentFilePath());
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
            const directoryPath = dirname(this.getCurrentFilePath());
            await fs.mkdir(directoryPath, { recursive: true });
        } catch (error) {
            throw new StorageError(`Failed to create storage directory: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
        }
    }
}

/**
 * Get list of JSON files in a directory
 * Requirements: データ管理の柔軟性向上
 */
export async function listJsonFiles(directoryPath: string): Promise<string[]> {
    try {
        const files = await fs.readdir(directoryPath);
        return files.filter(file => file.endsWith('.json')).sort();
    } catch (error) {
        throw new StorageError(`Failed to list files in directory: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error : undefined);
    }
}

/**
 * Get the default data directory from environment variable or use default
 */
function getDefaultDataDirectory(): string {
    const projectRoot = getProjectRoot();
    if (process.env.TODO_DATA_DIR) {
        return join(projectRoot, process.env.TODO_DATA_DIR);
    }
    return join(projectRoot, 'server', 'data');
}

/**
 * Default storage service instance (lazy initialization)
 */
let defaultStorageServiceInstance: FileStorageService | null = null;

/**
 * Get the current default storage service
 * Lazy initialization ensures environment variables are loaded before creating the instance
 * 
 * Note: Creates the service WITHOUT a fixed path, so it uses StorageContext dynamically
 */
export function getDefaultStorageService(): FileStorageService {
    if (!defaultStorageServiceInstance) {
        // Don't pass a filePath - let it use StorageContext
        defaultStorageServiceInstance = new FileStorageService();
    }
    return defaultStorageServiceInstance;
}

/**
 * Set a new default storage service (mainly for testing)
 */
export function setDefaultStorageService(service: FileStorageService) {
    defaultStorageServiceInstance = service;
}

/**
 * Switch to a different storage file
 * Requirements: 複数ファイル間でのデータ切り替え機能
 * 
 * This updates the StorageContext, so all FileStorageService instances
 * without a fixed path will automatically use the new file.
 */
export function switchStorageFile(filePath: string) {
    StorageContext.setFilePath(filePath);
}

/**
 * Reset storage context to default (useful for testing)
 */
function resetStorageContext() {
    StorageContext.reset();
}

// Export StorageContext utilities
export { resetStorageContext };
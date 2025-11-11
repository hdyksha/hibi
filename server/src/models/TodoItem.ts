/**
 * TodoItem data model and validation functions
 * Requirements: 1.3, 1.4, 1.5, 1.6
 */

import type { ValidationResult, ValidationError } from '../utils/validator.js';
import { Validator, combineValidationResults, validateIfDefined } from '../utils/validator.js';

/**
 * 優先度の定数配列と型定義
 * 要件 6.1: 各todoアイテムに優先度（high、medium、low）を設定できる
 */
export const PRIORITY_VALUES = ['high', 'medium', 'low'] as const;
export type Priority = typeof PRIORITY_VALUES[number];

/**
 * フィルタリング用の定数配列と型定義
 */
export const FILTER_STATUS_VALUES = ['all', 'pending', 'completed'] as const;
export type FilterStatus = typeof FILTER_STATUS_VALUES[number];

/**
 * TodoItemフィルタリング用のインターフェース
 * 要件 7.2: タグによるフィルタリング機能を提供する
 * 要件 8.4: メモの内容を検索対象に含める
 */
export interface TodoFilter {
    status?: FilterStatus;     // ステータスフィルター
    priority?: Priority;       // 優先度フィルター
    tags?: string[];          // タグフィルター
    searchText?: string;      // 検索テキスト（タイトルとメモを対象）
}

/**
 * アーカイブグループ用のインターフェース
 * 要件 9.2: アーカイブビューで完了日によるグルーピング機能を提供する
 * 要件 9.5: アーカイブビューで各グループの完了タスク数を表示する
 */
export interface ArchiveGroup {
    date: string;        // YYYY-MM-DD format
    tasks: TodoItem[];   // 完了済みtodoアイテム
    count: number;       // 完了タスク数
}

export interface TodoItem {
    id: string;           // 一意のID (要件 1.5)
    title: string;        // タイトル (必須) (要件 1.3)
    completed: boolean;   // 完了状態 (デフォルト: false) (要件 1.4)
    priority: Priority;   // 優先度 (デフォルト: 'medium') (要件 6.1, 6.2)
    tags: string[];       // タグ (デフォルト: []) (要件 7.1)
    memo: string;         // メモ (デフォルト: '') (要件 8.1)
    createdAt: string;    // 作成日時 (ISO 8601形式) (要件 1.6)
    updatedAt: string;    // 更新日時 (ISO 8601形式) (要件 3.5)
    completedAt: string | null; // 完了日時 (ISO 8601形式) (要件 3.4)
}

/**
 * TodoItem作成時の入力データ型
 */
export interface CreateTodoItemInput {
    title: string;
    priority?: Priority;  // オプショナル、デフォルトは'medium' (要件 6.2)
    tags?: string[];      // オプショナル、デフォルトは[] (要件 7.1)
    memo?: string;        // オプショナル、デフォルトは'' (要件 8.1)
}

/**
 * TodoItem更新時の入力データ型
 */
export interface UpdateTodoItemInput {
    title?: string;
    completed?: boolean;
    priority?: Priority;  // 優先度の更新 (要件 6.1)
    tags?: string[];      // タグの更新 (要件 7.1)
    memo?: string;        // メモの更新 (要件 8.1)
}



/**
 * Title validator
 * Requirements: 1.3 - Title is required
 * 
 * Validates that the title is a non-empty string with a maximum length of 200 characters.
 */
const titleValidator = new Validator<string>('title')
    .isType('string', 'Title is required and must be a string')
    .required('Title cannot be empty')
    .maxLength(200, 'Title cannot exceed 200 characters');

/**
 * Validate a TodoItem title
 * Requirements: 1.3 - Title is required
 * 
 * @param title - The title to validate
 * @returns ValidationResult indicating if the title is valid
 * 
 * @example
 * ```typescript
 * const result = validateTitle('Buy groceries');
 * if (!result.isValid) {
 *   console.error('Title validation failed:', result.errors);
 * }
 * ```
 */
export function validateTitle(title: string): ValidationResult {
    return titleValidator.validate(title);
}

/**
 * Completed status validator
 * Requirements: 1.4 - Default to incomplete status
 * 
 * Validates that the completed status is a boolean value.
 */
const completedValidator = new Validator<boolean>('completed')
    .isBoolean('Completed must be a boolean value');

/**
 * Validate a TodoItem completed status
 * Requirements: 1.4 - Default to incomplete status
 * 
 * @param completed - The completed status to validate
 * @returns ValidationResult indicating if the completed status is valid
 */
export function validateCompleted(completed: boolean): ValidationResult {
    return completedValidator.validate(completed);
}

/**
 * ID validator
 * Requirements: 1.5 - Auto-generate unique ID
 * 
 * Validates that the ID is a non-empty string.
 */
const idValidator = new Validator<string>('id')
    .isType('string', 'ID is required and must be a string')
    .required('ID cannot be empty');

/**
 * Validate a TodoItem ID
 * Requirements: 1.5 - Auto-generate unique ID
 * 
 * @param id - The ID to validate
 * @returns ValidationResult indicating if the ID is valid
 */
export function validateId(id: string): ValidationResult {
    return idValidator.validate(id);
}

/**
 * Validate a TodoItem creation timestamp
 * Requirements: 1.6 - Auto-record creation timestamp
 * 
 * Validates that the createdAt timestamp is a non-empty string in ISO 8601 format.
 * 
 * @param createdAt - The creation timestamp to validate
 * @returns ValidationResult indicating if the timestamp is valid
 * 
 * @example
 * ```typescript
 * const result = validateCreatedAt(new Date().toISOString());
 * ```
 */
export function validateCreatedAt(createdAt: string): ValidationResult {
    // First check type and emptiness
    if (typeof createdAt !== 'string' || createdAt.trim().length === 0) {
        return {
            isValid: false,
            errors: [{
                field: 'createdAt',
                message: 'CreatedAt is required and must be a string'
            }]
        };
    }

    // Then validate as ISO date using the validator
    const dateValidator = new Validator<string>('createdAt')
        .isISODate('CreatedAt must be a valid ISO 8601 date string');

    return dateValidator.validate(createdAt);
}

/**
 * Validate a TodoItem update timestamp
 * Requirements: 3.5 - Auto-update modification timestamp
 * 
 * Validates that the updatedAt timestamp is a non-empty string in ISO 8601 format.
 * 
 * @param updatedAt - The update timestamp to validate
 * @returns ValidationResult indicating if the timestamp is valid
 */
export function validateUpdatedAt(updatedAt: string): ValidationResult {
    // First check type and emptiness
    if (typeof updatedAt !== 'string' || updatedAt.trim().length === 0) {
        return {
            isValid: false,
            errors: [{
                field: 'updatedAt',
                message: 'UpdatedAt is required and must be a string'
            }]
        };
    }

    // Then validate as ISO date using the validator
    const dateValidator = new Validator<string>('updatedAt')
        .isISODate('UpdatedAt must be a valid ISO 8601 date string');

    return dateValidator.validate(updatedAt);
}

/**
 * Completed timestamp validator
 * Requirements: 3.4 - Record completion timestamp when todo is completed
 * 
 * Validates that the completedAt timestamp is either null (for incomplete todos)
 * or a valid ISO 8601 date string (for completed todos).
 */
const completedAtValidator = new Validator<string | null>('completedAt')
    .addRule({
        validate: (value) => value === null || typeof value === 'string',
        message: 'CompletedAt must be a string or null'
    })
    .addRule({
        validate: (value) => {
            if (value === null) {
                return true;
            }
            const date = new Date(value);
            return !isNaN(date.getTime());
        },
        message: 'CompletedAt must be a valid ISO 8601 date string'
    });

/**
 * Validate a TodoItem completion timestamp
 * Requirements: 3.4 - Record completion timestamp when todo is completed
 * 
 * @param completedAt - The completion timestamp to validate (null for incomplete todos)
 * @returns ValidationResult indicating if the timestamp is valid
 * 
 * @example
 * ```typescript
 * // For incomplete todo
 * const result1 = validateCompletedAt(null);
 * 
 * // For completed todo
 * const result2 = validateCompletedAt(new Date().toISOString());
 * ```
 */
export function validateCompletedAt(completedAt: string | null): ValidationResult {
    return completedAtValidator.validate(completedAt);
}

/**
 * Validate a TodoItem priority
 * Requirements: 6.1 - Set priority (high, medium, low) for each todo item
 * 
 * Validates that the priority is one of the allowed values: 'high', 'medium', or 'low'.
 * 
 * @param priority - The priority to validate
 * @returns ValidationResult indicating if the priority is valid
 * 
 * @example
 * ```typescript
 * const result = validatePriority('high');
 * if (!result.isValid) {
 *   console.error('Invalid priority:', result.errors);
 * }
 * ```
 */
export function validatePriority(priority: Priority): ValidationResult {
    const errors: ValidationError[] = [];

    // First check if it's a string
    if (typeof priority !== 'string') {
        errors.push({
            field: 'priority',
            message: 'Priority is required and must be a string'
        });
        return {
            isValid: false,
            errors
        };
    }

    // Then check if it's a valid priority value
    if (!PRIORITY_VALUES.includes(priority as Priority)) {
        errors.push({
            field: 'priority',
            message: `Priority must be one of: ${PRIORITY_VALUES.join(', ')}`
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate TodoItem tags
 * Requirements: 7.1 - Add multiple tags to each todo item
 * 
 * Validates that:
 * - Tags is an array
 * - Each tag is a non-empty string
 * - Each tag does not exceed 50 characters
 * - Tags are unique (case-insensitive)
 * 
 * @param tags - The array of tags to validate
 * @returns ValidationResult indicating if the tags are valid
 * 
 * @example
 * ```typescript
 * const result = validateTags(['work', 'urgent', 'meeting']);
 * if (!result.isValid) {
 *   console.error('Invalid tags:', result.errors);
 * }
 * ```
 */
export function validateTags(tags: string[]): ValidationResult {
    const errors: ValidationError[] = [];

    if (!Array.isArray(tags)) {
        errors.push({
            field: 'tags',
            message: 'Tags must be an array'
        });
        return {
            isValid: false,
            errors
        };
    }

    // Validate each tag
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];

        if (typeof tag !== 'string') {
            errors.push({
                field: 'tags',
                message: `Tag at index ${i} must be a string`
            });
        } else if (tag.trim().length === 0) {
            errors.push({
                field: 'tags',
                message: `Tag at index ${i} cannot be empty`
            });
        } else if (tag.length > 50) {
            errors.push({
                field: 'tags',
                message: `Tag at index ${i} cannot exceed 50 characters`
            });
        }
    }

    // Check for duplicate tags (case-insensitive)
    const stringTags = tags.filter((tag): tag is string => typeof tag === 'string');
    const uniqueTags = new Set(stringTags.map(tag => tag.trim().toLowerCase()));
    if (uniqueTags.size !== stringTags.length) {
        errors.push({
            field: 'tags',
            message: 'Tags must be unique (case-insensitive)'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Memo validator
 * Requirements: 8.1 - Provide memo field for each todo item
 * 
 * Validates that the memo is a string.
 */
const memoValidator = new Validator<string>('memo')
    .isType('string', 'Memo must be a string');

/**
 * Validate a TodoItem memo
 * Requirements: 8.1 - Provide memo field for each todo item
 * 
 * @param memo - The memo to validate
 * @returns ValidationResult indicating if the memo is valid
 */
export function validateMemo(memo: string): ValidationResult {
    return memoValidator.validate(memo);
}

/**
 * Validate TodoItem creation input data
 * 
 * Validates all required and optional fields for creating a new TodoItem.
 * Required fields: title
 * Optional fields: priority, tags, memo
 * 
 * @param input - The creation input data to validate
 * @returns ValidationResult containing all validation errors (if any)
 * 
 * @example
 * ```typescript
 * const input: CreateTodoItemInput = {
 *   title: 'Buy groceries',
 *   priority: 'high',
 *   tags: ['shopping', 'urgent']
 * };
 * 
 * const result = validateCreateTodoItemInput(input);
 * if (!result.isValid) {
 *   throw new ValidationError('Invalid input', result.errors);
 * }
 * ```
 */
export function validateCreateTodoItemInput(input: CreateTodoItemInput): ValidationResult {
    return combineValidationResults(
        validateTitle(input.title),
        validateIfDefined(input.priority, validatePriority),
        validateIfDefined(input.tags, validateTags),
        validateIfDefined(input.memo, validateMemo)
    );
}

/**
 * Validate TodoItem update input data
 * 
 * Validates all optional fields for updating an existing TodoItem.
 * All fields are optional, but at least one must be provided.
 * 
 * @param input - The update input data to validate
 * @returns ValidationResult containing all validation errors (if any)
 * 
 * @example
 * ```typescript
 * const input: UpdateTodoItemInput = {
 *   completed: true,
 *   priority: 'low'
 * };
 * 
 * const result = validateUpdateTodoItemInput(input);
 * if (!result.isValid) {
 *   throw new ValidationError('Invalid update input', result.errors);
 * }
 * ```
 */
export function validateUpdateTodoItemInput(input: UpdateTodoItemInput): ValidationResult {
    return combineValidationResults(
        validateIfDefined(input.title, validateTitle),
        validateIfDefined(input.completed, validateCompleted),
        validateIfDefined(input.priority, validatePriority),
        validateIfDefined(input.tags, validateTags),
        validateIfDefined(input.memo, validateMemo)
    );
}

/**
 * Validate a complete TodoItem object
 * 
 * Validates all fields of a TodoItem, ensuring the entire object is valid.
 * This is typically used when reading data from storage or before saving.
 * 
 * @param todoItem - The complete TodoItem to validate
 * @returns ValidationResult containing all validation errors (if any)
 * 
 * @example
 * ```typescript
 * const todo: TodoItem = {
 *   id: '123',
 *   title: 'Buy groceries',
 *   completed: false,
 *   priority: 'high',
 *   tags: ['shopping'],
 *   memo: 'Don\'t forget milk',
 *   createdAt: '2024-01-15T10:00:00Z',
 *   updatedAt: '2024-01-15T10:00:00Z',
 *   completedAt: null
 * };
 * 
 * const result = validateTodoItem(todo);
 * if (!result.isValid) {
 *   console.error('Invalid todo item:', result.errors);
 * }
 * ```
 */
export function validateTodoItem(todoItem: TodoItem): ValidationResult {
    return combineValidationResults(
        validateId(todoItem.id),
        validateTitle(todoItem.title),
        validateCompleted(todoItem.completed),
        validatePriority(todoItem.priority),
        validateTags(todoItem.tags),
        validateMemo(todoItem.memo),
        validateCreatedAt(todoItem.createdAt),
        validateUpdatedAt(todoItem.updatedAt),
        validateCompletedAt(todoItem.completedAt)
    );
}
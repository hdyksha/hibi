/**
 * TodoItem data model and validation functions
 * Requirements: 1.3, 1.4, 1.5, 1.6
 */

import type { ValidationResult, ValidationError } from '../utils/validator.js';
import { Validator } from '../utils/validator.js';

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
 * タイトルのバリデーション
 * 要件 1.3: タイトルは必須
 */
const titleValidator = new Validator<string>('title')
    .isType('string', 'Title is required and must be a string')
    .required('Title cannot be empty')
    .maxLength(200, 'Title cannot exceed 200 characters');

export function validateTitle(title: string): ValidationResult {
    return titleValidator.validate(title);
}

/**
 * 完了状態のバリデーション
 * 要件 1.4: デフォルトで未完了ステータス
 */
const completedValidator = new Validator<boolean>('completed')
    .isBoolean('Completed must be a boolean value');

export function validateCompleted(completed: boolean): ValidationResult {
    return completedValidator.validate(completed);
}

/**
 * IDのバリデーション
 * 要件 1.5: 一意のIDを自動生成
 */
const idValidator = new Validator<string>('id')
    .isType('string', 'ID is required and must be a string')
    .required('ID cannot be empty');

export function validateId(id: string): ValidationResult {
    return idValidator.validate(id);
}

/**
 * 作成日時のバリデーション
 * 要件 1.6: 作成日時を自動記録
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
 * 更新日時のバリデーション
 * 要件 3.5: 更新日時を自動更新
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
 * 完了日時のバリデーション
 * 要件 3.4: todoアイテムが完了済みになった時、完了日時を記録する
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

export function validateCompletedAt(completedAt: string | null): ValidationResult {
    return completedAtValidator.validate(completedAt);
}

/**
 * 優先度のバリデーション
 * 要件 6.1: 各todoアイテムに優先度（high、medium、low）を設定できる
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
 * タグのバリデーション
 * 要件 7.1: 各todoアイテムに複数のタグを追加できる
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
 * メモのバリデーション
 * 要件 8.1: 各todoアイテムにメモフィールドを提供する
 */
const memoValidator = new Validator<string>('memo')
    .isType('string', 'Memo must be a string');

export function validateMemo(memo: string): ValidationResult {
    return memoValidator.validate(memo);
}

/**
 * TodoItem作成入力データのバリデーション
 */
export function validateCreateTodoItemInput(input: CreateTodoItemInput): ValidationResult {
    const errors: ValidationError[] = [];

    const titleValidation = validateTitle(input.title);
    errors.push(...titleValidation.errors);

    // 優先度が指定されている場合のみバリデーション (要件 6.2: デフォルトは'medium')
    if (input.priority !== undefined) {
        const priorityValidation = validatePriority(input.priority);
        errors.push(...priorityValidation.errors);
    }

    // タグが指定されている場合のみバリデーション (要件 7.1: デフォルトは[])
    if (input.tags !== undefined) {
        const tagsValidation = validateTags(input.tags);
        errors.push(...tagsValidation.errors);
    }

    // メモが指定されている場合のみバリデーション (要件 8.1: デフォルトは'')
    if (input.memo !== undefined) {
        const memoValidation = validateMemo(input.memo);
        errors.push(...memoValidation.errors);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * TodoItem更新入力データのバリデーション
 */
export function validateUpdateTodoItemInput(input: UpdateTodoItemInput): ValidationResult {
    const errors: ValidationError[] = [];

    if (input.title !== undefined) {
        const titleValidation = validateTitle(input.title);
        errors.push(...titleValidation.errors);
    }

    if (input.completed !== undefined) {
        const completedValidation = validateCompleted(input.completed);
        errors.push(...completedValidation.errors);
    }

    if (input.priority !== undefined) {
        const priorityValidation = validatePriority(input.priority);
        errors.push(...priorityValidation.errors);
    }

    if (input.tags !== undefined) {
        const tagsValidation = validateTags(input.tags);
        errors.push(...tagsValidation.errors);
    }

    if (input.memo !== undefined) {
        const memoValidation = validateMemo(input.memo);
        errors.push(...memoValidation.errors);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 完全なTodoItemのバリデーション
 */
export function validateTodoItem(todoItem: TodoItem): ValidationResult {
    const errors: ValidationError[] = [];

    const idValidation = validateId(todoItem.id);
    const titleValidation = validateTitle(todoItem.title);
    const completedValidation = validateCompleted(todoItem.completed);
    const priorityValidation = validatePriority(todoItem.priority);
    const tagsValidation = validateTags(todoItem.tags);
    const memoValidation = validateMemo(todoItem.memo);
    const createdAtValidation = validateCreatedAt(todoItem.createdAt);
    const updatedAtValidation = validateUpdatedAt(todoItem.updatedAt);
    const completedAtValidation = validateCompletedAt(todoItem.completedAt);

    errors.push(...idValidation.errors);
    errors.push(...titleValidation.errors);
    errors.push(...completedValidation.errors);
    errors.push(...priorityValidation.errors);
    errors.push(...tagsValidation.errors);
    errors.push(...memoValidation.errors);
    errors.push(...createdAtValidation.errors);
    errors.push(...updatedAtValidation.errors);
    errors.push(...completedAtValidation.errors);

    return {
        isValid: errors.length === 0,
        errors
    };
}
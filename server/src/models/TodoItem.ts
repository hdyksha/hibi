/**
 * TodoItem data model and validation functions
 * Requirements: 1.3, 1.4, 1.5, 1.6
 */

export interface TodoItem {
    id: string;           // 一意のID (要件 1.5)
    title: string;        // タイトル (必須) (要件 1.3)
    completed: boolean;   // 完了状態 (デフォルト: false) (要件 1.4)
    createdAt: string;    // 作成日時 (ISO 8601形式) (要件 1.6)
}

/**
 * TodoItem作成時の入力データ型
 */
export interface CreateTodoItemInput {
    title: string;
}

/**
 * TodoItem更新時の入力データ型
 */
export interface UpdateTodoItemInput {
    title?: string;
    completed?: boolean;
}

/**
 * バリデーションエラー型
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * バリデーション結果型
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * タイトルのバリデーション
 * 要件 1.3: タイトルは必須
 */
export function validateTitle(title: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof title !== 'string') {
        errors.push({
            field: 'title',
            message: 'Title is required and must be a string'
        });
    } else if (title.trim().length === 0) {
        errors.push({
            field: 'title',
            message: 'Title cannot be empty'
        });
    } else if (title.length > 200) {
        errors.push({
            field: 'title',
            message: 'Title cannot exceed 200 characters'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 完了状態のバリデーション
 * 要件 1.4: デフォルトで未完了ステータス
 */
export function validateCompleted(completed: boolean): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof completed !== 'boolean') {
        errors.push({
            field: 'completed',
            message: 'Completed must be a boolean value'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * IDのバリデーション
 * 要件 1.5: 一意のIDを自動生成
 */
export function validateId(id: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (typeof id !== 'string') {
        errors.push({
            field: 'id',
            message: 'ID is required and must be a string'
        });
    } else if (id.trim().length === 0) {
        errors.push({
            field: 'id',
            message: 'ID cannot be empty'
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 作成日時のバリデーション
 * 要件 1.6: 作成日時を自動記録
 */
export function validateCreatedAt(createdAt: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!createdAt || typeof createdAt !== 'string') {
        errors.push({
            field: 'createdAt',
            message: 'CreatedAt is required and must be a string'
        });
    } else {
        const date = new Date(createdAt);
        if (isNaN(date.getTime())) {
            errors.push({
                field: 'createdAt',
                message: 'CreatedAt must be a valid ISO 8601 date string'
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * TodoItem作成入力データのバリデーション
 */
export function validateCreateTodoItemInput(input: CreateTodoItemInput): ValidationResult {
    const titleValidation = validateTitle(input.title);

    return {
        isValid: titleValidation.isValid,
        errors: titleValidation.errors
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
    const createdAtValidation = validateCreatedAt(todoItem.createdAt);

    errors.push(...idValidation.errors);
    errors.push(...titleValidation.errors);
    errors.push(...completedValidation.errors);
    errors.push(...createdAtValidation.errors);

    return {
        isValid: errors.length === 0,
        errors
    };
}
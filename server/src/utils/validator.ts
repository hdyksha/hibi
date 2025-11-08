/**
 * Common validator utility
 * Requirements: 1.1, 1.2, 7.1
 * 
 * Provides a flexible validation framework to reduce code duplication
 * and simplify validation logic across the application.
 */

/**
 * Validation error interface
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Validation rule interface
 * Defines a single validation rule with a validation function and error message
 */
export interface ValidationRule<T> {
    validate: (value: T) => boolean;
    message: string;
}

/**
 * Validator class
 * Provides a fluent API for building and executing validation rules
 * 
 * @example
 * const titleValidator = new Validator<string>('title')
 *   .required('Title is required')
 *   .maxLength(200, 'Title cannot exceed 200 characters');
 * 
 * const result = titleValidator.validate('My Todo');
 */
export class Validator<T> {
    private rules: ValidationRule<T>[] = [];
    protected fieldName: string;

    constructor(fieldName: string) {
        this.fieldName = fieldName;
    }

    /**
     * Add a custom validation rule
     */
    addRule(rule: ValidationRule<T>): this {
        this.rules.push(rule);
        return this;
    }

    /**
     * Validate that a value is required (not null, undefined, or empty string)
     */
    required(message?: string): this {
        this.rules.push({
            validate: (value: T) => {
                if (value === null || value === undefined) {
                    return false;
                }
                if (typeof value === 'string' && value.trim().length === 0) {
                    return false;
                }
                return true;
            },
            message: message || `${this.fieldName} is required`
        });
        return this;
    }

    /**
     * Validate that a string value has a maximum length
     */
    maxLength(max: number, message?: string): this {
        this.rules.push({
            validate: (value: T) => {
                if (typeof value !== 'string') {
                    return true; // Skip if not a string
                }
                return value.length <= max;
            },
            message: message || `${this.fieldName} cannot exceed ${max} characters`
        });
        return this;
    }

    /**
     * Validate that a string value has a minimum length
     */
    minLength(min: number, message?: string): this {
        this.rules.push({
            validate: (value: T) => {
                if (typeof value !== 'string') {
                    return true; // Skip if not a string
                }
                return value.length >= min;
            },
            message: message || `${this.fieldName} must be at least ${min} characters`
        });
        return this;
    }

    /**
     * Validate that a value is of a specific type
     */
    isType(type: string, message?: string): this {
        this.rules.push({
            validate: (value: T) => typeof value === type,
            message: message || `${this.fieldName} must be a ${type}`
        });
        return this;
    }

    /**
     * Validate that a value is one of the allowed values
     */
    oneOf(allowedValues: readonly T[], message?: string): this {
        this.rules.push({
            validate: (value: T) => allowedValues.includes(value),
            message: message || `${this.fieldName} must be one of: ${allowedValues.join(', ')}`
        });
        return this;
    }

    /**
     * Validate that a value is an array
     */
    isArray(message?: string): this {
        this.rules.push({
            validate: (value: T) => Array.isArray(value),
            message: message || `${this.fieldName} must be an array`
        });
        return this;
    }

    /**
     * Validate that a value is a valid ISO 8601 date string
     */
    isISODate(message?: string): this {
        this.rules.push({
            validate: (value: T) => {
                if (typeof value !== 'string') {
                    return false;
                }
                const date = new Date(value);
                return !isNaN(date.getTime());
            },
            message: message || `${this.fieldName} must be a valid ISO 8601 date string`
        });
        return this;
    }

    /**
     * Validate that a value is a boolean
     */
    isBoolean(message?: string): this {
        this.rules.push({
            validate: (value: T) => typeof value === 'boolean',
            message: message || `${this.fieldName} must be a boolean value`
        });
        return this;
    }

    /**
     * Execute all validation rules and return the result
     */
    validate(value: T): ValidationResult {
        const errors: ValidationError[] = [];

        for (const rule of this.rules) {
            if (!rule.validate(value)) {
                errors.push({
                    field: this.fieldName,
                    message: rule.message
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Array validator class
 * Specialized validator for array values with element-level validation
 * 
 * @example
 * const tagsValidator = new ArrayValidator<string>('tags')
 *   .isArray()
 *   .eachElement(element => 
 *     new Validator<string>('tag')
 *       .required()
 *       .maxLength(50)
 *       .validate(element)
 *   );
 */
export class ArrayValidator<T> extends Validator<T[]> {
    private elementValidator?: (element: T, index: number) => ValidationResult;

    constructor(fieldName: string) {
        super(fieldName);
    }

    /**
     * Validate each element in the array using a custom validator
     */
    eachElement(validator: (element: T, index: number) => ValidationResult): this {
        this.elementValidator = validator;
        return this;
    }

    /**
     * Validate that all elements in the array are unique
     */
    unique(message?: string): this {
        this.addRule({
            validate: (value: T[]) => {
                if (!Array.isArray(value)) {
                    return true; // Skip if not an array
                }
                const stringValues = value.map(v =>
                    typeof v === 'string' ? v.trim().toLowerCase() : String(v)
                );
                const uniqueValues = new Set(stringValues);
                return uniqueValues.size === stringValues.length;
            },
            message: message || `${this.fieldName} must contain unique values`
        });
        return this;
    }

    /**
     * Execute all validation rules including element-level validation
     */
    validate(value: T[]): ValidationResult {
        // First run the base validator rules
        const baseResult = super.validate(value);
        if (!baseResult.isValid) {
            return baseResult;
        }

        // Then validate each element if an element validator is provided
        if (this.elementValidator && Array.isArray(value)) {
            const errors: ValidationError[] = [];

            for (let i = 0; i < value.length; i++) {
                const elementResult = this.elementValidator(value[i], i);
                if (!elementResult.isValid) {
                    // Adjust error messages to include array index and use the array field name
                    errors.push(...elementResult.errors.map(err => {
                        // Replace the element field name with indexed version in the message
                        const indexedMessage = err.message.replace(
                            new RegExp(`\\b${err.field}\\b`, 'g'),
                            `${err.field} at index ${i}`
                        );
                        return {
                            field: this.fieldName,
                            message: indexedMessage
                        };
                    }));
                }
            }

            if (errors.length > 0) {
                return {
                    isValid: false,
                    errors
                };
            }
        }

        return {
            isValid: true,
            errors: []
        };
    }
}

/**
 * Combine multiple validation results into a single result
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: ValidationError[] = [];

    for (const result of results) {
        allErrors.push(...result.errors);
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
}

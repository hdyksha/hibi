/**
 * Common validator utility
 * Requirements: 1.1, 1.2, 7.1
 * 
 * Provides a flexible validation framework to reduce code duplication
 * and simplify validation logic across the application.
 * 
 * This module implements a fluent API for building validation chains,
 * making it easy to compose multiple validation rules and collect
 * all validation errors in a single pass.
 * 
 * @example
 * ```typescript
 * // Create a validator for a title field
 * const titleValidator = new Validator<string>('title')
 *   .required('Title is required')
 *   .maxLength(200, 'Title cannot exceed 200 characters');
 * 
 * // Validate a value
 * const result = titleValidator.validate('My Todo');
 * if (!result.isValid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */

/**
 * Validation error interface
 * 
 * Represents a single validation error with the field name and error message.
 */
export interface ValidationError {
    /** The name of the field that failed validation */
    field: string;
    /** A human-readable error message describing the validation failure */
    message: string;
}

/**
 * Validation result interface
 * 
 * Contains the validation status and any errors that occurred.
 */
export interface ValidationResult {
    /** True if validation passed, false otherwise */
    isValid: boolean;
    /** Array of validation errors (empty if validation passed) */
    errors: ValidationError[];
}

/**
 * Validation rule interface
 * 
 * Defines a single validation rule with a validation function and error message.
 * 
 * @template T - The type of value being validated
 */
export interface ValidationRule<T> {
    /** Function that returns true if the value is valid, false otherwise */
    validate: (value: T) => boolean;
    /** Error message to return if validation fails */
    message: string;
}

/**
 * Validator class
 * 
 * Provides a fluent API for building and executing validation rules.
 * Validators can be reused across multiple validations and support
 * method chaining for composing complex validation logic.
 * 
 * @template T - The type of value being validated
 * 
 * @example
 * ```typescript
 * // Create a reusable validator
 * const titleValidator = new Validator<string>('title')
 *   .required('Title is required')
 *   .maxLength(200, 'Title cannot exceed 200 characters');
 * 
 * // Use it to validate multiple values
 * const result1 = titleValidator.validate('My Todo');
 * const result2 = titleValidator.validate('Another Todo');
 * 
 * // Create a validator with custom rules
 * const emailValidator = new Validator<string>('email')
 *   .required()
 *   .addRule({
 *     validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
 *     message: 'Email must be valid'
 *   });
 * ```
 */
export class Validator<T> {
    private rules: ValidationRule<T>[] = [];
    protected fieldName: string;

    /**
     * Create a new Validator instance
     * 
     * @param fieldName - The name of the field being validated (used in error messages)
     */
    constructor(fieldName: string) {
        this.fieldName = fieldName;
    }

    /**
     * Add a custom validation rule
     * 
     * Use this method to add custom validation logic that isn't covered
     * by the built-in validation methods.
     * 
     * @param rule - The validation rule to add
     * @returns This validator instance for method chaining
     * 
     * @example
     * ```typescript
     * const validator = new Validator<string>('username')
     *   .addRule({
     *     validate: (v) => /^[a-zA-Z0-9_]+$/.test(v),
     *     message: 'Username can only contain letters, numbers, and underscores'
     *   });
     * ```
     */
    addRule(rule: ValidationRule<T>): this {
        this.rules.push(rule);
        return this;
    }

    /**
     * Validate that a value is required (not null, undefined, or empty string)
     * 
     * For string values, this also checks that the trimmed string is not empty.
     * 
     * @param message - Optional custom error message
     * @returns This validator instance for method chaining
     * 
     * @example
     * ```typescript
     * const validator = new Validator<string>('name')
     *   .required('Name is required');
     * ```
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
     * 
     * Skips validation if the value is not a string.
     * 
     * @param max - Maximum allowed length
     * @param message - Optional custom error message
     * @returns This validator instance for method chaining
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
     * 
     * Skips validation if the value is not a string.
     * 
     * @param min - Minimum required length
     * @param message - Optional custom error message
     * @returns This validator instance for method chaining
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
     * 
     * @param type - The expected type (e.g., 'string', 'number', 'boolean')
     * @param message - Optional custom error message
     * @returns This validator instance for method chaining
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
     * 
     * Useful for validating enum-like values or restricted sets of options.
     * 
     * @param allowedValues - Array of allowed values
     * @param message - Optional custom error message
     * @returns This validator instance for method chaining
     * 
     * @example
     * ```typescript
     * const priorityValidator = new Validator<string>('priority')
     *   .oneOf(['high', 'medium', 'low']);
     * ```
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
     * 
     * @param message - Optional custom error message
     * @returns This validator instance for method chaining
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
     * 
     * Checks that the value is a string and can be parsed into a valid Date object.
     * 
     * @param message - Optional custom error message
     * @returns This validator instance for method chaining
     * 
     * @example
     * ```typescript
     * const dateValidator = new Validator<string>('createdAt')
     *   .isISODate();
     * 
     * dateValidator.validate('2024-01-15T10:30:00Z'); // Valid
     * dateValidator.validate('invalid-date'); // Invalid
     * ```
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
     * 
     * @param message - Optional custom error message
     * @returns This validator instance for method chaining
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
     * 
     * Runs all validation rules in the order they were added.
     * Collects all validation errors (does not stop at first error).
     * 
     * @param value - The value to validate
     * @returns ValidationResult containing validation status and any errors
     * 
     * @example
     * ```typescript
     * const validator = new Validator<string>('title')
     *   .required()
     *   .maxLength(200);
     * 
     * const result = validator.validate('My Todo');
     * if (!result.isValid) {
     *   result.errors.forEach(error => {
     *     console.error(`${error.field}: ${error.message}`);
     *   });
     * }
     * ```
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
 * Combine multiple validation results into a single result
 * 
 * This utility function is useful when validating multiple fields
 * and you want to collect all validation errors in a single result.
 * 
 * @param results - Variable number of ValidationResult objects to combine
 * @returns A single ValidationResult containing all errors from all inputs
 * 
 * @example
 * ```typescript
 * // Validate multiple fields at once
 * const result = combineValidationResults(
 *   validateTitle(input.title),
 *   validatePriority(input.priority),
 *   validateTags(input.tags)
 * );
 * 
 * if (!result.isValid) {
 *   // All validation errors are collected here
 *   throw new ValidationError('Input validation failed', result.errors);
 * }
 * ```
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

/**
 * Conditionally validate a value if it is defined
 * 
 * This helper function is particularly useful for validating optional fields.
 * If the value is undefined, it returns a valid result (no errors).
 * If the value is defined, it runs the provided validator function.
 * 
 * This allows you to use the same validator for both required and optional fields
 * without duplicating validation logic.
 * 
 * @template T - The type of value being validated
 * @param value - The value to validate (may be undefined)
 * @param validator - The validation function to run if value is defined
 * @returns ValidationResult - Valid if undefined, otherwise the result of the validator
 * 
 * @example
 * ```typescript
 * // Validate optional fields in an update input
 * const result = combineValidationResults(
 *   validateIfDefined(input.title, validateTitle),
 *   validateIfDefined(input.priority, validatePriority),
 *   validateIfDefined(input.tags, validateTags)
 * );
 * 
 * // If input.title is undefined, it's considered valid
 * // If input.title is defined, validateTitle is called
 * ```
 */
export function validateIfDefined<T>(
    value: T | undefined,
    validator: (value: T) => ValidationResult
): ValidationResult {
    if (value === undefined) {
        return { isValid: true, errors: [] };
    }
    return validator(value);
}

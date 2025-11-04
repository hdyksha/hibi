/**
 * User-friendly error message utilities
 * Maps technical error messages to user-friendly ones
 * Requirements: 全般 - ユーザーフレンドリーなエラー表示
 */

export interface ErrorMessageMapping {
  pattern: RegExp | string;
  message: string;
  action?: string;
}

/**
 * User-friendly error message mappings
 * Maps common error patterns to user-friendly messages
 */
export const ERROR_MESSAGE_MAPPINGS: ErrorMessageMapping[] = [
  // Network errors
  {
    pattern: /network error|unable to connect|failed to fetch|connection/i,
    message: 'Unable to connect to the server. Please check your internet connection.',
    action: 'Try again'
  },
  {
    pattern: /timeout|timed out/i,
    message: 'The request took too long to complete. Please try again.',
    action: 'Retry'
  },
  
  // Server errors (5xx)
  {
    pattern: /server error|internal server error|500/i,
    message: 'Something went wrong on our end. Please try again in a moment.',
    action: 'Try again'
  },
  {
    pattern: /service unavailable|503/i,
    message: 'The service is temporarily unavailable. Please try again later.',
    action: 'Try again'
  },
  {
    pattern: /bad gateway|502/i,
    message: 'There was a problem connecting to the server. Please try again.',
    action: 'Try again'
  },
  
  // Validation errors (4xx)
  {
    pattern: /title.*required|title.*empty/i,
    message: 'Please enter a title for your task.',
    action: undefined
  },
  {
    pattern: /title.*too long|title.*200/i,
    message: 'The title is too long. Please keep it under 200 characters.',
    action: undefined
  },
  {
    pattern: /invalid.*priority/i,
    message: 'Please select a valid priority level.',
    action: undefined
  },
  {
    pattern: /invalid.*tag/i,
    message: 'One or more tags contain invalid characters. Please use only letters, numbers, and hyphens.',
    action: undefined
  },
  
  // Not found errors
  {
    pattern: /not found|404/i,
    message: 'The requested item could not be found. It may have been deleted.',
    action: 'Refresh'
  },
  
  // Permission errors
  {
    pattern: /unauthorized|401/i,
    message: 'You are not authorized to perform this action.',
    action: undefined
  },
  {
    pattern: /forbidden|403/i,
    message: 'You do not have permission to perform this action.',
    action: undefined
  },
  
  // Data errors
  {
    pattern: /json|parse|syntax/i,
    message: 'There was a problem processing the data. Please try again.',
    action: 'Try again'
  },
  
  // Todo-specific errors
  {
    pattern: /todo.*not found/i,
    message: 'This task could not be found. It may have been deleted by another user.',
    action: 'Refresh'
  },
  {
    pattern: /failed to create.*todo/i,
    message: 'Unable to create the task. Please check your input and try again.',
    action: 'Try again'
  },
  {
    pattern: /failed to update.*todo/i,
    message: 'Unable to update the task. Please try again.',
    action: 'Try again'
  },
  {
    pattern: /failed to delete.*todo/i,
    message: 'Unable to delete the task. Please try again.',
    action: 'Try again'
  },
  {
    pattern: /failed to toggle.*completion/i,
    message: 'Unable to update the task status. Please try again.',
    action: 'Try again'
  }
];

/**
 * Default fallback messages for different error types
 */
export const DEFAULT_ERROR_MESSAGES = {
  network: 'Connection problem. Please check your internet and try again.',
  validation: 'Please check your input and try again.',
  server: 'Something went wrong. Please try again in a moment.',
  unknown: 'An unexpected error occurred. Please try again.'
} as const;

/**
 * Convert technical error message to user-friendly message
 */
export function getUserFriendlyErrorMessage(
  error: string | Error,
  errorType?: 'network' | 'validation' | 'server' | 'unknown'
): { message: string; action?: string } {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Try to find a matching pattern
  for (const mapping of ERROR_MESSAGE_MAPPINGS) {
    const pattern = mapping.pattern;
    const matches = typeof pattern === 'string' 
      ? errorMessage.includes(pattern)
      : pattern.test(errorMessage);
      
    if (matches) {
      return {
        message: mapping.message,
        action: mapping.action
      };
    }
  }
  
  // Fall back to default message based on error type
  if (errorType && errorType in DEFAULT_ERROR_MESSAGES) {
    const defaultMessage = DEFAULT_ERROR_MESSAGES[errorType];
    return {
      message: defaultMessage,
      action: errorType === 'validation' ? undefined : 'Try again'
    };
  }
  
  // Ultimate fallback
  return {
    message: DEFAULT_ERROR_MESSAGES.unknown,
    action: 'Try again'
  };
}

/**
 * Get contextual error message based on the operation being performed
 */
export function getContextualErrorMessage(
  error: string | Error,
  context: 'create' | 'update' | 'delete' | 'fetch' | 'toggle',
  errorType?: 'network' | 'validation' | 'server' | 'unknown'
): { message: string; action?: string } {
  const baseResult = getUserFriendlyErrorMessage(error, errorType);
  
  // Add context-specific messaging if using default messages
  if (baseResult.message === DEFAULT_ERROR_MESSAGES.unknown) {
    const contextMessages = {
      create: 'Unable to create the task. Please try again.',
      update: 'Unable to update the task. Please try again.',
      delete: 'Unable to delete the task. Please try again.',
      fetch: 'Unable to load tasks. Please try again.',
      toggle: 'Unable to update task status. Please try again.'
    };
    
    return {
      message: contextMessages[context],
      action: 'Try again'
    };
  }
  
  return baseResult;
}
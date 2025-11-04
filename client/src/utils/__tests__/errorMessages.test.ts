/**
 * Error Messages Utility Tests
 * Tests for user-friendly error message mapping functionality
 */

import { describe, it, expect } from 'vitest';
import { 
  getUserFriendlyErrorMessage, 
  getContextualErrorMessage,
  ERROR_MESSAGE_MAPPINGS,
  DEFAULT_ERROR_MESSAGES
} from '../errorMessages';

describe('getUserFriendlyErrorMessage', () => {
  it('maps network errors to user-friendly messages', () => {
    const result = getUserFriendlyErrorMessage('Network error: Unable to connect');
    expect(result.message).toBe('Unable to connect to the server. Please check your internet connection.');
    expect(result.action).toBe('Try again');
  });

  it('maps timeout errors to user-friendly messages', () => {
    const result = getUserFriendlyErrorMessage('Request timed out');
    expect(result.message).toBe('The request took too long to complete. Please try again.');
    expect(result.action).toBe('Retry');
  });

  it('maps server errors to user-friendly messages', () => {
    const result = getUserFriendlyErrorMessage('Internal server error');
    expect(result.message).toBe('Something went wrong on our end. Please try again in a moment.');
    expect(result.action).toBe('Try again');
  });

  it('maps validation errors to user-friendly messages', () => {
    const result = getUserFriendlyErrorMessage('Title is required');
    expect(result.message).toBe('Please enter a title for your task.');
    expect(result.action).toBeUndefined();
  });

  it('maps title length errors to user-friendly messages', () => {
    const result = getUserFriendlyErrorMessage('Title must be 200 characters or less');
    expect(result.message).toBe('The title is too long. Please keep it under 200 characters.');
    expect(result.action).toBeUndefined();
  });

  it('maps not found errors to user-friendly messages', () => {
    const result = getUserFriendlyErrorMessage('Todo not found');
    expect(result.message).toBe('The requested item could not be found. It may have been deleted.');
    expect(result.action).toBe('Refresh');
  });

  it('uses error type for default messages when no pattern matches', () => {
    const result = getUserFriendlyErrorMessage('Unknown error', 'network');
    expect(result.message).toBe(DEFAULT_ERROR_MESSAGES.network);
    expect(result.action).toBe('Try again');
  });

  it('uses validation error type without retry action', () => {
    const result = getUserFriendlyErrorMessage('Unknown validation error', 'validation');
    expect(result.message).toBe(DEFAULT_ERROR_MESSAGES.validation);
    expect(result.action).toBeUndefined();
  });

  it('falls back to unknown error message', () => {
    const result = getUserFriendlyErrorMessage('Completely unknown error');
    expect(result.message).toBe(DEFAULT_ERROR_MESSAGES.unknown);
    expect(result.action).toBe('Try again');
  });

  it('handles Error objects', () => {
    const error = new Error('Network error occurred');
    const result = getUserFriendlyErrorMessage(error);
    expect(result.message).toBe('Unable to connect to the server. Please check your internet connection.');
    expect(result.action).toBe('Try again');
  });

  it('handles case-insensitive matching', () => {
    const result = getUserFriendlyErrorMessage('NETWORK ERROR');
    expect(result.message).toBe('Unable to connect to the server. Please check your internet connection.');
  });
});

describe('getContextualErrorMessage', () => {
  it('provides contextual message for create operations', () => {
    const result = getContextualErrorMessage('Unknown error', 'create');
    expect(result.message).toBe('Unable to create the task. Please try again.');
    expect(result.action).toBe('Try again');
  });

  it('provides contextual message for update operations', () => {
    const result = getContextualErrorMessage('Unknown error', 'update');
    expect(result.message).toBe('Unable to update the task. Please try again.');
    expect(result.action).toBe('Try again');
  });

  it('provides contextual message for delete operations', () => {
    const result = getContextualErrorMessage('Unknown error', 'delete');
    expect(result.message).toBe('Unable to delete the task. Please try again.');
    expect(result.action).toBe('Try again');
  });

  it('provides contextual message for fetch operations', () => {
    const result = getContextualErrorMessage('Unknown error', 'fetch');
    expect(result.message).toBe('Unable to load tasks. Please try again.');
    expect(result.action).toBe('Try again');
  });

  it('provides contextual message for toggle operations', () => {
    const result = getContextualErrorMessage('Unknown error', 'toggle');
    expect(result.message).toBe('Unable to update task status. Please try again.');
    expect(result.action).toBe('Try again');
  });

  it('uses pattern matching over context when pattern matches', () => {
    const result = getContextualErrorMessage('Network error', 'create');
    expect(result.message).toBe('Unable to connect to the server. Please check your internet connection.');
    expect(result.action).toBe('Try again');
  });

  it('respects error type parameter', () => {
    const result = getContextualErrorMessage('Unknown error', 'create', 'validation');
    expect(result.message).toBe('Please check your input and try again.');
    expect(result.action).toBeUndefined();
  });
});

describe('ERROR_MESSAGE_MAPPINGS', () => {
  it('contains mappings for common error patterns', () => {
    expect(ERROR_MESSAGE_MAPPINGS.length).toBeGreaterThan(0);
    
    // Check that all mappings have required properties
    ERROR_MESSAGE_MAPPINGS.forEach(mapping => {
      expect(mapping.pattern).toBeDefined();
      expect(mapping.message).toBeDefined();
      expect(typeof mapping.message).toBe('string');
      expect(mapping.message.length).toBeGreaterThan(0);
    });
  });

  it('has network error patterns', () => {
    const networkMappings = ERROR_MESSAGE_MAPPINGS.filter(m => 
      m.message.toLowerCase().includes('connect') || 
      m.message.toLowerCase().includes('internet')
    );
    expect(networkMappings.length).toBeGreaterThan(0);
  });

  it('has validation error patterns', () => {
    const validationMappings = ERROR_MESSAGE_MAPPINGS.filter(m => 
      m.message.toLowerCase().includes('title') || 
      m.message.toLowerCase().includes('input')
    );
    expect(validationMappings.length).toBeGreaterThan(0);
  });
});

describe('DEFAULT_ERROR_MESSAGES', () => {
  it('contains all required error types', () => {
    expect(DEFAULT_ERROR_MESSAGES.network).toBeDefined();
    expect(DEFAULT_ERROR_MESSAGES.validation).toBeDefined();
    expect(DEFAULT_ERROR_MESSAGES.server).toBeDefined();
    expect(DEFAULT_ERROR_MESSAGES.unknown).toBeDefined();
  });

  it('has non-empty messages', () => {
    Object.values(DEFAULT_ERROR_MESSAGES).forEach(message => {
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
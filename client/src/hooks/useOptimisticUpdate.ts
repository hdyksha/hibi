/**
 * Custom hook for optimistic UI updates
 * 
 * Provides immediate UI feedback by updating state before API confirmation,
 * with automatic rollback on failure. This reduces perceived latency and
 * creates a more responsive user experience.
 * 
 * Requirements: 1.1, 1.2, 1.3
 * - 1.1: Display updates immediately before API call completes
 * - 1.2: Remove optimistic updates and show error on API failure
 * - 1.3: Display visual indicator during pending state
 */

import { useState, useCallback } from 'react';

/**
 * Options for configuring optimistic update behavior
 */
export interface OptimisticUpdateOptions<T> {
  /** Callback invoked when the API call succeeds */
  onSuccess?: (data: T) => void;
  /** Callback invoked when the API call fails */
  onError?: (error: Error) => void;
  /** Delay in milliseconds before rolling back on error (default: 0) */
  rollbackDelay?: number;
}

/**
 * Return type for useOptimisticUpdate hook
 */
export interface UseOptimisticUpdateReturn<T> {
  /** The current optimistic state value, null if no optimistic update is active */
  optimisticState: T | null;
  /** Whether an optimistic update is currently pending API confirmation */
  isPending: boolean;
  /** Execute an optimistic update with automatic rollback on failure */
  execute: (
    optimisticValue: T,
    apiCall: () => Promise<T>,
    options?: OptimisticUpdateOptions<T>
  ) => Promise<T>;
  /** Manually clear the optimistic state */
  clear: () => void;
}

/**
 * Hook for managing optimistic UI updates
 * 
 * This hook implements the optimistic UI pattern where the interface is updated
 * immediately before server confirmation. If the server request fails, the
 * optimistic update is automatically rolled back.
 * 
 * @template T - The type of data being optimistically updated
 * @returns {UseOptimisticUpdateReturn<T>} Optimistic state and control functions
 * 
 * @example
 * ```tsx
 * const { optimisticState, isPending, execute } = useOptimisticUpdate<TodoItem>();
 * 
 * const handleAddTodo = async (newTodo: TodoItem) => {
 *   try {
 *     await execute(
 *       newTodo,
 *       () => todoApi.createTodo(newTodo),
 *       {
 *         onSuccess: (todo) => console.log('Todo created:', todo),
 *         onError: (error) => showError(error.message),
 *         rollbackDelay: 300
 *       }
 *     );
 *   } catch (error) {
 *     // Error already handled by hook
 *   }
 * };
 * ```
 */
export const useOptimisticUpdate = <T>(): UseOptimisticUpdateReturn<T> => {
  const [optimisticState, setOptimisticState] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(false);

  /**
   * Execute an optimistic update
   * 
   * @param optimisticValue - The value to display immediately
   * @param apiCall - The async function that performs the actual API call
   * @param options - Configuration options for success/error handling
   * @returns Promise that resolves with the API response
   * @throws Re-throws the error after handling rollback
   */
  const execute = useCallback(
    async (
      optimisticValue: T,
      apiCall: () => Promise<T>,
      options?: OptimisticUpdateOptions<T>
    ): Promise<T> => {
      // Set optimistic state immediately for instant UI feedback
      setOptimisticState(optimisticValue);
      setIsPending(true);

      try {
        // Execute the actual API call
        const result = await apiCall();
        
        // Success: clear optimistic state and mark as no longer pending
        setOptimisticState(null);
        setIsPending(false);
        
        // Invoke success callback if provided
        options?.onSuccess?.(result);
        
        return result;
      } catch (error) {
        // Failure: rollback optimistic update
        const rollbackDelay = options?.rollbackDelay ?? 0;
        
        if (rollbackDelay > 0) {
          // Delayed rollback allows user to see the error state briefly
          setTimeout(() => {
            setOptimisticState(null);
            setIsPending(false);
          }, rollbackDelay);
        } else {
          // Immediate rollback
          setOptimisticState(null);
          setIsPending(false);
        }
        
        // Invoke error callback if provided
        const normalizedError = error instanceof Error ? error : new Error('Operation failed');
        options?.onError?.(normalizedError);
        
        // Re-throw to allow caller to handle the error
        throw normalizedError;
      }
    },
    []
  );

  /**
   * Manually clear the optimistic state
   * Useful for cleanup or cancellation scenarios
   */
  const clear = useCallback(() => {
    setOptimisticState(null);
    setIsPending(false);
  }, []);

  return {
    optimisticState,
    isPending,
    execute,
    clear,
  };
};

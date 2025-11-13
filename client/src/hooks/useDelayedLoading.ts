import { useState, useEffect, useRef } from 'react';
import { LOADING_DELAY } from '../utils/animations';

/**
 * Configuration options for the delayed loading hook
 */
interface DelayedLoadingOptions {
  /** Delay in milliseconds before showing the loading indicator (default: 200ms) */
  delay?: number;
  /** Minimum time in milliseconds to display the loading indicator once shown (default: 300ms) */
  minDisplayTime?: number;
}

/**
 * Custom hook that delays showing a loading indicator and ensures minimum display time.
 * 
 * This prevents flickering for fast operations while providing consistent feedback
 * for slower operations. The loading indicator will only appear if the operation
 * takes longer than the specified delay, and once shown, will remain visible for
 * at least the minimum display time.
 * 
 * @param isLoading - Boolean indicating if the operation is in progress
 * @param options - Configuration options for delay and minimum display time
 * @returns Boolean indicating whether to show the loading indicator
 * 
 * @example
 * ```tsx
 * const { isLoading } = useTodos();
 * const showLoading = useDelayedLoading(isLoading, { delay: 200, minDisplayTime: 300 });
 * 
 * return showLoading ? <LoadingSpinner /> : <TodoList />;
 * ```
 */
export function useDelayedLoading(
  isLoading: boolean,
  options: DelayedLoadingOptions = {}
): boolean {
  const [showLoading, setShowLoading] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minDisplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const delay = options.delay ?? LOADING_DELAY.spinner;
  const minDisplayTime = options.minDisplayTime ?? LOADING_DELAY.minDisplay;

  useEffect(() => {
    // Clear any existing timers when isLoading changes
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    if (isLoading && !showLoading) {
      // Start the delay timer before showing loading indicator
      delayTimerRef.current = setTimeout(() => {
        setShowLoading(true);
        loadingStartTimeRef.current = Date.now();
        delayTimerRef.current = null;
      }, delay);
    } else if (!isLoading && showLoading && loadingStartTimeRef.current !== null) {
      // Loading finished - ensure minimum display time
      const elapsed = Date.now() - loadingStartTimeRef.current;
      const remaining = minDisplayTime - elapsed;

      if (remaining > 0) {
        // Need to wait longer to meet minimum display time
        minDisplayTimerRef.current = setTimeout(() => {
          setShowLoading(false);
          loadingStartTimeRef.current = null;
          minDisplayTimerRef.current = null;
        }, remaining);
      } else {
        // Minimum display time already met
        setShowLoading(false);
        loadingStartTimeRef.current = null;
      }
    }

    // Cleanup function to clear timers on unmount or when dependencies change
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      if (minDisplayTimerRef.current) {
        clearTimeout(minDisplayTimerRef.current);
        minDisplayTimerRef.current = null;
      }
    };
  }, [isLoading, delay, minDisplayTime]);

  return showLoading;
}

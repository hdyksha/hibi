/**
 * Centralized animation constants for consistent timing and easing across the application.
 * These values are synchronized with CSS custom properties in index.css.
 */

/**
 * Animation durations in milliseconds
 * Used for JavaScript-controlled animations and timing logic
 */
export const ANIMATION_DURATION = {
  instant: 0,
  fast: 100,
  normal: 150,
  medium: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
} as const;

/**
 * CSS easing function names
 * Used for smooth, natural-feeling transitions
 */
export const ANIMATION_EASING = {
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  linear: 'linear',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Loading indicator timing configuration
 * Prevents flickering for fast operations while providing feedback for slow ones
 */
export const LOADING_DELAY = {
  /** Delay before showing loading spinner (prevents flash for fast operations) */
  spinner: 200,
  /** Minimum time to display spinner once shown (prevents flickering) */
  minDisplay: 300,
} as const;

/**
 * Scroll behavior configuration
 * Used for smooth scrolling and element highlighting
 */
export const SCROLL_CONFIG = {
  /** Duration for smooth scroll animations */
  duration: 400,
  /** Duration for element highlight pulse effect */
  highlightDuration: 500,
} as const;

// Type exports for TypeScript consumers
export type AnimationDurationKey = keyof typeof ANIMATION_DURATION;
export type AnimationEasingKey = keyof typeof ANIMATION_EASING;

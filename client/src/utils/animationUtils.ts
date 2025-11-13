/**
 * Animation utility functions for managing motion preferences and animation behaviors.
 * Provides accessibility-compliant animation helpers that respect user preferences.
 */

import { SCROLL_CONFIG } from './animations';

/**
 * Checks if the user has enabled the "prefers-reduced-motion" system setting.
 * This setting indicates that the user prefers minimal or no animations.
 * 
 * @returns {boolean} True if reduced motion is preferred, false otherwise
 * 
 * @example
 * if (prefersReducedMotion()) {
 *   // Use instant transitions
 * } else {
 *   // Use full animations
 * }
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Adjusts animation duration based on user's motion preference.
 * If reduced motion is preferred, returns a minimal duration (50ms or less).
 * Otherwise, returns the original duration.
 * 
 * @param {number} duration - The desired animation duration in milliseconds
 * @returns {number} The adjusted duration (50ms max if reduced motion is preferred)
 * 
 * @example
 * const duration = getAnimationDuration(300); // Returns 50 if reduced motion, 300 otherwise
 * element.style.transitionDuration = `${duration}ms`;
 */
export function getAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? Math.min(duration, 50) : duration;
}

/**
 * Smoothly scrolls to an element with accessibility support.
 * Respects the user's reduced motion preference by using instant scrolling when preferred.
 * 
 * @param {HTMLElement} element - The element to scroll to
 * @param {ScrollIntoViewOptions} [options] - Additional scroll options (block, inline, etc.)
 * 
 * @example
 * const todoElement = document.getElementById('todo-123');
 * if (todoElement) {
 *   smoothScrollToElement(todoElement, { block: 'center' });
 * }
 */
export function smoothScrollToElement(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
): void {
  if (prefersReducedMotion()) {
    // Use instant scrolling for reduced motion preference
    element.scrollIntoView({ behavior: 'auto', ...options });
  } else {
    // Use smooth scrolling for standard preference
    element.scrollIntoView({ behavior: 'smooth', ...options });
  }
}

/**
 * Temporarily highlights an element by adding a CSS class.
 * The highlight class is automatically removed after the specified duration.
 * Useful for drawing attention to newly added or updated items.
 * 
 * @param {HTMLElement} element - The element to highlight
 * @param {number} [duration] - Duration in milliseconds (defaults to SCROLL_CONFIG.highlightDuration)
 * 
 * @example
 * const newTodo = document.querySelector('[data-todo-id="123"]');
 * if (newTodo instanceof HTMLElement) {
 *   highlightElement(newTodo); // Highlights for 500ms by default
 * }
 */
export function highlightElement(
  element: HTMLElement,
  duration: number = SCROLL_CONFIG.highlightDuration
): void {
  element.classList.add('highlight-pulse');
  
  setTimeout(() => {
    element.classList.remove('highlight-pulse');
  }, duration);
}

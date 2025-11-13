/**
 * Animation Utilities Tests
 * Tests for animation helper functions and accessibility features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  prefersReducedMotion,
  getAnimationDuration,
  smoothScrollToElement,
  highlightElement,
} from '../animationUtils';

describe('animationUtils', () => {
  describe('prefersReducedMotion', () => {
    it('should detect reduced motion preference', () => {
      // Mock matchMedia to return reduced motion preference
      const mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const result = prefersReducedMotion();
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
      expect(result).toBe(true);
    });

    it('should return false when reduced motion is not preferred', () => {
      const mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const result = prefersReducedMotion();
      expect(result).toBe(false);
    });
  });

  describe('getAnimationDuration', () => {
    it('should return reduced duration when reduced motion is preferred', () => {
      const mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      expect(getAnimationDuration(300)).toBe(50);
      expect(getAnimationDuration(100)).toBe(50);
      expect(getAnimationDuration(25)).toBe(25);
    });

    it('should return original duration when reduced motion is not preferred', () => {
      const mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      expect(getAnimationDuration(300)).toBe(300);
      expect(getAnimationDuration(150)).toBe(150);
      expect(getAnimationDuration(500)).toBe(500);
    });
  });

  describe('smoothScrollToElement', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div');
      mockElement.scrollIntoView = vi.fn();
    });

    it('should use auto behavior when reduced motion is preferred', () => {
      const mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      smoothScrollToElement(mockElement);
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    });

    it('should use smooth behavior when reduced motion is not preferred', () => {
      const mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      smoothScrollToElement(mockElement);
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should merge additional options', () => {
      const mockMatchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      smoothScrollToElement(mockElement, { block: 'center', inline: 'nearest' });
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    });
  });

  describe('highlightElement', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = document.createElement('div');
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should add highlight-pulse class to element', () => {
      highlightElement(mockElement);
      expect(mockElement.classList.contains('highlight-pulse')).toBe(true);
    });

    it('should remove highlight-pulse class after default duration', () => {
      highlightElement(mockElement);
      expect(mockElement.classList.contains('highlight-pulse')).toBe(true);
      
      vi.advanceTimersByTime(500);
      expect(mockElement.classList.contains('highlight-pulse')).toBe(false);
    });

    it('should remove highlight-pulse class after custom duration', () => {
      highlightElement(mockElement, 1000);
      expect(mockElement.classList.contains('highlight-pulse')).toBe(true);
      
      vi.advanceTimersByTime(999);
      expect(mockElement.classList.contains('highlight-pulse')).toBe(true);
      
      vi.advanceTimersByTime(1);
      expect(mockElement.classList.contains('highlight-pulse')).toBe(false);
    });
  });
});

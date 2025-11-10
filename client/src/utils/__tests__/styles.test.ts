/**
 * Styling Utilities Tests
 * Tests for common styling utility functions
 */

import { describe, it, expect } from 'vitest';
import { cn, conditionalClass, mergeVariants, responsive } from '../styles';

describe('styles utilities', () => {
  describe('cn (class name combiner)', () => {
    it('should combine multiple class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should filter out falsy values', () => {
      const result = cn('class1', false, 'class2', null, undefined, 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active', 'end');
      expect(result).toBe('base active end');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should normalize multiple spaces', () => {
      const result = cn('class1  class2   class3');
      expect(result).toBe('class1 class2 class3');
    });
  });

  describe('conditionalClass', () => {
    it('should return true classes when condition is true', () => {
      const result = conditionalClass(true, 'active-class', 'inactive-class');
      expect(result).toBe('active-class');
    });

    it('should return false classes when condition is false', () => {
      const result = conditionalClass(false, 'active-class', 'inactive-class');
      expect(result).toBe('inactive-class');
    });

    it('should return empty string when condition is false and no false classes provided', () => {
      const result = conditionalClass(false, 'active-class');
      expect(result).toBe('');
    });
  });

  describe('mergeVariants', () => {
    it('should merge base, variant, and additional classes', () => {
      const variants = {
        primary: 'bg-blue-600',
        secondary: 'bg-slate-200',
      };
      const result = mergeVariants('btn', variants, 'primary', 'mt-4');
      expect(result).toBe('btn bg-blue-600 mt-4');
    });

    it('should work without additional classes', () => {
      const variants = {
        primary: 'bg-blue-600',
        secondary: 'bg-slate-200',
      };
      const result = mergeVariants('btn', variants, 'secondary');
      expect(result).toBe('btn bg-slate-200');
    });
  });

  describe('responsive', () => {
    it('should combine responsive classes', () => {
      const result = responsive('text-sm', 'sm:text-base', 'lg:text-lg');
      expect(result).toBe('text-sm sm:text-base lg:text-lg');
    });

    it('should work with only mobile classes', () => {
      const result = responsive('text-sm');
      expect(result).toBe('text-sm');
    });

    it('should work with mobile and tablet classes', () => {
      const result = responsive('text-sm', 'sm:text-base');
      expect(result).toBe('text-sm sm:text-base');
    });
  });
});

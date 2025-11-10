/**
 * Styling Utilities
 * Common style constants and utility functions for consistent styling across the application
 * Requirements: 1.1, 3.1, 12.1
 */

/**
 * Common color palette used throughout the application
 */
export const colors = {
  // Primary colors
  primary: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    800: 'bg-blue-800',
  },
  // Secondary/Neutral colors
  slate: {
    50: 'bg-slate-50',
    100: 'bg-slate-100',
    200: 'bg-slate-200',
    300: 'bg-slate-300',
    400: 'bg-slate-400',
    500: 'bg-slate-500',
    600: 'bg-slate-600',
    700: 'bg-slate-700',
    800: 'bg-slate-800',
  },
  // Success colors
  success: {
    50: 'bg-green-50',
    100: 'bg-green-100',
    200: 'bg-green-200',
    500: 'bg-green-500',
    600: 'bg-green-600',
    700: 'bg-green-700',
    800: 'bg-green-800',
  },
  // Danger/Error colors
  danger: {
    50: 'bg-red-50',
    100: 'bg-red-100',
    200: 'bg-red-200',
    300: 'bg-red-300',
    500: 'bg-red-500',
    600: 'bg-red-600',
    700: 'bg-red-700',
    800: 'bg-red-800',
  },
} as const;

/**
 * Common text color classes
 */
export const textColors = {
  primary: 'text-blue-600',
  secondary: 'text-slate-700',
  muted: 'text-slate-600',
  disabled: 'text-slate-400',
  success: 'text-green-600',
  error: 'text-red-600',
  white: 'text-white',
} as const;

/**
 * Common border color classes
 */
export const borderColors = {
  default: 'border-slate-300',
  hover: 'hover:border-slate-400',
  focus: 'focus:border-blue-500',
  error: 'border-red-300',
  success: 'border-green-200',
} as const;

/**
 * Common spacing values
 */
export const spacing = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const;

/**
 * Common border radius values
 */
export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
} as const;

/**
 * Common shadow values
 */
export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
} as const;

/**
 * Common transition classes
 */
export const transitions = {
  default: 'transition-all duration-200',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-300',
  colors: 'transition-colors duration-200',
} as const;

/**
 * Common focus ring styles
 */
export const focusRing = {
  primary: 'focus:outline-none focus:ring-2 focus:ring-blue-500/25',
  error: 'focus:outline-none focus:ring-2 focus:ring-red-500/25',
  success: 'focus:outline-none focus:ring-2 focus:ring-green-500/50',
} as const;

/**
 * Common button base styles
 */
export const buttonBase = 'font-medium rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 border';

/**
 * Common input base styles
 */
export const inputBase = 'rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2';

/**
 * Common card styles
 */
export const card = {
  base: 'border border-slate-200 rounded-lg bg-white',
  hover: 'hover:shadow-md transition-shadow duration-200',
  padding: 'p-4',
} as const;

/**
 * Common container styles
 */
export const container = {
  base: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  narrow: 'max-w-4xl mx-auto px-4 sm:px-6',
  wide: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',
} as const;

/**
 * Common flex utilities
 */
export const flex = {
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  start: 'flex items-start',
  end: 'flex items-end',
  col: 'flex flex-col',
  colCenter: 'flex flex-col items-center justify-center',
} as const;

/**
 * Common text styles
 */
export const text = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
} as const;

/**
 * Common font weights
 */
export const fontWeight = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

/**
 * Utility function to combine multiple class names
 * Filters out falsy values and trims whitespace
 * 
 * @param classes - Array of class names or conditional class names
 * @returns Combined class name string
 * 
 * @example
 * cn('base-class', isActive && 'active-class', 'another-class')
 * // Returns: 'base-class active-class another-class' (if isActive is true)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim()
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

/**
 * Utility function to conditionally apply classes based on a condition
 * 
 * @param condition - Boolean condition
 * @param trueClasses - Classes to apply when condition is true
 * @param falseClasses - Classes to apply when condition is false
 * @returns Class name string based on condition
 * 
 * @example
 * conditionalClass(isActive, 'bg-blue-600', 'bg-slate-200')
 * // Returns: 'bg-blue-600' if isActive is true, 'bg-slate-200' otherwise
 */
export function conditionalClass(
  condition: boolean,
  trueClasses: string,
  falseClasses: string = ''
): string {
  return condition ? trueClasses : falseClasses;
}

/**
 * Utility function to merge variant styles with base styles
 * Useful for component styling with multiple variants
 * 
 * @param base - Base classes applied to all variants
 * @param variants - Object mapping variant names to their classes
 * @param selectedVariant - The currently selected variant
 * @param additional - Additional classes to append
 * @returns Combined class name string
 * 
 * @example
 * mergeVariants('btn', { primary: 'bg-blue-600', secondary: 'bg-slate-200' }, 'primary', 'mt-4')
 * // Returns: 'btn bg-blue-600 mt-4'
 */
export function mergeVariants<T extends string>(
  base: string,
  variants: Record<T, string>,
  selectedVariant: T,
  additional: string = ''
): string {
  return cn(base, variants[selectedVariant], additional);
}

/**
 * Utility function to generate responsive classes
 * 
 * @param mobile - Classes for mobile
 * @param tablet - Classes for tablet (sm breakpoint)
 * @param desktop - Classes for desktop (lg breakpoint)
 * @returns Combined responsive class string
 * 
 * @example
 * responsive('text-sm', 'sm:text-base', 'lg:text-lg')
 * // Returns: 'text-sm sm:text-base lg:text-lg'
 */
export function responsive(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  return cn(mobile, tablet, desktop);
}

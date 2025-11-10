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

/**
 * TodoItem specific styles
 */
export const todoItem = {
  // Container styles
  container: cn(
    'group relative bg-white/95 backdrop-blur-xl rounded-lg shadow-md',
    'border border-slate-200/50 p-3 sm:p-5',
    'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
    'animate-fade-in-up'
  ),
  containerCompleted: 'opacity-70 bg-slate-50/80',
  
  // Checkbox/Toggle button styles
  checkbox: {
    base: cn(
      'flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2',
      'transition-all duration-200 flex items-center justify-center',
      'text-xs font-bold min-h-[44px] sm:min-h-0'
    ),
    completed: 'bg-slate-600 border-slate-600 text-white shadow-md',
    uncompleted: cn(
      'border-slate-300 hover:border-slate-500',
      'hover:bg-slate-50 active:bg-slate-100'
    ),
  },
  
  // Title styles
  title: {
    base: 'text-base sm:text-lg font-medium leading-tight flex-1',
    completed: 'line-through text-slate-500',
    uncompleted: 'text-slate-800',
  },
  
  // Priority badge styles
  priorityBadge: {
    base: cn(
      'self-start px-2 sm:px-3 py-1 rounded-md',
      'text-xs font-medium uppercase tracking-wide border'
    ),
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  },
  
  // Tag styles
  tag: cn(
    'px-2 sm:px-3 py-1 bg-slate-100 text-slate-700',
    'rounded-md text-xs font-medium border border-slate-200'
  ),
  
  // Memo button styles
  memoButton: cn(
    'flex items-center space-x-2 px-3 py-2',
    'bg-slate-100 hover:bg-slate-200 active:bg-slate-300',
    'rounded-md text-sm text-slate-600',
    'transition-colors duration-200 min-h-[44px] sm:min-h-0'
  ),
  
  // Memo content styles
  memoContent: cn(
    'mt-2 sm:mt-3 p-3 sm:p-4',
    'bg-slate-50 rounded-lg border border-slate-200'
  ),
  
  // Action button styles
  actionButton: {
    base: cn(
      'p-2 rounded-md transition-colors duration-200',
      'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0',
      'flex items-center justify-center'
    ),
    edit: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    delete: 'text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100',
  },
  
  // Metadata styles
  metadata: {
    container: cn(
      'overflow-hidden transition-all duration-200',
      'max-h-0 group-hover:max-h-16 sm:group-hover:max-h-10',
      'opacity-0 group-hover:opacity-100'
    ),
    text: 'flex items-center space-x-1',
    icon: 'w-3 h-3',
  },
  
  // Layout utilities
  layout: {
    headerContainer: 'flex items-start space-x-3 sm:space-x-4',
    headerContent: 'flex-1 min-w-0',
    headerRow: cn(
      'flex flex-col sm:flex-row sm:items-start sm:justify-between',
      'mb-2 sm:mb-3 gap-2'
    ),
    contentMargin: 'ml-10 sm:ml-10',
    tagsContainer: 'flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3',
    actionsContainer: cn(
      'flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
      'transition-opacity duration-200'
    ),
    actionsButtons: 'flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2',
    metadataList: cn(
      'flex flex-col sm:flex-row sm:items-center sm:space-x-4',
      'space-y-1 sm:space-y-0 text-xs text-slate-500'
    ),
  },
  
  // Transition effects
  transitions: {
    memoReveal: cn(
      'overflow-hidden transition-all duration-200',
      'group-hover:mb-2 sm:group-hover:mb-3',
      'max-h-0 group-hover:max-h-96',
      'opacity-0 group-hover:opacity-100'
    ),
  },
} as const;

/**
 * Input Component
 * Reusable input component with error states and accessibility features
 * Requirements: 1.1, 5.1, 12.1
 */

import React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  error?: string;
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      error,
      fullWidth = false,
      label,
      helperText,
      disabled = false,
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    // Base styles applied to all inputs
    const baseStyles = 'rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2';

    // Error state styles
    const errorStyles = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/25'
      : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-blue-500/25';

    // Disabled state styles
    const disabledStyles = disabled
      ? 'bg-slate-50 cursor-not-allowed opacity-60'
      : 'bg-white';

    // Size styles
    const sizeStyles: Record<InputSize, string> = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-3 sm:px-4 py-3 text-sm sm:text-base min-h-[48px]',
      lg: 'px-4 py-4 text-base min-h-[52px]',
    };

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    const combinedClassName = `${baseStyles} ${errorStyles} ${disabledStyles} ${sizeStyles[size]} ${widthStyles} ${className}`.trim();

    // Label styles
    const labelStyles = 'block text-sm font-medium text-slate-700 mb-2';

    // Helper/Error text styles
    const helperTextStyles = 'mt-1 text-sm';
    const errorTextStyles = 'text-red-600';
    const normalHelperTextStyles = 'text-slate-600';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
            {required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={combinedClassName}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className={`${helperTextStyles} ${errorTextStyles}`} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className={`${helperTextStyles} ${normalHelperTextStyles}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Button Component
 * Reusable button component with multiple variants and states
 * Requirements: 1.1, 5.1, 12.1
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  // Base styles applied to all buttons
  const baseStyles = 'font-medium rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 border';

  // Variant styles
  const variantStyles: Record<ButtonVariant, string> = {
    primary: disabled
      ? 'bg-slate-400 text-white border-slate-400 cursor-not-allowed opacity-60'
      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:ring-blue-500/50 active:bg-blue-800',
    secondary: disabled
      ? 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed opacity-60'
      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-blue-500/25 active:bg-slate-100',
    danger: disabled
      ? 'bg-slate-400 text-white border-slate-400 cursor-not-allowed opacity-60'
      : 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:ring-red-500/50 active:bg-red-800',
    ghost: disabled
      ? 'bg-transparent text-slate-400 border-transparent cursor-not-allowed opacity-60'
      : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-700 focus:ring-blue-500/25 active:bg-slate-200',
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-sm sm:text-base min-h-[48px]',
    lg: 'px-8 py-4 text-base sm:text-lg min-h-[52px]',
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : 'w-full sm:w-auto';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

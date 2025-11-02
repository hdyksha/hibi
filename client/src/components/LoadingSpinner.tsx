/**
 * LoadingSpinner Component
 * Reusable loading spinner with Tailwind CSS styling
 * Requirements: 全般 - ローディング状態の表示
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-6 sm:py-8 ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3`}
        role="status"
        aria-label="Loading"
      />
      <p className={`text-slate-600 ${textSizeClasses[size]} font-medium`}>
        {message}
      </p>
    </div>
  );
};

interface InlineLoadingSpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

export const InlineLoadingSpinner: React.FC<InlineLoadingSpinnerProps> = ({ 
  size = 'sm', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2'
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-slate-200 border-t-blue-600 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};
/**
 * ErrorMessage Component
 * Reusable error message display with Tailwind CSS styling
 * Requirements: 全般 - エラー状態の表示
 */

import React from 'react';

/**
 * Props for ErrorMessage component
 */
interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Optional callback function for retry action */
  onRetry?: () => void;
  /** Label for the retry button */
  retryLabel?: string;
  /** Visual variant of the error message */
  variant?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryLabel = 'Retry',
  variant = 'default',
  className = ''
}) => {
  const isCompact = variant === 'compact';

  return (
    <div className={`${isCompact ? 'p-3' : 'py-6 sm:py-8'} ${className}`}>
      <div className={`bg-red-50 border border-red-200 rounded-lg ${isCompact ? 'p-3' : 'p-4 sm:p-6'} transition-all duration-200`}>
        <div className="flex items-start gap-3">
          {/* Error Icon */}
          <div className="flex-shrink-0">
            <svg 
              className="w-5 h-5 text-red-500 mt-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          {/* Error Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-red-700 ${isCompact ? 'text-sm' : 'text-sm sm:text-base'} break-words font-semibold`}>
              Error: {message}
            </p>
            
            {onRetry && (
              <button
                onClick={onRetry}
                className={`mt-3 px-4 py-2 bg-red-600 text-white border-none rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-red-700 hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 active:bg-red-800 ${isCompact ? 'text-sm min-h-[36px]' : 'text-sm sm:text-base min-h-[44px]'}`}
              >
                {retryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Props for InlineErrorMessage component
 */
interface InlineErrorMessageProps {
  /** Error message to display inline */
  message: string;
  /** Additional CSS classes */
  className?: string;
}

export const InlineErrorMessage: React.FC<InlineErrorMessageProps> = ({
  message,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 text-red-600 text-sm ${className}`} role="alert">
      <svg 
        className="w-4 h-4 flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className="break-words">{message}</span>
    </div>
  );
};
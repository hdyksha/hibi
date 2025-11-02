/**
 * SuccessMessage Component
 * Reusable success message display with Tailwind CSS styling
 * Requirements: 全般 - 成功状態の表示
 */

import React, { useEffect, useState } from 'react';

interface SuccessMessageProps {
  message: string;
  autoHide?: boolean;
  autoHideDelay?: number;
  onHide?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  autoHide = true,
  autoHideDelay = 3000,
  onHide,
  variant = 'default',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const isCompact = variant === 'compact';

  useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onHide?.();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onHide]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${isCompact ? 'p-3' : 'py-4 sm:py-6'} ${className}`}>
      <div className={`bg-green-50 border border-green-200 rounded-lg ${isCompact ? 'p-3' : 'p-4 sm:p-6'} transition-all duration-200 animate-fade-in`}>
        <div className="flex items-start gap-3">
          {/* Success Icon */}
          <div className="flex-shrink-0">
            <svg 
              className="w-5 h-5 text-green-500 mt-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          {/* Success Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-green-800 ${isCompact ? 'text-sm' : 'text-base'} mb-1`}>
              Success
            </h3>
            <p className={`text-green-700 ${isCompact ? 'text-sm' : 'text-sm sm:text-base'} break-words`}>
              {message}
            </p>
          </div>

          {/* Close Button */}
          {!autoHide && (
            <button
              onClick={() => {
                setIsVisible(false);
                onHide?.();
              }}
              className="flex-shrink-0 p-1 text-green-400 hover:text-green-600 transition-colors duration-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              aria-label="Close success message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface InlineSuccessMessageProps {
  message: string;
  className?: string;
}

export const InlineSuccessMessage: React.FC<InlineSuccessMessageProps> = ({
  message,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 text-green-600 text-sm ${className}`} role="status">
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
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className="break-words">{message}</span>
    </div>
  );
};
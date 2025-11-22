import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Close dropdown when pressing Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  const handleThemeSelect = (themeName: string) => {
    setTheme(themeName as any);
    setIsOpen(false);
  };
  
  const handleButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };
  
  const handleMenuItemKeyDown = (event: React.KeyboardEvent, themeName: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeSelect(themeName);
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme selector button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleButtonKeyDown}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Palette icon */}
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => handleThemeSelect(theme.name)}
              onKeyDown={(e) => handleMenuItemKeyDown(e, theme.name)}
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
              role="menuitem"
            >
              <div className="flex items-center space-x-3">
                {/* Color preview 
                    Note: We use inline style here instead of Tailwind classes because we need to display
                    the actual color of each theme dynamically at runtime. Tailwind's arbitrary values
                    are evaluated at build time and cannot use runtime variables. This is different from
                    other components where we use Tailwind classes like 'bg-primary' which reference
                    CSS variables that are updated when the current theme changes.
                */}
                <div
                  className="w-6 h-6 rounded border border-slate-300"
                  style={{ backgroundColor: theme.colors.primary }}
                  aria-hidden="true"
                />
                <span className="text-sm text-slate-700">{theme.displayName}</span>
              </div>
              
              {/* Checkmark for selected theme */}
              {currentTheme === theme.name && (
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

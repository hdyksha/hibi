import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeName, ThemeContextType } from '../types/theme';
import { themes, getThemeByName } from '../utils/themes';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'todo-app-theme';

/**
 * Load theme preference from localStorage
 * Falls back to 'default' if no valid theme is found
 */
const loadThemeFromStorage = (): ThemeName => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && themes.some(t => t.name === saved)) {
      return saved as ThemeName;
    }
  } catch (error) {
    console.error('Failed to load theme from localStorage:', error);
  }
  return 'default';
};

/**
 * Save theme preference to localStorage
 */
const saveThemeToStorage = (themeName: ThemeName): void => {
  try {
    localStorage.setItem(STORAGE_KEY, themeName);
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
};

/**
 * Apply theme colors to DOM by updating CSS variables on :root element
 * Also sets data-theme and data-dark-mode attributes
 */
const applyThemeToDOM = (theme: Theme): void => {
  const root = document.documentElement;
  
  // Update CSS custom properties
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--color-primary-light', theme.colors.primaryLight);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-background-secondary', theme.colors.backgroundSecondary);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--color-border', theme.colors.border);
  
  // Set data attributes for theme name and dark mode flag
  root.setAttribute('data-theme', theme.name);
  root.setAttribute('data-dark-mode', theme.isDark.toString());
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize state with theme from localStorage
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => loadThemeFromStorage());
  
  const currentThemeObject = getThemeByName(currentTheme);
  
  /**
   * Change theme and persist to localStorage
   */
  const setTheme = (themeName: ThemeName): void => {
    setCurrentTheme(themeName);
    const theme = getThemeByName(themeName);
    applyThemeToDOM(theme);
    saveThemeToStorage(themeName);
  };
  
  // Apply initial theme on mount
  useEffect(() => {
    applyThemeToDOM(currentThemeObject);
  }, []);
  
  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes,
    isDarkMode: currentThemeObject.isDark,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access theme context
 * Throws error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export type ThemeName = 'default' | 'blue' | 'green' | 'purple' | 'dark';

export interface Theme {
  name: ThemeName;
  displayName: string;
  isDark: boolean;
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

export interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: Theme[];
  isDarkMode: boolean;
}

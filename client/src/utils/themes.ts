import { Theme, ThemeName } from '../types/theme';

export const themes: Theme[] = [
  {
    name: 'default',
    displayName: 'Default',
    isDark: false,
    colors: {
      primary: '#475569',        // slate-600
      primaryHover: '#334155',   // slate-700
      primaryLight: '#cbd5e1',   // slate-300
      accent: '#64748b',         // slate-500
      background: '#f8fafc',     // slate-50
      backgroundSecondary: '#f1f5f9', // slate-100
      text: '#1e293b',           // slate-800
      textSecondary: '#64748b',  // slate-500
      border: '#e2e8f0',         // slate-200
    },
  },
  {
    name: 'blue',
    displayName: 'Blue',
    isDark: false,
    colors: {
      primary: '#3b82f6',        // blue-500
      primaryHover: '#2563eb',   // blue-600
      primaryLight: '#93c5fd',   // blue-300
      accent: '#60a5fa',         // blue-400
      background: '#eff6ff',     // blue-50
      backgroundSecondary: '#dbeafe', // blue-100
      text: '#1e3a8a',           // blue-900
      textSecondary: '#3b82f6',  // blue-500
      border: '#bfdbfe',         // blue-200
    },
  },
  {
    name: 'green',
    displayName: 'Green',
    isDark: false,
    colors: {
      primary: '#10b981',        // emerald-500
      primaryHover: '#059669',   // emerald-600
      primaryLight: '#6ee7b7',   // emerald-300
      accent: '#34d399',         // emerald-400
      background: '#ecfdf5',     // emerald-50
      backgroundSecondary: '#d1fae5', // emerald-100
      text: '#064e3b',           // emerald-900
      textSecondary: '#10b981',  // emerald-500
      border: '#a7f3d0',         // emerald-200
    },
  },
  {
    name: 'purple',
    displayName: 'Purple',
    isDark: false,
    colors: {
      primary: '#a855f7',        // purple-500
      primaryHover: '#9333ea',   // purple-600
      primaryLight: '#d8b4fe',   // purple-300
      accent: '#c084fc',         // purple-400
      background: '#faf5ff',     // purple-50
      backgroundSecondary: '#f3e8ff', // purple-100
      text: '#581c87',           // purple-900
      textSecondary: '#a855f7',  // purple-500
      border: '#e9d5ff',         // purple-200
    },
  },
  {
    name: 'dark',
    displayName: 'Dark',
    isDark: true,
    colors: {
      primary: '#60a5fa',        // blue-400
      primaryHover: '#3b82f6',   // blue-500
      primaryLight: '#1e3a8a',   // blue-900
      accent: '#93c5fd',         // blue-300
      background: '#111827',     // gray-900
      backgroundSecondary: '#1f2937', // gray-800
      text: '#f9fafb',           // gray-50
      textSecondary: '#d1d5db',  // gray-300
      border: '#374151',         // gray-700
    },
  },
];

export const getThemeByName = (name: ThemeName): Theme => {
  return themes.find(theme => theme.name === name) || themes[0];
};

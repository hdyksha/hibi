# Design Document

## Overview

このデザインドキュメントは、Todo Appにカラーパレット選択機能を追加するための技術的アプローチを説明します。実装は、CSS変数とReact Contextを使用してテーマを動的に切り替え、ローカルストレージで永続化します。既存のコンポーネントへの影響を最小限に抑えながら、5つのテーマプリセットを提供します。

## Architecture

### システム構成

```
App.tsx
  └── ThemeProvider (新規)
        ├── ThemeContext (テーマ状態管理)
        ├── localStorage連携
        └── CSS変数の動的更新
              │
              ├── Header
              │     └── ThemeSelector (新規)
              │           └── ドロップダウンメニュー
              │
              └── その他のコンポーネント
                    └── CSS変数を参照
```

### データフロー

```
ユーザーがテーマ選択
    ↓
ThemeSelector → setTheme()
    ↓
ThemeContext
    ├── ローカルストレージに保存
    ├── CSS変数を更新
    └── 状態を更新
    ↓
全コンポーネントが新しいテーマを反映
```

## Components and Interfaces

### 1. テーマ型定義

```typescript
// client/src/types/theme.ts

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
    card: string;
    cardHover: string;
  };
}

export interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: Theme[];
  isDarkMode: boolean;
}
```

### 2. テーマプリセット定義

```typescript
// client/src/utils/themes.ts

import { Theme, ThemeName } from '../types/theme';

export const themes: Theme[] = [
  {
    name: 'default',
    displayName: 'デフォルト',
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
      card: '#ffffff',           // white
      cardHover: '#f8fafc',      // slate-50
    },
  },
  {
    name: 'blue',
    displayName: 'ブルー',
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
      card: '#ffffff',           // white
      cardHover: '#eff6ff',      // blue-50
    },
  },
  {
    name: 'green',
    displayName: 'グリーン',
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
      card: '#ffffff',           // white
      cardHover: '#ecfdf5',      // emerald-50
    },
  },
  {
    name: 'purple',
    displayName: 'パープル',
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
      card: '#ffffff',           // white
      cardHover: '#faf5ff',      // purple-50
    },
  },
  {
    name: 'dark',
    displayName: 'ダーク',
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
      card: '#1f2937',           // gray-800
      cardHover: '#374151',      // gray-700
    },
  },
];

export const getThemeByName = (name: ThemeName): Theme => {
  return themes.find(theme => theme.name === name) || themes[0];
};
```

### 3. ThemeContext実装

```typescript
// client/src/contexts/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeName, ThemeContextType } from '../types/theme';
import { themes, getThemeByName } from '../utils/themes';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'todo-app-theme';

// CSS変数を更新する関数
const applyThemeToDOM = (theme: Theme): void => {
  const root = document.documentElement;
  
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--color-primary-light', theme.colors.primaryLight);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-background-secondary', theme.colors.backgroundSecondary);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-card', theme.colors.card);
  root.style.setProperty('--color-card-hover', theme.colors.cardHover);
  
  // data属性でテーマ名とダークモードフラグを設定
  root.setAttribute('data-theme', theme.name);
  root.setAttribute('data-dark-mode', theme.isDark.toString());
};

// ローカルストレージからテーマを読み込む
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

// ローカルストレージにテーマを保存する
const saveThemeToStorage = (themeName: ThemeName): void => {
  try {
    localStorage.setItem(STORAGE_KEY, themeName);
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => loadThemeFromStorage());
  
  const currentThemeObject = getThemeByName(currentTheme);
  
  // テーマ変更時の処理
  const setTheme = (themeName: ThemeName): void => {
    setCurrentTheme(themeName);
    const theme = getThemeByName(themeName);
    applyThemeToDOM(theme);
    saveThemeToStorage(themeName);
  };
  
  // 初期テーマの適用
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

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### 4. ThemeSelectorコンポーネント

```typescript
// client/src/components/ThemeSelector.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 外側クリックでドロップダウンを閉じる
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
  
  // Escapeキーでドロップダウンを閉じる
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
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* テーマ選択ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="テーマを選択"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* パレットアイコン */}
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
      
      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => handleThemeSelect(theme.name)}
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
              role="menuitem"
            >
              <div className="flex items-center space-x-3">
                {/* カラープレビュー */}
                <div
                  className="w-6 h-6 rounded border border-slate-300"
                  style={{ backgroundColor: theme.colors.primary }}
                  aria-hidden="true"
                />
                <span className="text-sm text-slate-700">{theme.displayName}</span>
              </div>
              
              {/* 選択中のチェックマーク */}
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
```

### 5. Tailwind設定でCSS変数を統合

Tailwind CSS の設定ファイルで CSS 変数をカラーシステムに統合します。これにより、通常の Tailwind クラス（`bg-primary`、`text-text` など）でテーマカラーを使用できます。

```js
// client/tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // CSS変数をTailwindカラーに統合
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
        },
        accent: 'var(--color-accent)',
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
        },
        border: 'var(--color-border)',
        card: {
          DEFAULT: 'var(--color-card)',
          hover: 'var(--color-card-hover)',
        },
      },
    },
  },
  plugins: [],
};
```

### 6. CSS変数定義

```css
/* client/src/index.css */

:root {
  /* デフォルトのテーマカラー（フォールバック） */
  --color-primary: #475569;
  --color-primary-hover: #334155;
  --color-primary-light: #cbd5e1;
  --color-accent: #64748b;
  --color-background: #f8fafc;
  --color-background-secondary: #f1f5f9;
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-card: #ffffff;
  --color-card-hover: #f8fafc;
}

/* スムーズなテーマ切り替え（特定の要素のみ） */
.theme-transition {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}
```

### 7. 主要コンポーネントへのテーマ適用

Tailwind 設定を更新することで、通常の Tailwind クラスでテーマカラーを使用できます。インラインスタイルは不要です。

```tsx
// App.tsx - Tailwindクラスでテーマカラーを適用

// 背景
<div className="min-h-screen bg-gradient-to-br from-background to-background-secondary theme-transition">

// ヘッダー
<header className="sticky top-0 z-50 backdrop-blur-xl bg-card border-b border-border shadow-sm theme-transition">

// ロゴ
<div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">

// タイトル
<h1 className="text-xl sm:text-2xl font-bold text-text">

// ナビゲーション背景
<nav className="flex space-x-0.5 sm:space-x-1 bg-background-secondary rounded-lg p-0.5 sm:p-1 theme-transition">

// ナビゲーションボタン（アクティブ）
<button className="px-3 sm:px-5 py-2 rounded-md font-medium text-xs sm:text-sm bg-background text-text shadow-sm theme-transition">

// ナビゲーションボタン（非アクティブ）
<button className="px-3 sm:px-5 py-2 rounded-md font-medium text-xs sm:text-sm text-text-secondary hover:text-text hover:bg-background/60 theme-transition">
```

この方法の利点：
- Tailwind の標準的な使い方を維持
- IntelliSense が効く
- コードの可読性と保守性が向上
- インラインスタイル不要
- 既存のコンポーネントも段階的に移行可能

## Implementation Strategy

### Phase 1: 基盤の構築
1. 型定義ファイルの作成（`theme.ts`）
2. テーマプリセットの定義（`themes.ts`）
3. ThemeContextの実装
4. CSS変数の定義

### Phase 2: UI実装
1. ThemeSelectorコンポーネントの作成
2. ドロップダウンメニューのスタイリング
3. アクセシビリティ対応（キーボード操作、ARIA属性）

### Phase 3: 統合とテーマ適用
1. Tailwind設定ファイルの更新（CSS変数の統合）
2. App.tsxへのThemeProvider統合
3. ヘッダーへのThemeSelector配置
4. 主要コンポーネントのTailwindクラス更新（インラインスタイルをTailwindクラスに置き換え）

### Phase 4: テストと調整
1. 各テーマの視覚確認
2. アクセシビリティチェック
3. レスポンシブ対応確認
4. パフォーマンス確認

## Technical Considerations

### パフォーマンス最適化

1. **初期ロード時のちらつき防止**
   - `main.tsx`でThemeProviderをできるだけ早く適用
   - 初回レンダリング前にCSS変数を設定

2. **不要な再レンダリングの防止**
   - ThemeContextの値をメモ化
   - CSS変数の更新は直接DOMを操作

3. **トランジションの最適化**
   - CSS transitionを使用して滑らかな切り替え
   - GPU加速を活用

### アクセシビリティ

1. **キーボード操作**
   - Tab: フォーカス移動
   - Enter/Space: ドロップダウン開閉、テーマ選択
   - Escape: ドロップダウンを閉じる
   - Arrow keys: テーマ間の移動（オプション）

2. **ARIA属性**
   - `aria-label`: ボタンの説明
   - `aria-expanded`: ドロップダウンの開閉状態
   - `aria-haspopup`: ドロップダウンメニューの存在
   - `role="menuitem"`: メニュー項目

3. **スクリーンリーダー対応**
   - テーマ変更時のアナウンス（オプション）
   - 現在のテーマの明示

### エラーハンドリング

1. **localStorage エラー**
   - try-catchでラップ
   - エラー時はデフォルトテーマを使用
   - コンソールにエラーログ

2. **無効なテーマ名**
   - バリデーション
   - デフォルトテーマへのフォールバック

3. **CSS変数の適用失敗**
   - エラーログ
   - アプリケーションは継続動作

## Testing Strategy

### ユニットテスト
- ThemeContextのロジック
- テーマプリセットの定義
- ローカルストレージの読み書き

### 統合テスト
- テーマ切り替えの動作
- CSS変数の更新
- ローカルストレージの永続化

### 視覚テスト
- 各テーマの表示確認
- ダークモードのコントラスト確認
- レスポンシブ対応確認

### アクセシビリティテスト
- キーボード操作
- スクリーンリーダー対応
- コントラスト比チェック

## Future Enhancements

1. **カスタムテーマ作成機能**
   - ユーザーが独自のカラーパレットを作成
   - カラーピッカーUI

2. **システムテーマとの連携**
   - OSのダークモード設定を自動検出
   - `prefers-color-scheme`メディアクエリの活用

3. **テーマのインポート/エクスポート**
   - JSON形式でテーマを保存
   - 他のユーザーとテーマを共有

4. **アニメーション効果**
   - テーマ切り替え時のトランジション効果
   - カラーグラデーションアニメーション

## Conclusion

このデザインは、既存のコンポーネントへの影響を最小限に抑えながら、柔軟で拡張可能なテーマシステムを提供します。CSS変数とReact Contextを組み合わせることで、パフォーマンスとメンテナンス性を両立させています。

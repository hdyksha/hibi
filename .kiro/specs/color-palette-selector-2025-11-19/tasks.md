# Implementation Plan

## Phase 1: Core Theme Infrastructure

- [x] 1. Create theme type definitions and presets





  - Create `client/src/types/theme.ts` with ThemeName type ('default', 'blue', 'green', 'purple', 'dark')
  - Define Theme interface with name, displayName, isDark, and colors properties (including card and cardHover)
  - Define ThemeContextType interface with currentTheme, setTheme, themes, and isDarkMode
  - Create `client/src/utils/themes.ts` with 5 theme presets using Tailwind color values
  - Default: slate colors (current scheme), Blue: blue palette, Green: emerald palette, Purple: purple palette, Dark: gray-900 bg with light text
  - Implement getThemeByName utility function
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

- [x] 2. Implement ThemeContext with localStorage persistence





  - Create `client/src/contexts/ThemeContext.tsx` with ThemeContext and ThemeProvider
  - Implement state management for current theme using useState
  - Create loadThemeFromStorage function to read from localStorage (key: 'todo-app-theme')
  - Create saveThemeToStorage function to write to localStorage
  - Create applyThemeToDOM function to update CSS variables on :root element
  - Set data-theme and data-dark-mode attributes on root element
  - Apply initial theme on mount using useEffect
  - Implement useTheme custom hook with error handling
  - Add try-catch blocks for localStorage operations with console error logging
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5, 10.1, 10.2, 10.3, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 3. Add CSS variables for theme colors
  - Update `client/src/index.css` to define CSS custom properties in :root
  - Add variables: --color-primary, --color-primary-hover, --color-primary-light, --color-accent
  - Add variables: --color-background, --color-background-secondary, --color-text, --color-text-secondary, --color-border
  - Add variables: --color-card, --color-card-hover
  - Set default values (current gray/slate colors) as fallback
  - _Requirements: 3.3, 3.4, 7.1, 7.2, 7.3, 7.4, 7.5, 10.1, 10.2_

## Phase 2: Theme Selector UI Component

- [x] 4. Build ThemeSelector component with dropdown





  - Create `client/src/components/ThemeSelector.tsx` component
  - Import useTheme hook and add state for dropdown open/close
  - Implement button with palette SVG icon (44x44px minimum touch target)
  - Add aria-label="テーマを選択", aria-expanded, and aria-haspopup attributes
  - Implement dropdown menu positioned absolutely (right-aligned) with theme list
  - Display theme displayName and color preview circle for each option
  - Show checkmark icon for currently selected theme
  - Add click handler to select theme and close dropdown
  - Style with white background, shadow, border, and hover states
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.1, 8.3, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5. Add keyboard and click-outside handling





  - Add useRef for dropdown element
  - Implement useEffect to detect clicks outside dropdown and close it
  - Implement useEffect to detect Escape key press and close dropdown
  - Clean up event listeners on unmount
  - Ensure keyboard accessibility (Tab, Enter, Space navigation)
  - Add role="menuitem" to theme options and aria-hidden="true" to color previews
  - _Requirements: 2.2, 8.1, 8.2, 8.3, 8.4, 8.5_

## Phase 3: Integration

- [x] 6. Configure Tailwind to integrate CSS variables





  - Update `client/tailwind.config.js` to extend colors with CSS variables
  - Add primary (DEFAULT, hover, light), accent, background (DEFAULT, secondary), text (DEFAULT, secondary), border, card (DEFAULT, hover)
  - Verify Tailwind classes like `bg-primary`, `text-text`, `border-border` work correctly
  - Add `.theme-transition` utility class in `client/src/index.css` for smooth transitions
  - Remove global `*` transition selector to improve performance
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 10.1, 10.2_

- [ ] 7. Integrate ThemeProvider and ThemeSelector into App
  - Update `client/src/App.tsx` to import ThemeProvider from contexts
  - Wrap App component tree with ThemeProvider (inside ErrorBoundary, outside NetworkProvider)
  - Import ThemeSelector component
  - Add ThemeSelector to header next to FileSelector with proper spacing (gap-3 or gap-4)
  - Update `client/src/components/index.ts` to export ThemeSelector
  - Update `client/src/contexts/index.ts` to export ThemeProvider and useTheme
  - Verify theme selector appears correctly on mobile and desktop
  - _Requirements: 2.1, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 8. Apply theme colors using Tailwind classes
  - Update main background div: `bg-gradient-to-br from-background to-background-secondary theme-transition`
  - Update header: `bg-card border-b border-border theme-transition`
  - Update logo: `bg-gradient-to-br from-primary to-primary-hover`
  - Update title (Hibi): `text-text`
  - Update navigation container: `bg-background-secondary theme-transition`
  - Update navigation buttons (active): `bg-background text-text shadow-sm theme-transition`
  - Update navigation buttons (inactive): `text-text-secondary hover:text-text hover:bg-background/60 theme-transition`
  - Replace all inline styles with Tailwind classes
  - Test theme switching to verify all colors change correctly
  - _Requirements: 3.1, 3.2, 7.4, 7.5, 11.1_

## Phase 4: Testing and Validation

- [ ] 9. Manual testing and verification
  - Test all 5 themes (default, blue, green, purple, dark) for visual correctness
  - Verify theme transitions are smooth without flickering
  - Test localStorage persistence (reload page, close/reopen browser)
  - Test with localStorage disabled (private browsing) - should fall back to default
  - Test with invalid theme name in localStorage - should fall back to default
  - Verify keyboard navigation (Tab, Enter, Space, Escape)
  - Test on mobile and desktop browsers (Chrome, Firefox, Safari, Edge)
  - Verify touch interactions and dropdown positioning on small screens
  - Check that existing features (todo CRUD, filter, archive) work with all themes
  - Verify no console errors and proper error logging for localStorage failures
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_

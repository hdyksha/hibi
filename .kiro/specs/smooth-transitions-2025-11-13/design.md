# Design Document: Smooth Transitions

## Overview

This design document outlines the implementation strategy for adding smooth transitions and animations throughout the Todo App. The solution focuses on creating a polished user experience through optimistic UI updates, CSS-based animations, intelligent loading states, and accessibility-compliant motion design.

The design leverages React's state management capabilities, CSS transitions/animations, and the existing Tailwind CSS framework to implement fluid interactions with minimal performance overhead.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Animation   │  │  Optimistic  │  │   Loading    │     │
│  │  Constants   │  │  UI Manager  │  │   Manager    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Component Layer (with transitions)            │  │
│  │  - TodoItem (enter/exit animations)                   │  │
│  │  - TodoForm (loading states)                          │  │
│  │  - ErrorMessage (slide animations)                    │  │
│  │  - LoadingSpinner (delayed appearance)               │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │         CSS Animation Layer                           │  │
│  │  - Transition utilities                               │  │
│  │  - Keyframe animations                                │  │
│  │  - Reduced motion support                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Performance First**: Use CSS transitions/animations over JavaScript animations
2. **Progressive Enhancement**: Core functionality works without animations
3. **Accessibility**: Respect `prefers-reduced-motion` system preference
4. **Consistency**: Centralized animation constants for uniform timing
5. **Optimistic UI**: Update UI immediately, rollback on errors

## Components and Interfaces

### 1. Animation Constants Module

**Location**: `client/src/utils/animations.ts`

```typescript
// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  instant: 0,
  fast: 100,
  normal: 150,
  medium: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
} as const;

// Easing functions
export const ANIMATION_EASING = {
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  linear: 'linear',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Loading delays
export const LOADING_DELAY = {
  spinner: 200,        // Show spinner after 200ms
  minDisplay: 300,     // Keep spinner visible for at least 300ms
} as const;

// Scroll behavior
export const SCROLL_CONFIG = {
  duration: 400,
  highlightDuration: 500,
} as const;
```

### 2. Optimistic UI Hook

**Location**: `client/src/hooks/useOptimisticUpdate.ts`

```typescript
interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  rollbackDelay?: number;
}

export function useOptimisticUpdate<T>() {
  const [optimisticState, setOptimisticState] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(false);

  const execute = async (
    optimisticValue: T,
    apiCall: () => Promise<T>,
    options?: OptimisticUpdateOptions<T>
  ) => {
    // Set optimistic state immediately
    setOptimisticState(optimisticValue);
    setIsPending(true);

    try {
      const result = await apiCall();
      setOptimisticState(null);
      setIsPending(false);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      // Rollback optimistic update
      setTimeout(() => {
        setOptimisticState(null);
        setIsPending(false);
      }, options?.rollbackDelay || 0);
      options?.onError?.(error as Error);
      throw error;
    }
  };

  return { optimisticState, isPending, execute };
}
```

### 3. Delayed Loading Hook

**Location**: `client/src/hooks/useDelayedLoading.ts`

```typescript
interface DelayedLoadingOptions {
  delay?: number;
  minDisplayTime?: number;
}

export function useDelayedLoading(
  isLoading: boolean,
  options: DelayedLoadingOptions = {}
) {
  const [showLoading, setShowLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Delay showing the loading indicator
      const timer = setTimeout(() => {
        setShowLoading(true);
        setLoadingStartTime(Date.now());
      }, options.delay || LOADING_DELAY.spinner);

      return () => clearTimeout(timer);
    } else if (showLoading && loadingStartTime) {
      // Ensure minimum display time
      const elapsed = Date.now() - loadingStartTime;
      const remaining = (options.minDisplayTime || LOADING_DELAY.minDisplay) - elapsed;

      if (remaining > 0) {
        setTimeout(() => {
          setShowLoading(false);
          setLoadingStartTime(null);
        }, remaining);
      } else {
        setShowLoading(false);
        setLoadingStartTime(null);
      }
    }
  }, [isLoading, showLoading, loadingStartTime, options.delay, options.minDisplayTime]);

  return showLoading;
}
```

### 4. Animation Utilities

**Location**: `client/src/utils/animationUtils.ts`

```typescript
// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get animation duration based on user preference
export function getAnimationDuration(duration: number): number {
  return prefersReducedMotion() ? Math.min(duration, 50) : duration;
}

// Smooth scroll to element
export function smoothScrollToElement(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
) {
  if (prefersReducedMotion()) {
    element.scrollIntoView({ behavior: 'auto', ...options });
  } else {
    element.scrollIntoView({ behavior: 'smooth', ...options });
  }
}

// Highlight element temporarily
export function highlightElement(element: HTMLElement, duration: number = 500) {
  element.classList.add('highlight-pulse');
  setTimeout(() => {
    element.classList.remove('highlight-pulse');
  }, duration);
}
```

### 5. CSS Transition Classes

**Location**: `client/src/index.css` (additions)

```css
/* Transition utilities */
@layer utilities {
  /* Fade transitions */
  .transition-fade {
    transition: opacity var(--duration-normal) var(--easing-ease-in-out);
  }

  .transition-fade-fast {
    transition: opacity var(--duration-fast) var(--easing-ease-in-out);
  }

  /* Transform transitions */
  .transition-transform {
    transition: transform var(--duration-normal) var(--easing-ease-in-out);
  }

  /* Combined transitions */
  .transition-all-smooth {
    transition: all var(--duration-normal) var(--easing-ease-in-out);
  }

  /* Enter/exit animations */
  .animate-enter {
    animation: enter var(--duration-slow) var(--easing-ease-out);
  }

  .animate-exit {
    animation: exit var(--duration-medium) var(--easing-ease-in);
  }

  /* Highlight pulse */
  .highlight-pulse {
    animation: highlightPulse var(--duration-slowest) var(--easing-ease-in-out);
  }

  /* Skeleton loading */
  .skeleton {
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
  }
}

/* CSS Custom Properties */
:root {
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-medium: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 400ms;
  --duration-slowest: 500ms;

  --easing-ease-in: ease-in;
  --easing-ease-out: ease-out;
  --easing-ease-in-out: ease-in-out;
  --easing-linear: linear;
  --easing-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 50ms;
    --duration-normal: 50ms;
    --duration-medium: 50ms;
    --duration-slow: 50ms;
    --duration-slower: 50ms;
    --duration-slowest: 50ms;
  }

  *,
  *::before,
  *::after {
    animation-duration: 50ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 50ms !important;
  }
}

/* Keyframe animations */
@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes exit {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
}

@keyframes highlightPulse {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: rgba(59, 130, 246, 0.1);
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 6. Enhanced TodoContext with Optimistic Updates

**Modifications to**: `client/src/contexts/TodoContext.tsx`

The TodoContext will be enhanced to support optimistic updates:

```typescript
// Add optimistic state management
const [optimisticTodos, setOptimisticTodos] = useState<TodoItem[]>([]);

// Merge optimistic and actual todos
const displayTodos = useMemo(() => {
  return [...optimisticTodos, ...todos];
}, [optimisticTodos, todos]);

// Enhanced addTodo with optimistic update
const addTodoOptimistic = async (todo: CreateTodoInput) => {
  const tempId = `temp-${Date.now()}`;
  const optimisticTodo: TodoItem = {
    id: tempId,
    ...todo,
    completed: false,
    createdAt: new Date().toISOString(),
    isPending: true, // Flag for visual indication
  };

  // Add optimistically
  setOptimisticTodos(prev => [...prev, optimisticTodo]);

  try {
    const newTodo = await todoApi.createTodo(todo);
    // Remove optimistic, add real
    setOptimisticTodos(prev => prev.filter(t => t.id !== tempId));
    setTodos(prev => [...prev, newTodo]);
  } catch (error) {
    // Rollback optimistic update
    setTimeout(() => {
      setOptimisticTodos(prev => prev.filter(t => t.id !== tempId));
    }, 300); // Brief delay to show error state
    throw error;
  }
};
```

### 7. Animated List Component

**Location**: `client/src/components/AnimatedList.tsx`

```typescript
interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
}: AnimatedListProps<T>) {
  const [displayItems, setDisplayItems] = useState<T[]>(items);

  useEffect(() => {
    // Animate additions and removals
    const newItems = items.filter(
      item => !displayItems.find(d => keyExtractor(d) === keyExtractor(item))
    );
    const removedItems = displayItems.filter(
      item => !items.find(i => keyExtractor(i) === keyExtractor(item))
    );

    // Handle additions
    if (newItems.length > 0) {
      setDisplayItems(items);
    }

    // Handle removals with animation
    if (removedItems.length > 0) {
      removedItems.forEach(item => {
        const element = document.querySelector(
          `[data-item-id="${keyExtractor(item)}"]`
        );
        if (element) {
          element.classList.add('animate-exit');
        }
      });

      setTimeout(() => {
        setDisplayItems(items);
      }, getAnimationDuration(ANIMATION_DURATION.medium));
    }
  }, [items]);

  return (
    <ul className={className}>
      {displayItems.map((item, index) => (
        <li
          key={keyExtractor(item)}
          data-item-id={keyExtractor(item)}
          className="animate-enter"
        >
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}
```

## Data Models

### Extended TodoItem Type

```typescript
export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority?: Priority;
  tags?: string[];
  memo?: string;
  createdAt: string;
  updatedAt?: string;
  // New fields for animation states
  isPending?: boolean;      // Optimistic update in progress
  isHighlighted?: boolean;  // Temporarily highlighted
  isExiting?: boolean;      // Being removed
}
```

### Animation State Type

```typescript
export interface AnimationState {
  isEntering: boolean;
  isExiting: boolean;
  isHighlighted: boolean;
  isPending: boolean;
}

export type AnimationPhase = 'idle' | 'entering' | 'exiting' | 'highlighted';
```

## Error Handling

### Error Animation Strategy

1. **Error Message Appearance**
   - Slide down from top with fade-in (250ms)
   - Use spring easing for natural feel
   - Position fixed/sticky to avoid layout shift

2. **Error Dismissal**
   - Slide up with fade-out (200ms)
   - Auto-dismiss after 5 seconds with same animation
   - Manual dismiss uses same animation

3. **Optimistic Update Failures**
   - Show error indicator on failed item (shake animation)
   - Fade out failed item over 300ms
   - Display error message at top
   - Rollback state after animation completes

### Error Recovery Transitions

```typescript
// Error state with animation
interface ErrorState {
  message: string;
  isVisible: boolean;
  isExiting: boolean;
}

// Animated error display
const showError = (message: string) => {
  setError({ message, isVisible: true, isExiting: false });
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    dismissError();
  }, 5000);
};

const dismissError = () => {
  setError(prev => ({ ...prev, isExiting: true }));
  
  // Remove after animation
  setTimeout(() => {
    setError({ message: '', isVisible: false, isExiting: false });
  }, getAnimationDuration(ANIMATION_DURATION.medium));
};
```

## Testing Strategy

### Unit Tests

1. **Animation Utilities**
   - Test `prefersReducedMotion()` detection
   - Test `getAnimationDuration()` with different preferences
   - Test `smoothScrollToElement()` behavior
   - Test `highlightElement()` class manipulation

2. **Hooks**
   - Test `useOptimisticUpdate` success and failure paths
   - Test `useDelayedLoading` timing behavior
   - Mock timers for consistent test results
   - Test cleanup on unmount

3. **Component Animations**
   - Test CSS class application
   - Test animation lifecycle (enter/exit)
   - Test reduced motion compliance
   - Test optimistic state rendering

### Integration Tests

1. **Optimistic UI Flow**
   - Add todo → verify immediate display → verify API call → verify final state
   - Add todo → simulate API failure → verify rollback
   - Multiple rapid additions → verify all handled correctly

2. **Loading States**
   - Fast API response → verify no spinner shown
   - Slow API response → verify spinner appears after delay
   - Verify minimum display time for spinner

3. **Animation Sequences**
   - Add multiple todos → verify staggered animations
   - Delete todo → verify exit animation → verify removal
   - Edit todo → verify highlight animation

### Visual Regression Tests

1. **Animation Snapshots**
   - Capture key frames of animations
   - Test with and without reduced motion
   - Verify no layout shifts during animations

2. **Accessibility Tests**
   - Verify reduced motion compliance
   - Test keyboard navigation during animations
   - Verify focus management during transitions

### Performance Tests

1. **Animation Performance**
   - Measure FPS during animations
   - Test with large lists (100+ items)
   - Verify no jank or dropped frames
   - Test on lower-end devices

2. **Memory Leaks**
   - Test timer cleanup
   - Test animation cleanup on unmount
   - Verify no lingering event listeners

## Implementation Phases

### Phase 1: Foundation (Requirements 9, 10)
- Create animation constants module
- Add CSS custom properties
- Implement reduced motion support
- Create animation utility functions

### Phase 2: Core Animations (Requirements 2, 5)
- Implement enter/exit animations for TodoItem
- Add hover and focus transitions
- Implement checkbox animation
- Add button feedback animations

### Phase 3: Optimistic UI (Requirement 1)
- Create `useOptimisticUpdate` hook
- Enhance TodoContext with optimistic state
- Implement optimistic add/update/delete
- Add pending state indicators

### Phase 4: Loading States (Requirement 3)
- Create `useDelayedLoading` hook
- Update LoadingSpinner component
- Implement minimum display time
- Add fade transitions for loading states

### Phase 5: Advanced Features (Requirements 4, 6, 7, 8)
- Implement edit mode transitions
- Add error message animations
- Create skeleton screen for initial load
- Implement smooth scrolling
- Add highlight animations

### Phase 6: Polish and Testing
- Comprehensive testing
- Performance optimization
- Accessibility audit
- Documentation

## Performance Considerations

1. **CSS over JavaScript**
   - Use CSS transitions/animations for better performance
   - Leverage GPU acceleration with `transform` and `opacity`
   - Avoid animating layout properties (width, height, margin)

2. **Animation Optimization**
   - Use `will-change` sparingly for complex animations
   - Remove `will-change` after animation completes
   - Debounce rapid state changes

3. **List Rendering**
   - Use React keys properly for list animations
   - Consider virtualization for very long lists
   - Batch state updates to minimize re-renders

4. **Memory Management**
   - Clean up timers and intervals
   - Remove event listeners on unmount
   - Clear animation classes after completion

## Accessibility Considerations

1. **Reduced Motion**
   - Respect `prefers-reduced-motion` system preference
   - Reduce animation duration to ≤50ms
   - Simplify complex animations to simple fades
   - Maintain functional feedback

2. **Focus Management**
   - Maintain focus during transitions
   - Announce state changes to screen readers
   - Ensure keyboard navigation works during animations

3. **Visual Feedback**
   - Provide non-motion alternatives for important feedback
   - Use color and text in addition to animation
   - Ensure sufficient contrast during transitions

## Browser Compatibility

- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS features: CSS custom properties, CSS animations, CSS transitions
- JavaScript features: ES2020+, async/await, optional chaining
- Fallback: Graceful degradation for older browsers (instant transitions)

## Migration Strategy

1. **Incremental Rollout**
   - Implement foundation first (constants, utilities)
   - Add animations component by component
   - Test each component before moving to next
   - Monitor performance metrics

2. **Feature Flags**
   - Consider adding animation toggle for debugging
   - Allow disabling animations in development
   - Provide escape hatch for performance issues

3. **Backward Compatibility**
   - Ensure app works without animations
   - No breaking changes to existing APIs
   - Maintain current component interfaces

# Design Document

## Overview

This design document outlines the technical approach for migrating the Todo App from a refresh-based state management pattern to an optimistic UI pattern. The migration will be performed in four distinct phases, each building upon the previous phase while maintaining the ability to rollback if issues arise.

The core strategy is to eliminate unnecessary full data refreshes and provide immediate user feedback by updating local state before server confirmation, with robust error handling and rollback capabilities.

## Architecture

### Current Architecture Issues

```
User Action → API Call → refreshTodos() → setLoading(true) → UI disappears
                                       ↓
                              getTodos() from server
                                       ↓
                              setTodos(newData) → setLoading(false) → UI reappears
```

**Problems:**
1. Every operation triggers a full refresh
2. Loading state causes UI to disappear (flickering)
3. User must wait for server response before seeing changes
4. Unnecessary API calls (e.g., fetching all todos to toggle one)

### Target Architecture

```
User Action → Optimistic Update (immediate UI change)
           ↓
           API Call (background)
           ↓
           ├─ Success → Confirm with server data
           └─ Failure → Rollback + Error message
```

**Benefits:**
1. Immediate user feedback
2. No loading states for operations
3. Reduced API calls
4. Better perceived performance

## Components and Interfaces

### 1. Enhanced State Management Hook (useTodos)

#### Current Interface
```typescript
interface UseTodosReturn {
  todos: TodoItem[];
  loading: boolean;  // Single loading state
  error: string | null;
  refreshTodos: () => Promise<void>;
  createTodo: (input: CreateTodoItemInput) => Promise<TodoItem>;
  updateTodo: (id: string, input: UpdateTodoItemInput) => Promise<TodoItem>;
  toggleTodoCompletion: (id: string) => Promise<TodoItem>;
  deleteTodo: (id: string) => Promise<void>;
  // ... other fields
}
```

#### Enhanced Interface
```typescript
interface UseTodosReturn {
  todos: TodoItem[];
  loading: boolean;        // Initial load only
  isRefreshing: boolean;   // Background refresh
  error: string | null;
  refreshTodos: (silent?: boolean) => Promise<void>;
  createTodo: (input: CreateTodoItemInput) => Promise<TodoItem>;
  updateTodo: (id: string, input: UpdateTodoItemInput) => Promise<TodoItem>;
  toggleTodoCompletion: (id: string) => Promise<TodoItem>;
  deleteTodo: (id: string) => Promise<void>;
  // ... other fields
}
```

**Key Changes:**
- Split `loading` into `loading` (initial) and `isRefreshing` (background)
- Add `silent` parameter to `refreshTodos` for background updates
- All mutation methods will use optimistic updates internally

### 2. Optimistic Update Utility

```typescript
interface OptimisticUpdateOptions<T> {
  // The state setter function
  setState: React.Dispatch<React.SetStateAction<T>>;
  
  // Function to compute the optimistic state
  optimisticUpdate: (prev: T) => T;
  
  // The async operation to perform
  operation: () => Promise<void>;
  
  // Optional: Function to compute confirmed state from server response
  confirmedUpdate?: (prev: T, response: any) => T;
  
  // Error handler
  onError: (error: Error) => void;
}

interface OptimisticUpdateResult {
  // Execute the optimistic update
  execute: () => Promise<void>;
  
  // Manual rollback (if needed)
  rollback: () => void;
}

function useOptimisticUpdate<T>(): {
  createUpdate: (options: OptimisticUpdateOptions<T>) => OptimisticUpdateResult;
} {
  // Implementation details in next section
}
```

### 3. Enhanced TodoList Component

#### Current Behavior
```typescript
if (loading) {
  return <LoadingSpinner />;  // Entire list disappears
}

return <ul>{todos.map(...)}</ul>;
```

#### Enhanced Behavior
```typescript
// Show spinner only on initial load with no data
if (loading && todos.length === 0) {
  return <LoadingSpinner />;
}

return (
  <div>
    {/* Small indicator for background refresh */}
    {isRefreshing && (
      <div className="refresh-indicator">
        <SmallSpinner /> Updating...
      </div>
    )}
    
    {/* List always visible */}
    <ul>{todos.map(...)}</ul>
  </div>
);
```

### 4. Enhanced API Layer

#### Current toggleTodoCompletion
```typescript
async toggleTodoCompletion(id: string): Promise<TodoItem> {
  // Inefficient: fetches all todos first
  const todos = await this.getTodos();
  const currentTodo = todos.find(todo => todo.id === id);
  return this.updateTodo(id, { completed: !currentTodo.completed });
}
```

#### Enhanced toggleTodoCompletion (Option A: Client-side state)
```typescript
async toggleTodoCompletion(id: string, currentCompleted: boolean): Promise<TodoItem> {
  // Direct update with known state
  return this.updateTodo(id, { completed: !currentCompleted });
}
```

#### Enhanced toggleTodoCompletion (Option B: Server endpoint)
```typescript
async toggleTodoCompletion(id: string): Promise<TodoItem> {
  // New dedicated endpoint that handles toggle server-side
  return this.http.post<TodoItem>(`/todos/${id}/toggle`, {});
}
```

**Recommendation:** Option A for immediate implementation (no backend changes), Option B for future optimization.

## Data Models

### State Snapshot for Rollback

```typescript
interface StateSnapshot<T> {
  timestamp: number;
  state: T;
  operation: string;  // For debugging
}

// Usage in useTodos
const [stateSnapshots, setStateSnapshots] = useState<StateSnapshot<TodoItem[]>[]>([]);

// Before optimistic update
const snapshot: StateSnapshot<TodoItem[]> = {
  timestamp: Date.now(),
  state: todos,
  operation: 'toggleTodoCompletion'
};
```

### Optimistic Todo Item

```typescript
interface OptimisticTodoItem extends TodoItem {
  _optimistic?: {
    isPending: boolean;      // Operation in progress
    operation: 'create' | 'update' | 'delete' | 'toggle';
    tempId?: string;         // For newly created items
  };
}
```

This allows UI to show pending states:
```typescript
{todo._optimistic?.isPending && (
  <span className="pending-indicator">⏳</span>
)}
```

## Error Handling

### Error Recovery Strategy

```typescript
interface OptimisticError extends Error {
  operation: string;
  rollbackState: any;
  canRetry: boolean;
}

// In useTodos
const handleOptimisticError = (error: OptimisticError) => {
  // 1. Rollback state
  setTodos(error.rollbackState);
  
  // 2. Set error message
  setError(error.message);
  
  // 3. Provide retry option if applicable
  if (error.canRetry) {
    setRetryAction(() => error.operation);
  }
  
  // 4. Log for debugging
  console.error('Optimistic update failed:', error);
};
```

### Error UI Patterns

```typescript
// In TodoItem component
{error && (
  <div className="error-banner">
    <span>{error.message}</span>
    {error.canRetry && (
      <button onClick={handleRetry}>Retry</button>
    )}
    <button onClick={dismissError}>Dismiss</button>
  </div>
)}
```

## Testing Strategy

### Phase-by-Phase Testing

Each phase must pass all tests before proceeding to the next phase.

#### Phase 1: Loading State Separation
**Tests:**
- [ ] Initial load shows loading spinner
- [ ] Subsequent refreshes don't show loading spinner
- [ ] Background refresh indicator appears during refresh
- [ ] All existing functionality works unchanged
- [ ] No visual flickering during filter changes

#### Phase 2: Optimistic Toggle
**Tests:**
- [ ] Checkbox responds immediately to clicks
- [ ] Server success confirms the change
- [ ] Server failure reverts the checkbox
- [ ] Error message appears on failure
- [ ] Multiple rapid toggles are handled correctly
- [ ] Network offline scenario handled gracefully

#### Phase 3: Optimistic Delete & Update
**Tests:**
- [ ] Deleted items disappear immediately
- [ ] Deleted items reappear on failure
- [ ] Updated items show changes immediately
- [ ] Updates revert on failure
- [ ] Edit modal closes on success
- [ ] Edit modal stays open on failure with error

#### Phase 4: Optimistic Create
**Tests:**
- [ ] New items appear immediately in list
- [ ] Temporary ID is replaced with server ID
- [ ] Failed creates are removed from list
- [ ] Form data is preserved on failure
- [ ] Tags list updates only when needed

### Integration Tests

```typescript
describe('Optimistic UI Integration', () => {
  it('should handle rapid successive operations', async () => {
    // Toggle → Update → Delete in quick succession
    // Verify all operations complete correctly
  });
  
  it('should handle network interruption gracefully', async () => {
    // Start operation → Go offline → Verify rollback
  });
  
  it('should maintain data consistency after errors', async () => {
    // Perform operation → Fail → Retry → Verify state
  });
});
```

## Migration Phases

### Phase 1: Foundation - Loading State Separation

**Goal:** Eliminate flickering without changing operation behavior

**Changes:**
1. Add `isRefreshing` state to `useTodos`
2. Modify `refreshTodos` to use `isRefreshing` for non-initial loads
3. Update `TodoList` to show data during refresh
4. Add small refresh indicator component

**Files Modified:**
- `client/src/hooks/useTodos.ts`
- `client/src/hooks/useArchive.ts`
- `client/src/components/TodoList.tsx`
- `client/src/components/Archive.tsx`

**Rollback Plan:** Revert the 4 files above

**Success Criteria:**
- No loading spinner after initial load
- No flickering during operations
- All existing tests pass

### Phase 2: Optimistic Toggle Completion

**Goal:** Make checkbox interactions instant

**Changes:**
1. Create `useOptimisticUpdate` hook
2. Modify `toggleTodoCompletion` in `useTodos` to use optimistic update
3. Remove `refreshTodos()` call after toggle
4. Update `TodoApi.toggleTodoCompletion` to accept current state

**Files Modified:**
- `client/src/hooks/useOptimisticUpdate.ts` (new)
- `client/src/hooks/useTodos.ts`
- `client/src/services/api/TodoApi.ts`

**Rollback Plan:** Revert to Phase 1 state

**Success Criteria:**
- Checkbox responds instantly
- Rollback works on error
- No refresh after toggle

### Phase 3: Optimistic Delete and Update

**Goal:** Make delete and edit operations instant

**Changes:**
1. Modify `deleteTodo` to use optimistic update
2. Modify `updateTodo` to use optimistic update
3. Remove `refreshTodos()` calls after these operations
4. Add conditional `refreshTags()` only when tags change

**Files Modified:**
- `client/src/hooks/useTodos.ts`

**Rollback Plan:** Revert to Phase 2 state

**Success Criteria:**
- Delete removes item instantly
- Edit shows changes instantly
- Rollback works on errors
- Tags refresh only when needed

### Phase 4: Optimistic Create

**Goal:** Make task creation instant

**Changes:**
1. Modify `createTodo` to add item with temporary ID
2. Replace temporary ID with server ID on success
3. Remove optimistic item on failure
4. Preserve form data on failure for retry

**Files Modified:**
- `client/src/hooks/useTodos.ts`
- `client/src/hooks/useTodoForm.ts`

**Rollback Plan:** Revert to Phase 3 state

**Success Criteria:**
- New tasks appear instantly
- Form clears on success
- Form preserves data on failure
- Temporary IDs handled correctly

## Implementation Details

### useOptimisticUpdate Hook Implementation

```typescript
// client/src/hooks/useOptimisticUpdate.ts

import { useCallback } from 'react';

interface OptimisticUpdateOptions<T, R = void> {
  setState: React.Dispatch<React.SetStateAction<T>>;
  optimisticUpdate: (prev: T) => T;
  operation: () => Promise<R>;
  confirmedUpdate?: (prev: T, response: R) => T;
  onError: (error: Error) => void;
}

export const useOptimisticUpdate = <T>() => {
  const createUpdate = useCallback(<R = void>(
    options: OptimisticUpdateOptions<T, R>
  ) => {
    let snapshot: T;
    
    const execute = async (): Promise<void> => {
      const { setState, optimisticUpdate, operation, confirmedUpdate, onError } = options;
      
      // 1. Save current state
      setState(prev => {
        snapshot = prev;
        return optimisticUpdate(prev);
      });
      
      try {
        // 2. Perform operation
        const response = await operation();
        
        // 3. Confirm with server response (if provided)
        if (confirmedUpdate) {
          setState(prev => confirmedUpdate(prev, response));
        }
      } catch (error) {
        // 4. Rollback on error
        setState(snapshot);
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    };
    
    const rollback = () => {
      setState(snapshot);
    };
    
    return { execute, rollback };
  }, []);
  
  return { createUpdate };
};
```

### Example Usage in useTodos

```typescript
// In useTodos.ts

const { createUpdate } = useOptimisticUpdate<TodoItem[]>();

const toggleTodoCompletion = useCallback(async (id: string): Promise<TodoItem> => {
  clearError();
  
  const todo = todos.find(t => t.id === id);
  if (!todo) {
    throw new Error('Todo not found');
  }
  
  const update = createUpdate({
    setState: setTodos,
    
    optimisticUpdate: (prev) => 
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    
    operation: () => todoApi.toggleTodoCompletion(id, todo.completed),
    
    confirmedUpdate: (prev, serverTodo) =>
      prev.map(t => t.id === id ? serverTodo : t),
    
    onError: (error) => {
      setError(normalizeError(error, 'Failed to toggle todo completion'));
    }
  });
  
  await update.execute();
  
  // Return the updated todo (optimistic version)
  return todos.find(t => t.id === id)!;
}, [todos, clearError, setError, createUpdate]);
```

### Refresh Indicator Component

```typescript
// client/src/components/RefreshIndicator.tsx

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  className?: string;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({ 
  isRefreshing, 
  className 
}) => {
  if (!isRefreshing) return null;
  
  return (
    <div className={`refresh-indicator ${className || ''}`}>
      <div className="spinner-small" />
      <span>Updating...</span>
    </div>
  );
};
```

## Performance Considerations

### Reducing API Calls

**Before Migration:**
- Create: 1 API call + 1 refresh (2 total)
- Update: 1 API call + 1 refresh (2 total)
- Delete: 1 API call + 1 refresh (2 total)
- Toggle: 1 getTodos + 1 update + 1 refresh (3 total)

**After Migration:**
- Create: 1 API call (1 total) - 50% reduction
- Update: 1 API call (1 total) - 50% reduction
- Delete: 1 API call (1 total) - 50% reduction
- Toggle: 1 API call (1 total) - 67% reduction

**Expected Impact:**
- 50-67% reduction in API calls per operation
- Faster perceived performance (instant feedback)
- Reduced server load

### Memory Management

**State Snapshots:**
- Keep only the most recent snapshot per operation
- Clear snapshots after successful operations
- Limit snapshot history to prevent memory leaks

```typescript
// Cleanup after successful operation
const cleanupSnapshot = () => {
  // Snapshot is garbage collected when function scope ends
  // No explicit cleanup needed with closure approach
};
```

## Accessibility Considerations

### Screen Reader Announcements

```typescript
// Announce optimistic updates
const announceUpdate = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Usage
toggleTodoCompletion(id).then(() => {
  announceUpdate('Task marked as complete');
});
```

### Focus Management

```typescript
// Maintain focus during optimistic updates
const handleDelete = async (id: string) => {
  const currentFocus = document.activeElement;
  
  await deleteTodo(id);
  
  // Restore focus to next item or container
  if (currentFocus && !document.contains(currentFocus)) {
    const nextItem = findNextFocusableItem();
    nextItem?.focus();
  }
};
```

## Monitoring and Debugging

### Development Tools

```typescript
// Add debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('[Optimistic Update]', {
    operation: 'toggleTodoCompletion',
    id,
    previousState: snapshot,
    optimisticState: newState,
    timestamp: Date.now()
  });
}
```

### Performance Metrics

```typescript
// Track operation timing
const trackOperation = (operation: string, duration: number) => {
  if (window.performance && window.performance.mark) {
    performance.mark(`${operation}-start`);
    // ... operation
    performance.mark(`${operation}-end`);
    performance.measure(operation, `${operation}-start`, `${operation}-end`);
  }
};
```

## Risk Mitigation

### Potential Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Race conditions with rapid operations | High | Queue operations or use operation IDs |
| State inconsistency after rollback | High | Comprehensive testing, state validation |
| Memory leaks from snapshots | Medium | Automatic cleanup after operations |
| Network timing issues | Medium | Timeout handling, retry logic |
| User confusion during rollback | Low | Clear error messages, visual feedback |

### Rollback Strategy

Each phase is independently reversible:
1. Identify the problematic phase
2. Revert the specific files modified in that phase
3. Run tests to verify stability
4. Investigate and fix the issue
5. Retry the phase

## Future Enhancements

### Post-Migration Optimizations

1. **Request Queuing**: Queue rapid successive operations to prevent race conditions
2. **Offline Support**: Store operations locally and sync when online
3. **Conflict Resolution**: Handle concurrent edits from multiple clients
4. **Partial Updates**: Send only changed fields to server
5. **WebSocket Integration**: Real-time updates from server without polling

### Archive View Optimization

Apply the same optimistic patterns to the archive view:
- Instant filtering
- Background refresh
- Optimistic restore operations

## Conclusion

This design provides a clear, phased approach to migrating from refresh-based to optimistic UI patterns. Each phase builds upon the previous one while maintaining the ability to rollback if issues arise. The implementation focuses on user experience improvements while maintaining data consistency and error recovery capabilities.

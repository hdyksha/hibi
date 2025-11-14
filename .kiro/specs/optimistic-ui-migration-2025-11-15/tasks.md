# Implementation Plan

- [ ] 1. Phase 1: Foundation - Loading State Separation
  - Implement loading state separation in useTodos hook to distinguish between initial load and background refresh
  - Add `isRefreshing` state alongside existing `loading` state
  - Modify `refreshTodos` function to accept optional `silent` parameter
  - Update logic to set `loading` only for initial load (when todos.length === 0)
  - Set `isRefreshing` for subsequent refreshes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 1.1 Write tests for loading state separation
  - Write test: initial load sets loading to true
  - Write test: subsequent refresh sets isRefreshing to true, not loading
  - Write test: loading is false after initial data load
  - Write test: isRefreshing is false after refresh completes
  - Write test: silent refresh doesn't trigger any loading states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 1.2 Update useTodos hook with separated loading states
  - Add `isRefreshing` state variable to useTodos hook
  - Modify `refreshTodos` to accept `silent?: boolean` parameter
  - Implement conditional logic: use `loading` for initial load, `isRefreshing` for subsequent
  - Update return interface to include `isRefreshing`
  - Run tests to verify implementation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 1.3 Apply same loading state separation to useArchive hook
  - Add `isRefreshing` state to useArchive hook
  - Modify `refreshArchive` to use separated loading states
  - Update return interface to include `isRefreshing`
  - Run tests to verify implementation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.1, 12.2, 12.3_

- [ ] 1.4 Create RefreshIndicator component
  - Create new component at `client/src/components/RefreshIndicator.tsx`
  - Accept `isRefreshing` and optional `className` props
  - Display small spinner with "Updating..." text when refreshing
  - Return null when not refreshing
  - Style with subtle, non-intrusive design
  - _Requirements: 1.3, 1.4_

- [ ] 1.5 Update TodoList component to use separated loading states
  - Modify loading condition to check `loading && todos.length === 0`
  - Add RefreshIndicator component above the todo list
  - Pass `isRefreshing` prop to RefreshIndicator
  - Ensure list remains visible during background refresh
  - _Requirements: 1.3, 1.4, 1.5_

- [ ] 1.6 Update Archive component to use separated loading states
  - Modify loading condition to check `loading && archiveGroups.length === 0`
  - Add RefreshIndicator for archive view
  - Ensure archive list remains visible during refresh
  - _Requirements: 1.3, 1.4, 1.5, 12.1, 12.2, 12.3_

- [ ] 1.7 Update TodoContext to expose isRefreshing state
  - Update TodoContextValue interface to include `isRefreshing` from useTodos
  - Ensure isRefreshing is passed through context value
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 1.8 Verify Phase 1 functionality with integration tests
  - Run existing test suite to ensure no regressions
  - Manually test initial load shows loading spinner
  - Verify subsequent operations don't show loading spinner
  - Confirm background refresh indicator appears correctly
  - Test filter changes don't cause flickering
  - Document any issues found and fix before proceeding to Phase 2
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Phase 2: Optimistic Toggle Completion
  - Implement optimistic update pattern for toggle completion operation
  - Create reusable useOptimisticUpdate hook
  - Modify toggleTodoCompletion to update UI immediately before API call
  - Implement rollback mechanism for error cases
  - Remove refreshTodos call after toggle operation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 2.1 Write tests for useOptimisticUpdate hook
  - Write test: optimistic update applies immediately
  - Write test: successful operation confirms with server data
  - Write test: failed operation rolls back to previous state
  - Write test: error handler is called on failure
  - Write test: multiple sequential updates work correctly
  - _Requirements: 7.1, 7.2, 7.4, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 2.2 Create useOptimisticUpdate hook
  - Create new file at `client/src/hooks/useOptimisticUpdate.ts`
  - Define OptimisticUpdateOptions interface with generic types
  - Implement createUpdate function that handles state snapshot, optimistic update, operation execution, and rollback
  - Return execute and rollback functions
  - Add TypeScript generics for type safety
  - Run tests to verify implementation
  - _Requirements: 7.1, 7.2, 7.4, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 2.3 Write tests for optimistic toggle completion
  - Write test: checkbox state changes immediately on click
  - Write test: server success confirms the toggle
  - Write test: server failure reverts the toggle
  - Write test: error message appears on failure
  - Write test: multiple rapid toggles are handled correctly
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.4 Update TodoApi.toggleTodoCompletion to accept current state
  - Modify toggleTodoCompletion method signature to accept `currentCompleted: boolean` parameter
  - Remove the inefficient getTodos() call
  - Directly call updateTodo with inverted completion state
  - Update method documentation
  - _Requirements: 2.1, 2.2, 9.1, 9.2, 9.3, 9.4_

- [ ] 2.5 Implement optimistic toggle in useTodos hook
  - Import and use useOptimisticUpdate hook
  - Modify toggleTodoCompletion to find current todo state
  - Create optimistic update that immediately flips completed status
  - Call API with current completion state
  - Implement confirmed update with server response
  - Add error handler that calls setError
  - Remove refreshTodos() call
  - Run tests to verify implementation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.2, 7.1, 7.2, 7.3_

- [ ] 2.6 Update TodoItem component to handle optimistic states
  - Ensure checkbox reflects optimistic state immediately
  - Add optional pending indicator for operations in progress
  - Handle disabled state during API call if needed
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2.7 Verify Phase 2 with integration tests
  - Run all tests including new optimistic toggle tests
  - Manually test checkbox responds immediately to clicks
  - Verify server success confirms the change
  - Test server failure reverts the checkbox
  - Verify error message appears on failure
  - Test multiple rapid toggles are handled correctly
  - Test network offline scenario
  - Document any issues and fix before proceeding to Phase 3
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2, 7.3_

- [ ] 3. Phase 3: Optimistic Delete and Update
  - Implement optimistic updates for delete and update operations
  - Modify deleteTodo to remove item immediately from UI
  - Modify updateTodo to apply changes immediately
  - Implement rollback for both operations on error
  - Add conditional tag refresh only when tags actually change
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_

- [ ] 3.1 Write tests for optimistic delete
  - Write test: deleted item disappears immediately
  - Write test: server success confirms deletion
  - Write test: server failure restores deleted item
  - Write test: error message appears on failure
  - Write test: focus moves to next item after delete
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.2 Implement optimistic delete in useTodos hook
  - Use useOptimisticUpdate for deleteTodo operation
  - Create optimistic update that filters out the deleted todo
  - Call todoApi.deleteTodo
  - Implement error handler with rollback
  - Remove refreshTodos() call
  - Run tests to verify implementation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.2, 7.1, 7.2_

- [ ] 3.3 Write tests for optimistic update
  - Write test: updated item shows changes immediately
  - Write test: server success confirms update
  - Write test: server failure reverts update
  - Write test: error message appears on failure
  - Write test: edit modal closes on success
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3.4 Implement optimistic update in useTodos hook
  - Use useOptimisticUpdate for updateTodo operation
  - Create optimistic update that merges changes into existing todo
  - Call todoApi.updateTodo
  - Implement confirmed update with server response
  - Add error handler with rollback
  - Remove refreshTodos() call
  - Run tests to verify implementation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.2, 7.1, 7.2_

- [ ] 3.5 Add conditional tag refresh logic
  - Check if input.tags exists and differs from current tags
  - Only call refreshTags() when new tags are added
  - Make refreshTags() call non-blocking (don't await)
  - _Requirements: 6.4, 9.4_

- [ ] 3.6 Update error handling for delete and update operations
  - Ensure error messages are clear and actionable
  - Provide retry option where applicable
  - Handle edge cases (item not found, network errors)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 3.7 Verify Phase 3 with integration tests
  - Run all tests including new delete and update tests
  - Manually test deleted items disappear immediately
  - Verify deleted items reappear on failure
  - Test updated items show changes immediately
  - Verify updates revert on failure
  - Test edit modal behavior on success and failure
  - Document any issues and fix before proceeding to Phase 4
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4. Phase 4: Optimistic Create
  - Implement optimistic creation of new todos
  - Add new todo to list immediately with temporary ID
  - Replace temporary ID with server-assigned ID on success
  - Remove optimistic todo on failure
  - Preserve form data on failure for retry
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.4, 7.1, 7.2_

- [ ] 4.1 Write tests for optimistic create
  - Write test: new task appears immediately in list
  - Write test: temporary ID is replaced with server ID on success
  - Write test: failed create removes optimistic task
  - Write test: form data is preserved on failure
  - Write test: tags list updates only when new tags added
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4.2 Implement temporary ID generation utility
  - Create utility function to generate unique temporary IDs
  - Use timestamp-based or UUID-based approach
  - Ensure IDs are distinguishable from server IDs
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4.3 Implement optimistic create in useTodos hook
  - Generate temporary ID for new todo
  - Create optimistic todo item with all required fields
  - Add optimistic todo to beginning of list immediately
  - Call todoApi.createTodo
  - On success, replace temporary ID with server ID
  - On failure, remove optimistic todo from list
  - Remove refreshTodos() and refreshTags() calls
  - Run tests to verify implementation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.4_

- [ ] 4.4 Add conditional tag refresh for create operation
  - Check if new todo contains tags not in availableTags
  - Only call refreshTags() when new tags are introduced
  - Make call non-blocking
  - _Requirements: 6.4_

- [ ] 4.5 Update useTodoForm to preserve form data on error
  - Modify error handling to not reset form on API failure
  - Keep form data intact so user can retry
  - Only clear form on successful creation
  - _Requirements: 5.5_

- [ ] 4.6 Add pending indicator for optimistic todos
  - Add visual indicator (subtle spinner or icon) for pending todos
  - Style optimistic todos slightly differently (e.g., reduced opacity)
  - Remove indicator when server confirms
  - _Requirements: 5.2, 5.3_

- [ ] 4.7 Verify Phase 4 with integration tests
  - Run all tests including new create tests
  - Manually test new tasks appear immediately in list
  - Verify temporary ID is replaced with server ID
  - Test failed creates are removed from list
  - Verify form data is preserved on failure
  - Test tags list updates only when needed
  - Document any issues and fix before proceeding to Phase 5
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5. Integration and Polish
  - Ensure all phases work together seamlessly
  - Add comprehensive error messages
  - Implement accessibility features
  - Add performance monitoring
  - Final testing and documentation
  - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 13.1, 13.2, 13.3, 13.4, 13.5, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 5.1 Implement screen reader announcements for optimistic updates
  - Create utility function for ARIA live region announcements
  - Announce successful operations (e.g., "Task marked as complete")
  - Announce rollbacks (e.g., "Operation failed, changes reverted")
  - Use polite announcements to avoid interruption
  - _Requirements: 15.1, 15.2, 15.5_

- [ ] 5.2 Implement focus management during optimistic updates
  - Preserve focus during delete operations
  - Move focus to next item when deleted item had focus
  - Maintain focus in edit modal during updates
  - Ensure keyboard navigation works during pending states
  - _Requirements: 15.3, 15.4_

- [ ] 5.3 Add network status checks before optimistic updates
  - Check network status from NetworkContext before operations
  - Show warning when attempting actions while offline
  - Provide clear feedback about network state
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 5.4 Optimize filter and search to avoid unnecessary refreshes
  - Ensure filter changes apply to local data without refetch
  - Implement debouncing for search input
  - Only refetch when server-side filtering is required
  - Maintain current data during filter application
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 5.5 Add comprehensive error messages
  - Create user-friendly error messages for each operation type
  - Include retry options where applicable
  - Provide context about what failed and why
  - Style error messages consistently
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 5.6 Perform comprehensive integration testing
  - Test rapid successive operations (toggle → update → delete)
  - Test network interruption scenarios
  - Verify data consistency after errors
  - Test all operations with various network conditions
  - Verify no regressions in existing functionality
  - Run full test suite and ensure all tests pass
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 5.7 Add development logging for debugging
  - Add console logging for optimistic updates in development mode
  - Log operation type, state changes, and timing
  - Include rollback events in logs
  - Ensure logs are removed in production builds
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 5.8 Document performance improvements
  - Measure and document API call reduction
  - Record time-to-interactive improvements
  - Document loading state frequency reduction
  - Create before/after comparison report
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 5.9 Update documentation and code comments
  - Document the optimistic update pattern in code comments
  - Update README with new behavior description
  - Document rollback behavior and error handling
  - Add JSDoc comments to useOptimisticUpdate hook
  - _Requirements: 11.5_

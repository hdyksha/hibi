---
inclusion: always
---

# Project Structure & Development Conventions

## Architecture Overview
- **Monorepo**: npm workspace with `client/` (React) and `server/` (Express) applications
- **Data Layer**: JSON file-based persistence in `server/data/`
- **API**: RESTful endpoints with `/api` prefix, proxied from client to server:3001

## File Organization Rules

### Client Structure (`client/src/`)
```
components/     # React components with co-located __tests__/
hooks/          # Custom React hooks (prefix with 'use')
services/       # API clients and external integrations
types/          # TypeScript type definitions
contexts/       # React Context providers
utils/          # Pure utility functions
test/           # Integration tests and test setup
```

### Server Structure (`server/src/`)
```
routes/         # Express route handlers (/api endpoints)
services/       # Business logic layer
models/         # Data models and validation schemas
middleware/     # Express middleware functions
utils/          # Server utility functions
__tests__/      # Integration tests at root level
```

## Naming Conventions (Strictly Enforce)
- **Components**: `PascalCase.tsx` (e.g., `TodoItem.tsx`)
- **Hooks**: `useCamelCase.ts` (e.g., `useTodos.ts`)
- **Services**: `PascalCaseService.ts` (e.g., `ApiService.ts`)
- **Types/Interfaces**: `PascalCase` (e.g., `Todo`, `ApiResponse`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Test files**: `*.test.ts` or `*.test.tsx`

## Code Organization Patterns

### Frontend Data Flow
1. **Component** renders UI and handles user interactions
2. **Hook** manages component state and side effects
3. **Service** handles API communication
4. **API** communicates with backend endpoints

### Backend Request Flow
1. **Route** handles HTTP requests and responses
2. **Service** contains business logic and validation
3. **Model** defines data structure and persistence
4. **Data** JSON file storage operations

## Development Rules

### File Creation Guidelines
- Always create tests alongside new components/services
- Place tests in `__tests__/` directories next to source files
- Use barrel exports (`index.ts`) for component directories
- Group related functionality in dedicated directories

### Import/Export Standards
- **Prefer named exports** over default exports
- **Import types**: Use `import type { Type } from './types'`
- **Import order**: External libraries → Internal modules → Relative imports
- **Barrel exports**: Export from `index.ts` in component directories

### Testing Requirements
- Use descriptive test names with `describe` blocks
- Co-locate unit tests with source files
- Place integration tests in dedicated `test/` directories
- Follow the pattern: `ComponentName.test.tsx` or `serviceName.test.ts`

### State Management
- **Global state**: React Context providers in `contexts/`
- **Local state**: Component-level useState/useReducer
- **Server state**: Custom hooks with API services
- **Form state**: Local component state or form libraries
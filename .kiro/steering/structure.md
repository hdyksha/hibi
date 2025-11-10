# Project Structure

## Monorepo Layout
This is a monorepo with npm workspaces containing separate client and server packages.

```
todo-app/
├── client/              # React frontend application
├── server/              # Express.js backend API
├── .kiro/               # Kiro AI assistant configuration
├── .env                 # Environment configuration (gitignored)
├── .env.example         # Environment template
└── package.json         # Root workspace configuration
```

## Client Structure (client/)
```
client/
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer
│   ├── test/            # Test utilities and setup
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main application component
│   ├── App.test.tsx     # Application tests
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles (Tailwind)
├── public/              # Static assets
├── dist/                # Build output (gitignored)
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── vitest.config.ts     # Vitest test configuration
├── tsconfig.json        # TypeScript configuration
├── postcss.config.js    # PostCSS/Tailwind configuration
└── package.json         # Client dependencies
```

## Server Structure (server/)
```
server/
├── src/
│   ├── __tests__/       # Integration tests
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic layer
│   ├── test-utils/      # Test utilities
│   ├── utils/           # Utility functions
│   └── index.ts         # Server entry point
├── data/                # JSON data storage (default, configurable)
├── dist/                # Compiled JavaScript output (gitignored)
├── tsconfig.json        # TypeScript configuration
├── vitest.config.ts     # Vitest test configuration
└── package.json         # Server dependencies
```

## Architecture Patterns

### Frontend
- Component-based architecture with React
- Context API for state management
- Custom hooks for reusable logic
- Service layer for API communication
- Type-safe with TypeScript interfaces

### Backend
- Layered architecture: routes → services → models
- Middleware for cross-cutting concerns
- File-based data persistence (JSON)
- RESTful API design
- Test utilities for consistent testing

## File Naming Conventions
- Components: PascalCase (e.g., `TodoList.tsx`)
- Utilities/Services: camelCase (e.g., `apiService.ts`)
- Tests: `*.test.ts` or `*.test.tsx`
- Config files: lowercase with dots (e.g., `vite.config.ts`)

## Import Conventions
- Client uses ES modules (`import/export`)
- Server uses CommonJS (`require/module.exports` after compilation)
- Relative imports for local files
- Absolute imports from node_modules

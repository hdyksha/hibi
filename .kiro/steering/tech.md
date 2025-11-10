# Technology Stack

## Frontend (client/)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest with React Testing Library
- **Styling**: Tailwind CSS v4 with PostCSS
- **Module System**: ESNext (ES modules)
- **Dev Server**: Vite dev server on port 3000
- **API Proxy**: `/api` routes proxied to backend at localhost:3001

## Backend (server/)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Testing**: Vitest with Supertest
- **Module System**: CommonJS
- **Dev Tool**: tsx watch mode
- **Data Storage**: JSON files (configurable directory)
- **Port**: 3001 (configurable via PORT env var)

## TypeScript Configuration
- **Client**: Strict mode, ES2020 target, bundler module resolution, no emit (Vite handles bundling)
- **Server**: Strict mode, ES2022 target, CommonJS modules, compiles to `dist/`
- Both use strict type checking with `noUnusedLocals` and `noUnusedParameters`

## Common Commands

### Setup
```bash
npm run install:all    # Install all dependencies (client + server)
```

### Development
```bash
npm run dev            # Start both client and server concurrently
npm run dev:server     # Start server only (port 3001)
npm run dev:client     # Start client only (port 3000)
```

### Testing
```bash
npm test               # Run all tests (server + client)
npm run test:server    # Run server tests only
npm run test:client    # Run client tests only
npm run test:watch     # Run all tests in watch mode
```

### Building
```bash
npm run build          # Build both client and server
npm run build:server   # Build server to dist/
npm run build:client   # Build client to dist/
```

### Production
```bash
npm start              # Start production server
```

### Maintenance
```bash
npm run clean          # Remove all build artifacts and node_modules
```

## Environment Configuration
- Configuration via `.env` file in project root
- `PORT`: Server port (default: 3001)
- `TODO_DATA_DIR`: Data storage directory (default: server/data)

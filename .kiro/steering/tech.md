# Technology Stack

## Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest with jsdom environment
- **Testing Libraries**: React Testing Library, Jest DOM
- **Styling**: Tailwind CSS with PostCSS
- **Development**: Hot module replacement via Vite dev server (port 3000)

## Backend (Server)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with CORS support
- **Development**: tsx watch for hot reload
- **Testing**: Vitest with Node environment
- **Testing Libraries**: Supertest for API testing
- **Build**: TypeScript compiler (tsc)
- **Production**: Compiled JavaScript (port 3001)

## Development Tools
- **Package Manager**: npm with workspaces
- **Process Management**: concurrently for running multiple services
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Testing**: Vitest for both frontend and backend

## Common Commands

### Setup
```bash
npm run install:all    # Install all dependencies
```

### Development
```bash
npm run dev            # Start both client and server in development mode
npm run dev:client     # Start only client (port 3000)
npm run dev:server     # Start only server (port 3001)
```

### Testing
```bash
npm test               # Run all tests
npm run test:save      # Run tests and save results to timestamped log files
npm run test:watch     # Run tests in watch mode
```

### Building
```bash
npm run build          # Build both client and server for production
npm start              # Start production server
```

### Utilities
```bash
npm run clean          # Remove all build artifacts and node_modules
```

## API Configuration
- Client development server proxies `/api` requests to `http://localhost:3001`
- Server runs on port 3001 in development and production
- Client runs on port 3000 in development
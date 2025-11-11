/**
 * Todo App Server - Main Entry Point
 * 
 * This is the main server application file that sets up the Express server,
 * configures middleware, registers routes, and starts the HTTP server.
 * 
 * Environment Variables:
 * - PORT: Server port (default: 3001)
 * - TODO_DATA_DIR: Data storage directory (default: server/data)
 * - NODE_ENV: Environment mode (development, production, test)
 */

// Load environment variables from .env file in project root
import dotenv from 'dotenv';
import { join } from 'path';

// Load .env from project root (parent directory of server/)
// This assumes the server is always run from the project root via npm scripts
dotenv.config({ path: join(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import todoRoutes from './routes/todos';
import fileRoutes from './routes/files';
import { errorHandler, notFoundHandler, timeoutHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Middleware Configuration
 */

// Request timeout middleware (30 seconds)
// Prevents requests from hanging indefinitely
app.use(timeoutHandler(30000));

// CORS configuration
// Allows requests from the frontend development servers
app.use(cors({
  origin: [
    'http://localhost:3000',  // Vite dev server (current)
    'http://localhost:5173',  // Vite dev server (default)
    'http://127.0.0.1:3000'   // Alternative localhost access
  ],
  credentials: true
}));

// JSON parsing middleware with size limit and strict mode
// Parses incoming JSON request bodies with a 10MB size limit
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

/**
 * API Routes
 */

// Todo management routes
app.use('/api/todos', todoRoutes);

// File management routes
app.use('/api/files', fileRoutes);

/**
 * Health check endpoint
 * 
 * Returns server status and uptime information.
 * Useful for monitoring and load balancer health checks.
 * 
 * @route GET /health
 * @returns {object} Server status information
 */
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Todo App Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test route for JSON parsing (only in test environment)
if (process.env.NODE_ENV === 'test') {
  app.post('/test-json', (req, res) => {
    res.json({ received: req.body });
  });
}

/**
 * Error Handling
 */

// Handle 404 for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

/**
 * Server Startup
 * 
 * The server is only started when not in test mode.
 * In test mode, the Express app is exported without starting the server,
 * allowing tests to create their own server instances.
 */
import type { Server } from 'http';

let serverInstance: Server | null = null;

if (process.env.NODE_ENV !== 'test') {
  serverInstance = app.listen(PORT, () => {
    console.log(`Todo App Server is running on port ${PORT}`);
    console.log(`Data directory: ${process.env.TODO_DATA_DIR || 'server/data (default)'}`);
  });

  /**
   * Graceful shutdown handler
   * 
   * Handles SIGTERM signals to gracefully shut down the server,
   * allowing in-flight requests to complete before terminating.
   */
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    serverInstance?.close(() => {
      console.log('Process terminated');
    });
  });
}

/**
 * Exports
 * 
 * - app: The Express application instance (for testing)
 * - server: The HTTP server instance (null in test mode)
 */
export { app, serverInstance as server };
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

// Request timeout middleware (30 seconds)
app.use(timeoutHandler(30000));

// CORS設定
app.use(cors({
  origin: [
    'http://localhost:3000',  // Vite dev server (current)
    'http://localhost:5173',  // Vite dev server (default)
    'http://127.0.0.1:3000'   // Alternative localhost access
  ],
  credentials: true
}));

// JSON解析ミドルウェア with size limit and error handling
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

// API routes
app.use('/api/todos', todoRoutes);
app.use('/api/files', fileRoutes);

// 基本的なヘルスチェックエンドポイント
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

// Handle 404 for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// サーバー起動 (テスト環境では起動しない)
let serverInstance: any = null;

if (process.env.NODE_ENV !== 'test') {
  serverInstance = app.listen(PORT, () => {
    console.log(`Todo App Server is running on port ${PORT}`);
    console.log(`Data directory: ${process.env.TODO_DATA_DIR || 'server/data (default)'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    serverInstance.close(() => {
      console.log('Process terminated');
    });
  });
}

export { app, serverInstance as server };
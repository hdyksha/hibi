import express from 'express';
import cors from 'cors';
import todoRoutes from './routes/todos';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS設定
app.use(cors({
  origin: [
    'http://localhost:3000',  // Vite dev server (current)
    'http://localhost:5173',  // Vite dev server (default)
    'http://127.0.0.1:3000'   // Alternative localhost access
  ],
  credentials: true
}));

// JSON解析ミドルウェア
app.use(express.json());

// API routes
app.use('/api/todos', todoRoutes);

// 基本的なヘルスチェックエンドポイント
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Todo App Server is running' });
});

// サーバー起動 (テスト環境では起動しない)
let server: any = null;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Todo App Server is running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
}

export { app, server };
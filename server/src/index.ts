import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS設定
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// JSON解析ミドルウェア
app.use(express.json());

// 基本的なヘルスチェックエンドポイント
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Todo App Server is running' });
});

// サーバー起動
const server = app.listen(PORT, () => {
  console.log(`Todo App Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export { app, server };
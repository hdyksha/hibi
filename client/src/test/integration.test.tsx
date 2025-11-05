/**
 * フロントエンド統合テスト - 主要なユーザーフローをテスト
 * Requirements: All requirements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App';

// モックの設定
vi.mock('../services', () => ({
  todoApiClient: {
    getTodos: vi.fn(),
    getTags: vi.fn(),
    getArchive: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    toggleTodoCompletion: vi.fn(),
    deleteTodo: vi.fn(),
    setNetworkReporter: vi.fn(),
  },
  ApiClientError: class ApiClientError extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'ApiClientError';
    }
  },
}));

vi.mock('../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isSlowConnection: false,
    lastOnlineAt: Date.now(),
    connectionType: null,
    checkConnection: vi.fn().mockResolvedValue(true),
    reportConnectionError: vi.fn(),
    reportConnectionSuccess: vi.fn(),
  }),
}));

// LocalStorageモック
const mockLocalStorage = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Import the mocked API client
import { todoApiClient } from '../services';
const mockApiClient = todoApiClient as any;

describe('フロントエンド統合テスト', () => {
  beforeEach(() => {
    // 全てのモックをクリア
    Object.values(mockApiClient).forEach(mock => {
      if (typeof mock === 'function') {
        mock.mockClear();
      }
    });
    Object.values(mockLocalStorage).forEach(mock => mock.mockClear());
    
    // デフォルトのモック戻り値を設定
    mockApiClient.getTodos.mockResolvedValue([]);
    mockApiClient.getTags.mockResolvedValue([]);
    mockApiClient.getArchive.mockResolvedValue([]);
    
    // コンソール警告を抑制
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本的なTodo管理フロー', () => {
    it('Todo作成から削除までの完全フロー', async () => {
      const sampleTodo = {
        id: '1',
        title: 'Test Todo',
        completed: false,
        priority: 'medium',
        tags: [],
        memo: '',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      // 初期レンダリング
      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });

      // Todo作成
      mockApiClient.createTodo.mockResolvedValueOnce(sampleTodo);
      mockApiClient.getTodos.mockResolvedValueOnce([sampleTodo]);

      const titleInput = screen.getByLabelText('New Todo');
      const submitButton = screen.getByRole('button', { name: 'Create Todo' });

      fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
      });

      expect(mockApiClient.createTodo).toHaveBeenCalledWith({
        title: 'Test Todo',
        priority: 'medium',
        tags: [],
        memo: ''
      });

      // Todo完了
      const completedTodo = { ...sampleTodo, completed: true };
      mockApiClient.toggleTodoCompletion.mockResolvedValueOnce(completedTodo);
      mockApiClient.getTodos.mockResolvedValueOnce([completedTodo]);

      const completeButton = screen.getByRole('button', { name: /mark as complete/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockApiClient.toggleTodoCompletion).toHaveBeenCalledWith('1');
      });

      // Todo削除
      mockApiClient.deleteTodo.mockResolvedValueOnce(undefined);
      mockApiClient.getTodos.mockResolvedValueOnce([]);

      const deleteButton = screen.getByRole('button', { name: /delete todo: test todo/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockApiClient.deleteTodo).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('フィルタリング機能', () => {
    const sampleTodos = [
      {
        id: '1',
        title: 'Work task',
        completed: false,
        priority: 'high',
        tags: ['work', 'urgent'],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: 'Personal task',
        completed: true,
        priority: 'low',
        tags: ['personal'],
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      }
    ];

    beforeEach(() => {
      mockApiClient.getTodos.mockResolvedValue(sampleTodos);
      mockApiClient.getTags.mockResolvedValue(['work', 'personal', 'urgent']);
    });

    it('フィルター機能の基本動作', async () => {
      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });

      // 検索フィルター
      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'work' } });

      await waitFor(() => {
        expect(mockApiClient.getTodos).toHaveBeenCalledWith({
          status: 'pending',
          searchText: 'work'
        });
      });

      // タグフィルター
      const workCheckbox = screen.getByRole('checkbox', { name: 'work' });
      fireEvent.click(workCheckbox);

      await waitFor(() => {
        expect(mockApiClient.getTodos).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['work']
          })
        );
      });
    });

    it('利用可能なタグの表示', async () => {
      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: 'work' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'personal' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'urgent' })).toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('API エラーの適切な表示', async () => {
      mockApiClient.getTodos.mockRejectedValueOnce(new Error('Network error'));
      mockApiClient.getTags.mockRejectedValueOnce(new Error('Network error'));
      mockApiClient.getArchive.mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // リトライ機能
      mockApiClient.getTodos.mockResolvedValueOnce([]);
      mockApiClient.getTags.mockResolvedValueOnce([]);
      mockApiClient.getArchive.mockResolvedValueOnce([]);

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });
    });

    it('Todo作成エラーの処理', async () => {
      mockApiClient.createTodo.mockRejectedValueOnce(new Error('Title cannot be empty'));

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('New Todo');
      fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Todo' }));

      await waitFor(() => {
        expect(screen.getByText('Title cannot be empty')).toBeInTheDocument();
      });
    });
  });

  describe('レスポンシブデザイン', () => {
    it('モバイル表示での基本機能', async () => {
      // ビューポートサイズを変更
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      await act(async () => {
        render(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('No todos yet. Create your first todo!')).toBeInTheDocument();
      });

      // モバイルでも基本的な要素が表示されることを確認
      expect(screen.getByLabelText('New Todo')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Todo' })).toBeInTheDocument();
    });
  });
});
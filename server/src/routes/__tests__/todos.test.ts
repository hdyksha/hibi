/**
 * Todo API統合テスト - 主要なユーザーフローをテスト
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 4.1, 4.2, 7.2, 8.4, 9.1, 9.2
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app, server } from '../../index';
import { TodoItem } from '../../models';
import { IntegrationTestHelper } from '../../test-utils/integration-helpers';

describe('Todo API Integration Tests', () => {
  let testDataPath: string;

  beforeAll(() => {
    testDataPath = IntegrationTestHelper.setupTestStorage('integration');
  });

  beforeEach(async () => {
    await IntegrationTestHelper.initializeTestData(testDataPath);
  });

  afterAll(async () => {
    await IntegrationTestHelper.cleanupAllTestFiles();
    if (server) {
      server.close();
    }
  });

  describe('基本的なCRUDフロー', () => {
    it('Todo作成 → 取得 → 更新 → 削除の完全フロー', async () => {
      // 1. 初期状態：空のリスト
      let response = await request(app).get('/api/todos').expect(200);
      expect(response.body).toEqual([]);

      // 2. Todo作成
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Integration Test Todo', priority: 'high', tags: ['test'] })
        .expect(201);

      const createdTodo: TodoItem = createResponse.body;
      expect(createdTodo.id).toBeDefined();
      expect(createdTodo.title).toBe('Integration Test Todo');
      expect(createdTodo.completed).toBe(false);
      expect(createdTodo.priority).toBe('high');
      expect(createdTodo.tags).toEqual(['test']);

      // 3. Todo取得確認
      response = await request(app).get('/api/todos').expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(createdTodo.id);

      // 4. Todo完了状態に更新
      const updateResponse = await request(app)
        .put(`/api/todos/${createdTodo.id}`)
        .send({ completed: true })
        .expect(200);

      const updatedTodo: TodoItem = updateResponse.body;
      expect(updatedTodo.completed).toBe(true);
      expect(updatedTodo.updatedAt).toBeDefined();

      // 5. Todo削除
      await request(app)
        .delete(`/api/todos/${createdTodo.id}`)
        .expect(204);

      // 6. 削除確認
      response = await request(app).get('/api/todos').expect(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('フィルタリング機能', () => {
    beforeEach(async () => {
      // テストデータの作成
      const sampleTodos = IntegrationTestHelper.getSampleTodos();
      for (const todo of sampleTodos) {
        await request(app).post('/api/todos').send(todo).expect(201);
      }

      // 1つのTodoを完了状態にする
      const allTodos = await request(app).get('/api/todos').expect(200);
      const todoToComplete = allTodos.body.find((t: TodoItem) => t.title === 'Low priority task');
      await request(app)
        .put(`/api/todos/${todoToComplete.id}`)
        .send({ completed: true })
        .expect(200);
    });

    it('ステータスによるフィルタリング', async () => {
      // 未完了のみ
      let response = await request(app).get('/api/todos?status=pending').expect(200);
      expect(response.body).toHaveLength(3);
      response.body.forEach((todo: TodoItem) => {
        expect(todo.completed).toBe(false);
      });

      // 完了済みのみ
      response = await request(app).get('/api/todos?status=completed').expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].completed).toBe(true);
    });

    it('優先度によるフィルタリング', async () => {
      const response = await request(app).get('/api/todos?priority=high').expect(200);
      expect(response.body).toHaveLength(2);
      response.body.forEach((todo: TodoItem) => {
        expect(todo.priority).toBe('high');
      });
    });

    it('タグによるフィルタリング', async () => {
      const response = await request(app).get('/api/todos?tags=work').expect(200);
      expect(response.body).toHaveLength(2);
      response.body.forEach((todo: TodoItem) => {
        expect(todo.tags).toContain('work');
      });
    });

    it('検索機能（タイトル・メモ・タグ）', async () => {
      // タイトル検索
      let response = await request(app).get('/api/todos?search=meeting').expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Work meeting');

      // メモ検索
      response = await request(app).get('/api/todos?search=hobby').expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].memo).toContain('hobby');

      // タグ検索
      response = await request(app).get('/api/todos?search=urgent').expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].tags).toContain('urgent');
    });
  });

  describe('アーカイブ機能', () => {
    it('完了済みTodoのアーカイブ表示', async () => {
      // Todoを作成して完了状態にする
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Archive Test Todo' })
        .expect(201);

      const createdTodo: TodoItem = createResponse.body;

      await request(app)
        .put(`/api/todos/${createdTodo.id}`)
        .send({ completed: true })
        .expect(200);

      // アーカイブ取得
      const archiveResponse = await request(app).get('/api/todos/archive').expect(200);
      
      expect(archiveResponse.body).toHaveLength(1);
      const group = archiveResponse.body[0];
      expect(group.date).toBeDefined();
      expect(group.tasks).toHaveLength(1);
      expect(group.count).toBe(1);
      expect(group.tasks[0].title).toBe('Archive Test Todo');
      expect(group.tasks[0].completed).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なデータでのTodo作成エラー', async () => {
      // タイトルなし
      let response = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);
      expect(response.body.error).toBe('ValidationError');

      // 空のタイトル
      response = await request(app)
        .post('/api/todos')
        .send({ title: '' })
        .expect(400);
      expect(response.body.error).toBe('ValidationError');
    });

    it('存在しないTodoの操作エラー', async () => {
      // 存在しないTodoの更新
      let response = await request(app)
        .put('/api/todos/nonexistent-id')
        .send({ completed: true })
        .expect(404);
      expect(response.body.error).toBe('NotFoundError');

      // 存在しないTodoの削除
      response = await request(app)
        .delete('/api/todos/nonexistent-id')
        .expect(404);
      expect(response.body.error).toBe('NotFoundError');
    });
  });

  describe('タグ管理', () => {
    it('利用可能なタグの取得', async () => {
      // タグ付きTodoを作成
      await request(app)
        .post('/api/todos')
        .send({ title: 'Tagged Todo', tags: ['work', 'urgent', 'meeting'] })
        .expect(201);

      const response = await request(app).get('/api/todos/tags').expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toContain('work');
      expect(response.body).toContain('urgent');
      expect(response.body).toContain('meeting');
      
      // アルファベット順にソートされていることを確認
      const sortedTags = [...response.body].sort();
      expect(response.body).toEqual(sortedTags);
    });
  });
});
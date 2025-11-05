/**
 * 統合テスト用の共通ヘルパー関数
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { TodoItem } from '../models';
import { FileStorageService, setDefaultStorageService } from '../services/FileStorageService';

export class IntegrationTestHelper {
  private static testDataPaths: string[] = [];

  /**
   * テスト用のファイルパスを生成
   */
  static generateTestFilePath(testName: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const path = join(process.cwd(), 'data', `tasks-${testName}-test-${timestamp}-${randomId}.json`);
    this.testDataPaths.push(path);
    return path;
  }

  /**
   * テスト用ストレージサービスのセットアップ
   */
  static setupTestStorage(testName: string): string {
    const testDataPath = this.generateTestFilePath(testName);
    const testStorageService = new FileStorageService(testDataPath);
    setDefaultStorageService(testStorageService);
    return testDataPath;
  }

  /**
   * テストデータの初期化
   */
  static async initializeTestData(testDataPath: string): Promise<void> {
    try {
      await fs.unlink(testDataPath);
    } catch {
      // ファイルが存在しない場合は無視
    }
    
    // データディレクトリの作成
    try {
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });
    } catch {
      // ディレクトリが既に存在する場合は無視
    }
    
    // 空のストレージファイルを作成
    await fs.writeFile(testDataPath, JSON.stringify([]), 'utf-8');
  }

  /**
   * サンプルTodoデータの作成
   */
  static getSampleTodos(): Partial<TodoItem>[] {
    return [
      { title: 'High priority task', priority: 'high', tags: ['work', 'urgent'], memo: 'Important work task' },
      { title: 'Medium priority task', priority: 'medium', tags: ['personal'], memo: 'Personal task' },
      { title: 'Low priority task', priority: 'low', tags: ['hobby'], memo: 'Fun hobby project' },
      { title: 'Work meeting', priority: 'high', tags: ['work', 'meeting'], memo: 'Team meeting notes' }
    ];
  }

  /**
   * 全てのテストファイルのクリーンアップ
   */
  static async cleanupAllTestFiles(): Promise<void> {
    for (const path of this.testDataPaths) {
      try {
        await fs.unlink(path);
      } catch {
        // ファイルが存在しない場合は無視
      }
    }
    this.testDataPaths = [];
    
    // デフォルトストレージサービスにリセット
    setDefaultStorageService(new FileStorageService());
  }

  /**
   * 単一テストファイルのクリーンアップ
   */
  static async cleanupTestFile(testDataPath: string): Promise<void> {
    try {
      await fs.unlink(testDataPath);
    } catch {
      // ファイルが存在しない場合は無視
    }
  }
}
/**
 * File API Client
 * Handles all File-related API calls
 * Requirements: 1.1, 2.1, 2.2, 5.2
 */

import { HttpClient } from '../http/HttpClient';
import {
  FileInfo,
  CurrentFileInfo,
  SwitchFileResponse
} from '../../types';

/**
 * FileApi class for File-related API operations
 * Uses HttpClient for making HTTP requests
 */
export class FileApi {
  constructor(private http: HttpClient) {}

  /**
   * Get list of available JSON files
   * GET /api/files
   * Requirements: 指定ディレクトリ内のJSONファイル一覧表示
   */
  async getFiles(): Promise<FileInfo> {
    return this.http.get<FileInfo>('/files');
  }

  /**
   * Switch to a different data file
   * POST /api/files/switch
   * Requirements: 選択されたファイルからのデータ読み込み機能、複数ファイル間でのデータ切り替え機能
   */
  async switchFile(fileName: string): Promise<SwitchFileResponse> {
    return this.http.post<SwitchFileResponse>('/files/switch', { fileName });
  }

  /**
   * Get information about the current data file
   * GET /api/files/current
   * Requirements: ファイル読み込みディレクトリのパス設定機能
   */
  async getCurrentFile(): Promise<CurrentFileInfo> {
    return this.http.get<CurrentFileInfo>('/files/current');
  }
}

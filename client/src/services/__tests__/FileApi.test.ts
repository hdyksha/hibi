/**
 * FileApi Tests
 * Basic tests for FileApi class
 * Requirements: 9.1, 9.2, 9.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileApi } from '../api/FileApi';
import { HttpClient } from '../http/HttpClient';
import { FileInfo, CurrentFileInfo, SwitchFileResponse } from '../../types';

describe('FileApi', () => {
  let fileApi: FileApi;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    // Create a mock HttpClient
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
    } as unknown as HttpClient;

    fileApi = new FileApi(mockHttpClient);
  });

  describe('getFiles', () => {
    it('should call HttpClient.get with correct endpoint', async () => {
      const mockFileInfo: FileInfo = {
        files: ['todos.json', 'archive.json'],
        currentFile: 'todos.json',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockFileInfo);

      const result = await fileApi.getFiles();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/files');
      expect(result).toEqual(mockFileInfo);
    });
  });

  describe('switchFile', () => {
    it('should call HttpClient.post with correct endpoint and data', async () => {
      const fileName = 'archive.json';
      const mockResponse: SwitchFileResponse = {
        success: true,
        message: 'Switched to archive.json',
        currentFile: fileName,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await fileApi.switchFile(fileName);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/files/switch', { fileName });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentFile', () => {
    it('should call HttpClient.get with correct endpoint', async () => {
      const mockCurrentFile: CurrentFileInfo = {
        currentFile: 'todos.json',
        path: '/data/todos.json',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockCurrentFile);

      const result = await fileApi.getCurrentFile();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/files/current');
      expect(result).toEqual(mockCurrentFile);
    });
  });
});

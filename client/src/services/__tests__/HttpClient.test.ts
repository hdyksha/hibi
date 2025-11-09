/**
 * HttpClient Tests
 * Basic tests for HttpClient class
 * Requirements: 9.1, 9.2, 9.3
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpClient, ApiClientError } from '../http/HttpClient';

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    httpClient = new HttpClient({ baseUrl: '/api' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('should make GET request with correct URL', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await httpClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }));
      expect(result).toEqual(mockData);
    });

    it('should throw ApiClientError on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
      });

      await expect(httpClient.get('/test')).rejects.toThrow(ApiClientError);
    });
  });

  describe('post', () => {
    it('should make POST request with body', async () => {
      const mockData = { id: '1', name: 'Test' };
      const requestBody = { name: 'Test' };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const result = await httpClient.post('/test', requestBody);

      expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }));
      expect(result).toEqual(mockData);
    });
  });

  describe('put', () => {
    it('should make PUT request with body', async () => {
      const mockData = { id: '1', name: 'Updated' };
      const requestBody = { name: 'Updated' };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await httpClient.put('/test/1', requestBody);

      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(requestBody),
      }));
      expect(result).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      await httpClient.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith('/api/test/1', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(httpClient.get('/test')).rejects.toThrow(ApiClientError);
    });

    it('should handle server errors (500)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      });

      await expect(httpClient.get('/test')).rejects.toThrow(ApiClientError);
    });
  });
});

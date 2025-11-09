/**
 * Export all services for easy importing
 */

// Export API classes and error types
export { HttpClient, ApiClientError } from './http/HttpClient';
export type { NetworkReporter, HttpClientConfig } from './http/HttpClient';
export { TodoApi } from './api/TodoApi';
export { FileApi } from './api/FileApi';

// Create and export default instances
import { HttpClient } from './http/HttpClient';
import { TodoApi } from './api/TodoApi';
import { FileApi } from './api/FileApi';

const httpClient = new HttpClient();
export const todoApi = new TodoApi(httpClient);
export const fileApi = new FileApi(httpClient);

// Export httpClient for network reporter setup
export { httpClient };
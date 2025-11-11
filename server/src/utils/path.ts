/**
 * Path utility functions
 * 
 * This module provides utilities for working with file system paths,
 * particularly for locating the project root directory in a monorepo structure.
 */

import { join } from 'path';

/**
 * Get the project root directory (parent of server directory)
 * 
 * This function calculates the project root based on the location of this file.
 * Since this file is at server/src/utils/path.ts, the project root is 3 levels up.
 * 
 * This is useful for constructing absolute paths to data directories, configuration
 * files, or other resources that are located relative to the project root.
 * 
 * @returns Absolute path to the project root directory
 * 
 * @example
 * ```typescript
 * import { getProjectRoot } from './utils/path';
 * import { join } from 'path';
 * 
 * // Get path to data directory
 * const dataDir = join(getProjectRoot(), 'server', 'data');
 * 
 * // Get path to environment file
 * const envFile = join(getProjectRoot(), '.env');
 * 
 * // Use with environment variables
 * const customDataDir = process.env.TODO_DATA_DIR
 *   ? join(getProjectRoot(), process.env.TODO_DATA_DIR)
 *   : join(getProjectRoot(), 'server', 'data');
 * ```
 */
export function getProjectRoot(): string {
    // This file is at: server/src/utils/path.ts
    // Project root is 3 levels up: ../../../
    return join(__dirname, '..', '..', '..');
}

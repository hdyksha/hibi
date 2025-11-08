/**
 * Path utility functions
 */

import { join } from 'path';

/**
 * Get the project root directory (parent of server directory)
 * 
 * This function calculates the project root based on the location of this file.
 * Since this file is at server/src/utils/path.ts, the project root is 3 levels up.
 * 
 * @returns Absolute path to the project root directory
 */
export function getProjectRoot(): string {
    // This file is at: server/src/utils/path.ts
    // Project root is 3 levels up: ../../../
    return join(__dirname, '..', '..', '..');
}

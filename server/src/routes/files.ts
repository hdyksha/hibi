/**
 * File management API routes
 * Requirements: データ管理の柔軟性向上、ユーザビリティ向上
 */

import { Router, Request, Response } from 'express';
import { join } from 'path';
import { listJsonFiles, switchStorageFile, getDefaultStorageService } from '../services/FileStorageService';
import { asyncHandler, ValidationError } from '../middleware/errorHandler';
import { getProjectRoot } from '../utils/path';

const router = Router();

/**
 * Get the default data directory
 * This function is called at runtime to ensure environment variables are loaded
 */
function getDefaultDataDirectory(): string {
    const projectRoot = getProjectRoot();
    return process.env.TODO_DATA_DIR 
        ? join(projectRoot, process.env.TODO_DATA_DIR)
        : join(projectRoot, 'server', 'data');
}

/**
 * GET /api/files - Get list of available JSON files in the data directory
 * Requirements: 指定ディレクトリ内のJSONファイル一覧表示
 */
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
    const dataDirectory = getDefaultDataDirectory();
    const files = await listJsonFiles(dataDirectory);
    
    // Get current storage service
    const currentService = getDefaultStorageService();
    const currentFilePath = currentService.getFilePath();
    const currentFileName = currentFilePath.split(/[/\\]/).pop() || '';
    
    res.status(200).json({
        files,
        currentFile: currentFileName,
        directory: dataDirectory
    });
}));

/**
 * POST /api/files/switch - Switch to a different data file
 * Requirements: 選択されたファイルからのデータ読み込み機能、複数ファイル間でのデータ切り替え機能
 */
router.post('/switch', asyncHandler(async (req: Request, res: Response) => {
    const { fileName } = req.body;
    
    // Validate input
    if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
        throw new ValidationError('Invalid file name', [
            { field: 'fileName', message: 'File name is required and must be a non-empty string', value: fileName }
        ]);
    }
    
    // Validate file name format (only allow alphanumeric, dash, underscore, and .json extension)
    const fileNamePattern = /^[a-zA-Z0-9_-]+\.json$/;
    if (!fileNamePattern.test(fileName)) {
        throw new ValidationError('Invalid file name format', [
            { field: 'fileName', message: 'File name must contain only alphanumeric characters, dashes, underscores, and end with .json', value: fileName }
        ]);
    }
    
    const dataDirectory = getDefaultDataDirectory();
    
    // Construct full file path
    const filePath = join(dataDirectory, fileName);
    
    // Verify file exists in the list
    const availableFiles = await listJsonFiles(dataDirectory);
    if (!availableFiles.includes(fileName)) {
        throw new ValidationError('File not found', [
            { field: 'fileName', message: 'The specified file does not exist in the data directory', value: fileName }
        ]);
    }
    
    // Switch to the new file
    switchStorageFile(filePath);
    
    res.status(200).json({
        message: 'Successfully switched to new file',
        currentFile: fileName,
        filePath
    });
}));

/**
 * GET /api/files/current - Get information about the current data file
 * Requirements: ファイル読み込みディレクトリのパス設定機能
 */
router.get('/current', asyncHandler(async (_req: Request, res: Response) => {
    // Get current storage service
    const currentService = getDefaultStorageService();
    const currentFilePath = currentService.getFilePath();
    const currentFileName = currentFilePath.split(/[/\\]/).pop() || '';
    
    // Get todo count from current file
    const todos = await currentService.readTodos();
    
    res.status(200).json({
        fileName: currentFileName,
        filePath: currentFilePath,
        directory: getDefaultDataDirectory(),
        todoCount: todos.length
    });
}));

export default router;

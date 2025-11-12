/**
 * FileSelector Component
 * Provides a dropdown interface for switching between different JSON data files
 * Requirements: ファイル選択UIの実装、複数ファイル間でのデータ切り替え機能
 */

import { useState, useEffect } from 'react';
import { fileApi } from '../services';
import { FileInfo } from '../types';

/**
 * Props for FileSelector component
 */
interface FileSelectorProps {
  /** Optional callback function called after successful file switch */
  onFileSwitch?: () => void;
}

/**
 * FileSelector component for switching between data files
 * Displays available JSON files and allows users to switch the active data file
 * 
 * @param props - Component props
 * @returns File selector dropdown component
 */
export function FileSelector({ onFileSwitch }: FileSelectorProps) {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  /**
   * Loads the list of available files from the server
   */
  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedFileInfo = await fileApi.getFiles();
      setFileInfo(loadedFileInfo);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles switching to a different data file
   * Reloads the file list after successful switch and triggers callback
   * 
   * @param fileName - Name of the file to switch to
   */
  const handleFileSwitch = async (fileName: string) => {
    if (fileName === fileInfo?.currentFile) {
      setIsDropdownOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await fileApi.switchFile(fileName);
      await loadFiles();
      setIsDropdownOpen(false);
      onFileSwitch?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to switch file');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !fileInfo) {
    return (
      <div className="text-sm text-gray-500">
        Loading files...
      </div>
    );
  }

  if (error && !fileInfo) {
    return (
      <div className="text-sm text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!fileInfo) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{fileInfo.currentFile}</span>
        <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-20">
            <div className="p-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Select Data File</h3>
              <p className="text-xs text-gray-500 mt-1">
                {fileInfo.files.length} file{fileInfo.files.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            {error && (
              <div className="p-2 bg-red-50 border-b border-red-200">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto">
              {fileInfo.files.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No JSON files found
                </div>
              ) : (
                <ul className="py-1">
                  {fileInfo.files.map((file) => (
                    <li key={file}>
                      <button
                        onClick={() => handleFileSwitch(file)}
                        disabled={isLoading}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                          file === fileInfo.currentFile ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="truncate">{file}</span>
                        {file === fileInfo.currentFile && (
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600">
                Directory: <span className="font-mono">{fileInfo.directory}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

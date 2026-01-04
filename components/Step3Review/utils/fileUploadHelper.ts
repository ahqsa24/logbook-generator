/**
 * File Upload Helper Utilities
 * Shared utilities for file size validation and formatting
 */

// Maximum file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Validate if file size is within allowed limit
 */
export const validateFileSize = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(0);
        return {
            valid: false,
            error: `File size (${fileSizeMB} MB) exceeds the maximum allowed size of ${maxSizeMB} MB. Please compress or choose a smaller file.`
        };
    }
    return { valid: true };
};

/**
 * Format bytes to human-readable file size
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get color class based on file size
 */
export const getFileSizeColorClass = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    if (mb < 5) return 'text-green-600 dark:text-green-400';
    if (mb < 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
};

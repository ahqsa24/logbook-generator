/**
 * File Type Helper Utilities
 * Utility functions for file type detection and handling
 */

/**
 * Get MIME type from filename extension
 */
export const getFileType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();

    const mimeTypes: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return mimeTypes[ext || ''] || 'application/octet-stream';
};

/**
 * Check if file can be previewed in browser
 */
export const isPreviewable = (fileName: string): boolean => {
    const fileType = getFileType(fileName);
    const ext = getFileExtension(fileName);

    // Images and PDFs can be previewed natively
    if (fileType.startsWith('image/') || fileType === 'application/pdf') {
        return true;
    }

    // DOCX files can be previewed with docx-preview library
    if (ext === 'docx') {
        return true;
    }

    return false;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
};

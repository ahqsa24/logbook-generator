/**
 * File validation utilities
 */

const ACCEPTED_FILE_TYPES = ['.xlsx', '.xls', '.csv', '.zip'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const validateFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return ACCEPTED_FILE_TYPES.some(type => fileName.endsWith(type));
};

export const validateFileSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
};

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (!validateFileType(file)) {
        return {
            isValid: false,
            error: `Invalid file type. Please upload ${ACCEPTED_FILE_TYPES.join(', ')} files only.`
        };
    }

    if (!validateFileSize(file)) {
        return {
            isValid: false,
            error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`
        };
    }

    return { isValid: true };
};

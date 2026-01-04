/**
 * Custom hook for file upload logic
 */

import { useState } from 'react';

export const useFileUpload = (onFileUpload: (file: File) => void) => {
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = async (file: File | undefined) => {
        if (!file) return;

        setError(null);
        setIsProcessing(true);

        try {
            await onFileUpload(file);
        } catch (err) {
            const errorMessage = (err as Error).message || 'Unknown error occurred';
            setError(errorMessage);
            console.error('File upload error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        error,
        setError,
        isProcessing,
        handleFileChange
    };
};

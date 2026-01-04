'use client';

import { useEffect } from 'react';
import { getFileType, isPreviewable } from '../utils/fileTypeHelper';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    fileData: string; // base64
}

/**
 * TODO: DOCX Preview Implementation
 * 
 * To add DOCX file preview support:
 * 1. Install: npm install docx-preview
 * 2. Import: import { renderAsync } from 'docx-preview'
 * 3. Add useRef for container: const docxContainerRef = useRef<HTMLDivElement>(null)
 * 4. In useEffect: Convert base64 to Blob and call renderAsync(blob, docxContainerRef.current)
 * 5. Update isPreviewable() in fileTypeHelper.ts to include .docx
 * 6. Add conditional render: {isDocx && <div ref={docxContainerRef} />}
 * 
 * Note: docx-preview attempts to preserve layout but may not be 100% accurate to MS Word.
 */

export const FilePreviewModal = ({ isOpen, onClose, fileName, fileData }: FilePreviewModalProps) => {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const fileType = getFileType(fileName);
    const canPreview = isPreviewable(fileName);
    const fileUrl = `data:${fileType};base64,${fileData}`;

    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">
                        {fileName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
                    {canPreview ? (
                        <>
                            {isImage && (
                                <div className="flex items-center justify-center h-full">
                                    <img
                                        src={fileUrl}
                                        alt={fileName}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                    />
                                </div>
                            )}
                            {isPDF && (
                                <iframe
                                    src={fileUrl}
                                    className="w-full h-full rounded-lg border-0"
                                    title={fileName}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <svg className="w-20 h-20 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Preview not available
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                This file type cannot be previewed in the browser.
                            </p>
                            <a
                                href={fileUrl}
                                download={fileName}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <a
                        href={fileUrl}
                        download={fileName}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Download
                    </a>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

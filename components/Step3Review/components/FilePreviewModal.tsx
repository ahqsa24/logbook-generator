'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getFileType, isPreviewable, getFileExtension } from '../utils/fileTypeHelper';

// Dynamically import DocxPreview with SSR disabled
const DocxPreview = dynamic(() => import('./DocxPreview'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <svg className="animate-spin h-12 w-12 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-700 dark:text-gray-300">Loading DOCX preview...</p>
        </div>
    ),
});

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    fileData: string; // base64
}

/**
 * FilePreviewModal - Displays file preview for images, PDFs, and DOCX files
 * 
 * Supported formats:
 * - Images (jpg, jpeg, png, gif): Native browser support
 * - PDF: Native browser support via iframe (may fail for some PDFs)
 * - DOCX: Using docx-preview library (loaded dynamically)
 * 
 * Known limitations:
 * - PDF preview may fail for password-protected files, very large files, or PDFs with special features
 * - DOCX preview may not perfectly match MS Word rendering
 * - DOC (legacy Word) files are NOT supported for preview
 */
export const FilePreviewModal = ({ isOpen, onClose, fileName, fileData }: FilePreviewModalProps) => {
    const [pdfError, setPdfError] = useState(false);

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

    // Reset states when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPdfError(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const fileType = getFileType(fileName);
    const ext = getFileExtension(fileName);
    const canPreview = isPreviewable(fileName);
    const fileUrl = `data:${fileType};base64,${fileData}`;

    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';
    const isDocx = ext === 'docx';

    // Calculate approximate file size for display
    const fileSizeKB = Math.round((fileData.length * 3) / 4 / 1024);
    const fileSizeMB = (fileSizeKB / 1024).toFixed(2);

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
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {fileName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {fileSizeKB > 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`} • {ext.toUpperCase()}
                        </p>
                    </div>
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
                            {/* Image Preview */}
                            {isImage && (
                                <div className="flex items-center justify-center h-full">
                                    <img
                                        src={fileUrl}
                                        alt={fileName}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                    />
                                </div>
                            )}

                            {/* PDF Preview */}
                            {isPDF && !pdfError && (
                                <div className="relative w-full h-full">
                                    <iframe
                                        src={fileUrl}
                                        className="w-full h-full rounded-lg border-0"
                                        title={fileName}
                                        onError={() => setPdfError(true)}
                                    />
                                    {/* PDF loading hint */}
                                    <div className="absolute bottom-4 left-4 right-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            <strong>💡 Tip:</strong> If the PDF doesn&apos;t load, try downloading the file. Some PDFs may not display correctly in the browser due to security settings or file size.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* PDF Error Fallback */}
                            {isPDF && pdfError && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <svg className="w-16 h-16 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        PDF Preview Unavailable
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 max-w-md">
                                        This PDF cannot be displayed in the browser. This may be due to:
                                    </p>
                                    <ul className="text-xs text-gray-500 dark:text-gray-400 mb-6 list-disc list-inside text-left">
                                        <li>File size exceeds browser limit</li>
                                        <li>PDF has security restrictions</li>
                                        <li>Unsupported PDF features</li>
                                    </ul>
                                    <a
                                        href={fileUrl}
                                        download={fileName}
                                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                                    >
                                        Download PDF Instead
                                    </a>
                                </div>
                            )}

                            {/* DOCX Preview - Using dynamically loaded component */}
                            {isDocx && (
                                <DocxPreview fileData={fileData} fileName={fileName} />
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
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                This file type ({ext.toUpperCase()}) cannot be previewed in the browser.
                            </p>
                            {ext === 'doc' && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
                                    💡 Legacy .doc files are not supported. Consider converting to .docx format.
                                </p>
                            )}
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

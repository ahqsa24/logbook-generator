'use client';

import { useEffect, useRef, useState } from 'react';

interface DocxPreviewProps {
    fileData: string; // base64
    fileName: string;
}

const DocxPreview = ({ fileData, fileName }: DocxPreviewProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Track if component is mounted (client-side only)
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const render = async () => {
            if (!containerRef.current) {
                console.log('[DocxPreview] Container ref not ready');
                return;
            }

            setLoading(true);
            setError(null);

            // Set a timeout to catch loading issues
            const timeoutId = setTimeout(() => {
                if (loading) {
                    setError('Loading timed out. The library may not be compatible with your browser.');
                    setLoading(false);
                }
            }, 15000); // 15 second timeout

            try {
                console.log('[DocxPreview] Starting import of docx-preview...');

                // Import docx-preview
                const docxPreview = await import('docx-preview');

                console.log('[DocxPreview] docx-preview imported successfully');

                // Convert base64 to ArrayBuffer
                const binaryString = atob(fileData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                console.log('[DocxPreview] Converted base64 to ArrayBuffer, size:', bytes.length);

                // Clear container
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                // Render the document with optimized options
                await docxPreview.renderAsync(bytes.buffer, containerRef.current!, undefined, {
                    className: 'docx-preview-content',
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: true,  // Let height be auto
                    ignoreFonts: false,
                    breakPages: true,
                    useBase64URL: true,
                    // Experimental options for better rendering
                    experimental: true,
                    trimXmlDeclaration: true,
                    renderHeaders: true,
                    renderFooters: true,
                    renderFootnotes: true,
                    renderEndnotes: true,
                });

                console.log('[DocxPreview] Render complete');
                clearTimeout(timeoutId);
                setLoading(false);
            } catch (err) {
                clearTimeout(timeoutId);
                console.error('[DocxPreview Error]', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(`Failed to render DOCX file: ${errorMessage}`);
                setLoading(false);
            }
        };

        render();
    }, [mounted, fileData]);

    const fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const fileUrl = `data:${fileType};base64,${fileData}`;

    if (!mounted) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <p className="text-gray-700 dark:text-gray-300">Initializing...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <svg className="w-16 h-16 text-amber-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    DOCX Preview Not Available
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                    {error}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                    Please download the file to view it in Microsoft Word or another compatible application.
                </p>
                <a
                    href={fileUrl}
                    download={fileName}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                    Download File
                </a>
            </div>
        );
    }

    return (
        <div className="w-full">
            {loading && (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <svg className="animate-spin h-12 w-12 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-700 dark:text-gray-300">Loading DOCX preview...</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This may take a moment for large files</p>
                </div>
            )}

            <div
                ref={containerRef}
                className={`w-full max-w-full bg-white rounded-lg shadow-lg overflow-x-hidden overflow-y-auto ${loading ? 'hidden' : ''}`}
                style={{ minHeight: '500px', maxWidth: '100%' }}
            />

            {!loading && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Note:</strong> DOCX preview may not perfectly match MS Word rendering. For accurate viewing, please download the file.
                    </p>
                </div>
            )}

            {/* Enhanced styles for docx-preview */}
            <style jsx global>{`
                /* Container styling */
                .docx-preview-content {
                    padding: 0;
                    font-family: 'Calibri', 'Arial', sans-serif;
                    overflow-x: hidden;
                }
                
                /* Wrapper styling */
                .docx-preview-content .docx-wrapper {
                    background: #f5f5f5 !important;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow-x: hidden;
                }
                
                /* Responsive wrapper padding */
                @media (min-width: 640px) {
                    .docx-preview-content .docx-wrapper {
                        padding: 20px;
                    }
                }
                
                /* Page styling - each section/page */
                .docx-preview-content .docx-wrapper > section {
                    background: white !important;
                    padding: 20px 15px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    max-width: 100%;
                    width: 100%;
                    box-sizing: border-box;
                    overflow-x: hidden;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                
                /* Desktop page width */
                @media (min-width: 768px) {
                    .docx-preview-content .docx-wrapper > section {
                        padding: 40px 30px;
                        max-width: 816px; /* A4 width at 96dpi */
                    }
                }
                
                @media (min-width: 1024px) {
                    .docx-preview-content .docx-wrapper > section {
                        padding: 60px 72px;
                    }
                }
                
                /* Typography improvements */
                .docx-preview-content p {
                    margin: 0;
                    line-height: 1.5;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    max-width: 100%;
                }
                
                .docx-preview-content span {
                    line-height: inherit;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                
                /* Handle long words/URLs */
                .docx-preview-content a,
                .docx-preview-content code {
                    word-break: break-all;
                    overflow-wrap: break-word;
                }
                
                /* Table styling - responsive */
                .docx-preview-content table {
                    border-collapse: collapse;
                    width: 100%;
                    max-width: 100%;
                    margin: 10px 0;
                    display: block;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                
                .docx-preview-content td,
                .docx-preview-content th {
                    padding: 6px 8px;
                    vertical-align: top;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    min-width: 50px;
                }
                
                /* Mobile table adjustments */
                @media (max-width: 640px) {
                    .docx-preview-content td,
                    .docx-preview-content th {
                        padding: 4px 6px;
                        font-size: 0.875rem;
                    }
                }
                
                /* Image handling - responsive */
                .docx-preview-content img {
                    max-width: 100% !important;
                    height: auto !important;
                    display: block;
                }
                
                /* List styling */
                .docx-preview-content ul,
                .docx-preview-content ol {
                    margin: 0;
                    padding-left: 24px;
                    max-width: 100%;
                }
                
                @media (min-width: 640px) {
                    .docx-preview-content ul,
                    .docx-preview-content ol {
                        padding-left: 36px;
                    }
                }
                
                .docx-preview-content li {
                    margin: 4px 0;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                
                /* Heading spacing */
                .docx-preview-content h1,
                .docx-preview-content h2,
                .docx-preview-content h3,
                .docx-preview-content h4,
                .docx-preview-content h5,
                .docx-preview-content h6 {
                    margin-top: 12px;
                    margin-bottom: 6px;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                
                /* Prevent horizontal overflow */
                .docx-preview-content * {
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
};

export default DocxPreview;

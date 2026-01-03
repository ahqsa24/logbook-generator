'use client';

import { useState } from 'react';

interface Step2FileUploadProps {
    onFileUpload: (file: File) => void;
    onBack: () => void;
    onManualEntry: () => void;
}

export default function Step2FileUpload({
    onFileUpload,
    onBack,
    onManualEntry,
}: Step2FileUploadProps) {
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

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Step 2: Upload Excel File
            </h2>

            <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Upload your Excel file or ZIP package containing logbook entries. Make sure it follows the correct format.
                </p>

                {/* Download Templates Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Download Templates:
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {/* Excel Template */}
                        <a
                            href="/templates/logbook-template.xlsx"
                            download="logbook-template.xlsx"
                            className="flex-1 min-w-[200px] px-4 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-semibold">Excel Template</span>
                        </a>

                        {/* ZIP Template */}
                        <a
                            href="/templates/logbook-package-example.zip"
                            download="logbook-package-example.zip"
                            className="flex-1 min-w-[200px] px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            <span className="font-semibold">ZIP Package Example</span>
                        </a>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                        💡 <strong>Tip:</strong> Use ZIP package for automatic file attachment!
                    </p>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                                ⚠️ File Upload Error
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-200 whitespace-pre-line">
                                {error}
                            </p>
                            <button
                                onClick={() => setError(null)}
                                className="mt-3 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-12 text-center hover:border-purple-500 dark:hover:border-purple-600 transition-colors duration-200 bg-purple-50 dark:bg-gray-700/50">
                <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.zip"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileChange(file);
                    }}
                    className="hidden"
                    id="excel-upload"
                    disabled={isProcessing}
                />
                <label htmlFor="excel-upload" className={`cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isProcessing ? (
                        <>
                            <div className="text-purple-600 dark:text-purple-400 mb-2">
                                <svg className="w-16 h-16 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Processing file...
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Please wait while we validate your file
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-purple-600 dark:text-purple-400 mb-2">
                                <svg
                                    className="w-16 h-16 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Excel files (.xlsx, .xls, .csv) or ZIP files
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                                💡 Upload ZIP to auto-include supporting files!
                            </p>
                        </>
                    )}
                </label>
            </div>

            {/* Manual Entry Option */}
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                            Don&apos;t have a file and want to create logbook manually?
                        </p>
                        <button
                            onClick={onManualEntry}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Manually
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    📋 Two Upload Options:
                </p>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                    <div>
                        <strong>Option 1: Excel Only</strong>
                        <p className="text-xs">Upload .xlsx/.xls/.csv file. Add supporting files manually in Step 3.</p>
                    </div>
                    <div>
                        <strong>Option 2: ZIP Package (Recommended)</strong>
                        <p className="text-xs">Create folder with Excel + files/ subfolder, zip it, and upload!</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Structure: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">logbook.xlsx</code> + <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">files/bukti1.pdf</code>
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                    📋 Required Excel Format:
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                    <li><strong>Waktu</strong>: Date in DD/MM/YYYY format</li>
                    <li><strong>Tstart</strong>: Start time in HH:MM format</li>
                    <li><strong>Tend</strong>: End time in HH:MM format</li>
                    <li><strong>JenisLogId</strong>: 1 (Pembimbingan), 2 (Ujian), or 3 (Kegiatan)</li>
                    <li><strong>IsLuring</strong>: 0 (Online), 1 (Offline), or 2 (Hybrid)</li>
                    <li><strong>Lokasi</strong>: Location text</li>
                    <li><strong>Keterangan</strong>: Activity description</li>
                    <li><strong>Dosen</strong>: Lecturer selection - use numbers: &quot;1&quot;, &quot;2&quot;, &quot;1,2&quot;, &quot;1,2,3&quot;</li>
                    <li><strong>FilePath</strong>: Path to supporting file (e.g., <code className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">files/bukti1.pdf</code>)</li>
                </ul>
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    onClick={onBack}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>
        </div>
    );
}

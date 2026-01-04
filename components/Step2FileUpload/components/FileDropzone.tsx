/**
 * File Dropzone Component - Drag & drop file upload UI
 */

interface FileDropzoneProps {
    isProcessing: boolean;
    onFileChange: (file: File | undefined) => void;
}

export const FileDropzone = ({ isProcessing, onFileChange }: FileDropzoneProps) => {
    return (
        <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-12 text-center hover:border-purple-500 dark:hover:border-purple-600 transition-colors duration-200 bg-purple-50 dark:bg-gray-700/50">
            <input
                type="file"
                accept=".xlsx,.xls,.csv,.zip"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileChange(file);
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
    );
};

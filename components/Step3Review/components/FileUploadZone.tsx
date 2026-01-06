'use client';

import { useRef, useState } from 'react';

interface FileUploadZoneProps {
    onFileUpload: (file: File) => void;
    isUploading: boolean;
    disabled: boolean;
    acceptedTypes?: string[];
}

export default function FileUploadZone({
    onFileUpload,
    isUploading,
    disabled,
    acceptedTypes = ['.zip', '.xlsx', '.xls']
}: FileUploadZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !isUploading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled || isUploading) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedTypes.includes(fileExtension)) {
            alert(`Invalid file type. Please upload ${acceptedTypes.join(', ')} files only.`);
            return;
        }

        onFileUpload(file);
    };

    const handleClick = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
        // Reset input value to allow uploading the same file again
        e.target.value = '';
    };

    return (
        <div
            className={`
                relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
                ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled || isUploading}
            />

            <div className="flex flex-col items-center gap-2">
                {isUploading ? (
                    <>
                        <svg className="w-10 h-10 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</p>
                    </>
                ) : (
                    <>
                        <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span className="text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ZIP, XLSX, or XLS files
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

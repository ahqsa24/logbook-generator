'use client';

interface UploadedFile {
    name: string;
    entriesCount: number;
    uploadedAt: string;
    status: 'success' | 'error';
    source?: 'step2' | 'step3';
}

interface UploadedFilesListProps {
    files: UploadedFile[];
    onRemove?: (fileName: string) => void;
    showRemove?: boolean;
}

export default function UploadedFilesList({
    files,
    onRemove,
    showRemove = false
}: UploadedFilesListProps) {
    if (files.length === 0) return null;

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Uploaded Files ({files.length})
            </p>
            <div className="space-y-2">
                {files.map((file, index) => (
                    <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Status Icon */}
                            {file.status === 'success' ? (
                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {file.name}
                                    </p>
                                    {file.source && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${file.source === 'step2'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {file.source === 'step2' ? 'Initial' : 'Additional'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {file.entriesCount} {file.entriesCount === 1 ? 'entry' : 'entries'} • {formatTime(file.uploadedAt)}
                                </p>
                            </div>
                        </div>

                        {/* Remove Button */}
                        {showRemove && onRemove && file.source === 'step3' && (
                            <button
                                onClick={() => onRemove(file.name)}
                                className="ml-2 p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Remove file"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

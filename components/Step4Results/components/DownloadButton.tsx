/**
 * Download Button Component - Download dropdown with format options
 */

import type { ExportFormat } from '../types';

interface DownloadButtonProps {
    showMenu: boolean;
    onToggleMenu: () => void;
    onSelectFormat: (format: ExportFormat) => void;
}

export const DownloadButton = ({
    showMenu,
    onToggleMenu,
    onSelectFormat
}: DownloadButtonProps) => {
    return (
        <div className="relative flex-1">
            <button
                className="btn-secondary w-full flex items-center justify-center gap-2"
                onClick={onToggleMenu}
            >
                <span>Download</span>
                <svg className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
                    <button
                        onClick={() => onSelectFormat('csv')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center gap-2"
                    >
                        <span>CSV Format</span>
                    </button>
                    <button
                        onClick={() => onSelectFormat('xlsx')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 flex items-center gap-2"
                    >
                        <span>Excel (XLSX)</span>
                    </button>
                </div>
            )}
        </div>
    );
};

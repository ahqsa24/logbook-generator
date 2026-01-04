/**
 * Custom hook for export functionality
 */

import { useState } from 'react';
import type { ExportFormat } from '../types';

export const useExport = (
    onDownloadCSV: () => void,
    onDownloadXLSX: () => void
) => {
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    const handleDownloadFormat = (format: ExportFormat) => {
        setShowDownloadMenu(false);
        if (format === 'csv') {
            onDownloadCSV();
        } else if (format === 'xlsx') {
            onDownloadXLSX();
        }
    };

    const toggleDownloadMenu = () => {
        setShowDownloadMenu(!showDownloadMenu);
    };

    return {
        showDownloadMenu,
        setShowDownloadMenu,
        handleDownloadFormat,
        toggleDownloadMenu
    };
};

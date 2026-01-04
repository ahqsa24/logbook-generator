/**
 * Custom hook for download functionality
 */

import { SubmissionResult, Lecturer } from '@/types/logbook';
import { exportToCSV, exportToXLSX } from '../utils/exporters';

export const useDownload = (results: SubmissionResult[], lecturers: Lecturer[]) => {
    const downloadResults = () => {
        exportToCSV(results, lecturers);
    };

    const downloadXLSX = async () => {
        await exportToXLSX(results, lecturers);
    };

    return {
        downloadResults,
        downloadXLSX
    };
};

/**
 * Local types for Step4Results module
 */

import { SubmissionResult, Lecturer } from '@/types/logbook';

export interface Step4ResultsProps {
    results: SubmissionResult[];
    lecturers: Lecturer[];
    onDownloadCSV: () => void;
    onDownloadXLSX: () => void;
    onStartOver: () => void;
}

export type ExportFormat = 'csv' | 'xlsx';

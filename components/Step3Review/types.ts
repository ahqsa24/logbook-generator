/**
 * Local types and interfaces for Step3Review module
 */

import { LogbookEntry, Lecturer } from '@/types/logbook';

// Re-export commonly used types
export type { LogbookEntry, Lecturer };

// Component prop types
export interface Step3ReviewProps {
    entries: LogbookEntry[];
    isSubmitting: boolean;
    hasSubmitted: boolean;
    currentSubmission: number;
    lecturers: Lecturer[];
    onFileUpload: (index: number, file: File) => void;
    onSubmit: () => void;
    onBack: () => void;
    onUpdateEntry: (index: number, updatedEntry: LogbookEntry) => void;
    onAddEntry: (newEntry: LogbookEntry) => void;
    onDeleteEntry: (index: number) => void;
    onDeleteAll?: () => void;  // Optional: Delete all entries at once
}

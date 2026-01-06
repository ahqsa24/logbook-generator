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
    onAdditionalFileUpload?: (file: File) => void;  // NEW: Upload additional files in Step 3
    uploadedFiles?: Array<{                         // NEW: List of uploaded files
        name: string;
        entriesCount: number;
        uploadedAt: string;
        status: 'success' | 'error';
        source: 'step2' | 'step3';
    }>;
    isUploadingFile?: boolean;                      // NEW: Upload loading state
    uploadError?: string | null;                    // NEW: Upload error message
    onRemoveUploadedFile?: (fileName: string) => void;  // NEW: Remove uploaded file and its entries
    duplicateWarning?: {                            // NEW: Duplicate detection warning
        duplicates: any[];
        newEntries: LogbookEntry[];
        fileName: string;
    } | null;
    onSkipDuplicates?: () => void;                  // NEW: Skip duplicate entries
    onKeepAllDuplicates?: () => void;               // NEW: Keep all including duplicates
    onCancelDuplicate?: () => void;                 // NEW: Cancel upload
    onKeepSelectedDuplicates?: (selectedIndices: number[]) => void;  // NEW: Keep selected duplicates
    onSubmit: () => void;
    onBack: () => void;
    onUpdateEntry: (index: number, updatedEntry: LogbookEntry) => void;
    onAddEntry: (newEntry: LogbookEntry) => void;
    onDeleteEntry: (index: number) => void;
    onDeleteAll?: () => void;  // Optional: Delete all entries at once
}


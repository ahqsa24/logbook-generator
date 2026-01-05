/**
 * Custom hook for entry validation logic
 */

import { LogbookEntry, Lecturer } from '@/types/logbook';
import { validateLogbookEntry } from '@/lib/validation';

interface UseEntryValidationProps {
    entries: LogbookEntry[];
    lecturers: Lecturer[];
    newEntry: LogbookEntry | null;
    editedEntry: LogbookEntry | null;
}

interface UseEntryValidationReturn {
    validationResults: ReturnType<typeof validateLogbookEntry>[];
    hasErrors: boolean;
    allEntriesEmpty: boolean;
    isNewEntryValid: boolean;
    isEditedEntryValid: boolean;
    errorIndices: number[];
    newEntryValidation: ReturnType<typeof validateLogbookEntry> | null;
    editedEntryValidation: ReturnType<typeof validateLogbookEntry> | null;
}

export const useEntryValidation = ({
    entries,
    lecturers,
    newEntry,
    editedEntry
}: UseEntryValidationProps): UseEntryValidationReturn => {
    const maxDosen = lecturers.length > 0 ? lecturers.length : 1;

    // Validate all entries
    const validationResults = entries.map(entry => {
        const result = validateLogbookEntry(entry, maxDosen);
        return result;
    });

    const hasErrors = validationResults.some(result => !result.isValid);

    // Check if entries array is empty OR all entries have empty required fields
    const allEntriesEmpty = entries.length === 0 || entries.every(entry => {
        return !entry.Waktu?.trim() &&
            !entry.Tstart?.trim() &&
            !entry.Tend?.trim() &&
            !entry.Lokasi?.trim() &&
            !entry.Keterangan?.trim();
    });

    // Identify entries with errors for jump functionality
    const errorIndices = validationResults
        .map((result, idx) => !result.isValid ? idx : -1)
        .filter(idx => idx !== -1);

    // Validation for new entry
    const newEntryValidation = newEntry ? validateLogbookEntry(newEntry, maxDosen) : null;

    const isNewEntryValid = (() => {
        if (!newEntry) return false;

        const hasRequiredFields =
            newEntry.Waktu?.trim() &&
            newEntry.Tstart?.trim() &&
            newEntry.Tend?.trim() &&
            newEntry.Lokasi?.trim() &&
            newEntry.Keterangan?.trim();

        if (!hasRequiredFields) return false;

        return newEntryValidation?.isValid ?? false;
    })();

    // Validation for edited entry
    const editedEntryValidation = editedEntry ? validateLogbookEntry(editedEntry, maxDosen) : null;

    const isEditedEntryValid = (() => {
        if (!editedEntry) return false;

        const hasRequiredFields =
            editedEntry.Waktu?.trim() &&
            editedEntry.Tstart?.trim() &&
            editedEntry.Tend?.trim() &&
            editedEntry.Lokasi?.trim() &&
            editedEntry.Keterangan?.trim();

        if (!hasRequiredFields) return false;

        return editedEntryValidation?.isValid ?? false;
    })();

    return {
        validationResults,
        hasErrors,
        allEntriesEmpty,
        isNewEntryValid,
        isEditedEntryValid,
        errorIndices,
        newEntryValidation,
        editedEntryValidation
    };
};

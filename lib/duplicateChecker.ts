import { LogbookEntry } from '@/types/logbook';

export interface DuplicateEntry {
    existingIndex: number;
    newEntry: LogbookEntry;
    matchFields: string[];
}

/**
 * Find duplicate entries between existing and new entries
 * Duplicates are identified by matching: Date, Start Time, End Time, and Description
 */
export const findDuplicates = (
    existingEntries: LogbookEntry[],
    newEntries: LogbookEntry[]
): DuplicateEntry[] => {
    const duplicates: DuplicateEntry[] = [];

    newEntries.forEach(newEntry => {
        existingEntries.forEach((existing, index) => {
            const matchFields: string[] = [];

            // Check if all key fields match
            if (existing.Waktu === newEntry.Waktu) {
                matchFields.push('Date');
            }
            if (existing.Tstart === newEntry.Tstart) {
                matchFields.push('Start Time');
            }
            if (existing.Tend === newEntry.Tend) {
                matchFields.push('End Time');
            }
            if (existing.Keterangan?.trim() === newEntry.Keterangan?.trim()) {
                matchFields.push('Description');
            }

            // If all 4 fields match, it's a duplicate
            if (matchFields.length === 4) {
                duplicates.push({
                    existingIndex: index,
                    newEntry,
                    matchFields
                });
            }
        });
    });

    return duplicates;
};

/**
 * Remove duplicate entries from new entries array
 */
export const removeDuplicates = (
    newEntries: LogbookEntry[],
    duplicates: DuplicateEntry[]
): LogbookEntry[] => {
    const duplicateNewEntries = new Set(
        duplicates.map(d => d.newEntry)
    );

    return newEntries.filter(entry => !duplicateNewEntries.has(entry));
};

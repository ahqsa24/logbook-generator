/**
 * Dosen name conversion utilities
 */

import { Lecturer } from '@/types/logbook';

export const getDosenNames = (dosenStr: string | undefined, lecturers: Lecturer[]): string => {
    if (!dosenStr || dosenStr.trim() === '') return '-';

    if (lecturers.length === 0) {
        // Fallback to numbers if lecturers not loaded
        return dosenStr;
    }

    // Parse comma-separated IDs and convert to names
    return dosenStr
        .split(',')
        .map(id => {
            const lecturerId = parseInt(id.trim(), 10);
            const lecturer = lecturers.find(l => l.id === lecturerId);
            return lecturer ? lecturer.name : `Dosen ${id}`;
        })
        .join(', ');
};

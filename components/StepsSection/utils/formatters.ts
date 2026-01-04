/**
 * Data formatters and label helpers
 */

import { Lecturer } from '@/types/logbook';

export const getJenisLogLabel = (id: number): string => {
    const labels = { 1: 'Pembimbingan', 2: 'Ujian', 3: 'Kegiatan' };
    return labels[id as keyof typeof labels] || String(id);
};

export const getModeLabel = (mode: number): string => {
    const labels = { 0: 'Online', 1: 'Offline', 2: 'Hybrid' };
    return labels[mode as keyof typeof labels] || String(mode);
};

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

export const escapeCSV = (field: string | undefined | null): string => {
    if (!field) return '';
    const str = String(field);
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

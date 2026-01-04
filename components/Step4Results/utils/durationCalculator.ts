/**
 * Duration calculation utilities
 */

import { SubmissionResult } from '@/types/logbook';

export const calculateTotalDuration = (results: SubmissionResult[]): number => {
    return results
        .filter((r) => r.status === 'success' && r.entry)
        .reduce((total, r) => {
            const entry = r.entry!;
            if (entry.Tstart && entry.Tend) {
                // Parse time strings (HH:MM format)
                const [startHour, startMin] = entry.Tstart.split(':').map(Number);
                const [endHour, endMin] = entry.Tend.split(':').map(Number);

                // Convert to minutes
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;

                // Calculate duration in hours
                const durationMinutes = endMinutes - startMinutes;
                const durationHours = durationMinutes / 60;

                return total + durationHours;
            }
            return total;
        }, 0);
};

/**
 * Date formatting utilities for Step3Review
 */

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD for HTML5 date input
 */
export const formatDateForInput = (ddmmyyyy: string): string => {
    if (!ddmmyyyy || !ddmmyyyy.includes('/')) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Convert YYYY-MM-DD to DD/MM/YYYY for display
 */
export const formatDateForDisplay = (yyyymmdd: string): string => {
    if (!yyyymmdd || !yyyymmdd.includes('-')) return yyyymmdd;
    const parts = yyyymmdd.split('-');
    if (parts.length !== 3) return yyyymmdd;
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

/**
 * Auto-format time input (8 → 08:00, 0800 → 08:00, 830 → 08:30)
 */
export const formatTimeInput = (input: string): string => {
    if (!input) return '';
    const cleaned = input.replace(/[^\d]/g, '');
    if (cleaned.length === 0) return '';

    if (cleaned.length === 1 || cleaned.length === 2) {
        const hour = cleaned.padStart(2, '0');
        return `${hour}:00`;
    }

    if (cleaned.length === 3) {
        const hour = cleaned.substring(0, 1).padStart(2, '0');
        const minute = cleaned.substring(1, 3);
        return `${hour}:${minute}`;
    }

    if (cleaned.length >= 4) {
        const hour = cleaned.substring(0, 2);
        const minute = cleaned.substring(2, 4);
        return `${hour}:${minute}`;
    }

    return input;
};

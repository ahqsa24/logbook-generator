/**
 * Validation utilities for Step3Review
 */

/**
 * Validate select value and return default if invalid
 */
export const validateSelectValue = (
    value: number,
    validValues: number[],
    defaultValue: number
): number => {
    return validValues.includes(value) ? value : defaultValue;
};

/**
 * Validate Dosen input - ensure values are between 1 and maxDosen
 * Filters out invalid IDs and returns comma-separated valid IDs
 */
export const validateDosenInput = (
    dosenString: string | undefined,
    maxDosen: number
): string => {
    if (!dosenString || dosenString.trim() === '') {
        return ''; // Empty is allowed (optional field)
    }

    // Parse comma-separated IDs
    const ids = dosenString
        .split(',')
        .map(id => {
            const parsed = parseInt(id.trim(), 10);
            return isNaN(parsed) ? null : parsed;
        })
        .filter((id): id is number => id !== null);

    if (ids.length === 0) {
        return '1'; // Default to 1 if no valid IDs
    }

    // Filter to only valid IDs (1 to maxDosen)
    const validIds = ids.filter(id => id >= 1 && id <= maxDosen);

    if (validIds.length === 0) {
        return '1'; // Default to 1 if all IDs are invalid
    }

    // Sort and remove duplicates
    const uniqueIds = Array.from(new Set(validIds)).sort((a, b) => a - b);
    return uniqueIds.join(',');
};

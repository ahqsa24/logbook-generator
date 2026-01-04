/**
 * URL validation and Aktivitas ID extraction utilities
 */

interface ValidationResult {
    isValid: boolean;
    id: string;
    error: string;
}

export const validateAndExtractAktivitasId = (input: string): ValidationResult => {
    const trimmedInput = input.trim();

    // Empty input is valid (no error shown)
    if (trimmedInput === '') {
        return { isValid: true, id: '', error: '' };
    }

    // MUST be a URL containing studentportal.ipb.ac.id
    if (!trimmedInput.includes('studentportal.ipb.ac.id')) {
        return {
            isValid: false,
            id: '',
            error: 'Only links from studentportal.ipb.ac.id are accepted'
        };
    }

    // Extract ID from URL pattern: .../Index/[ID]
    const match = trimmedInput.match(/\/Index\/([^/?#]+)/);
    if (match && match[1]) {
        return { isValid: true, id: match[1], error: '' };
    } else {
        return {
            isValid: false,
            id: '',
            error: 'Invalid URL format. Use: .../Index/[Aktivitas ID]'
        };
    }
};

/**
 * Cookie parsing and formatting utilities
 */

export const parseCookieInput = (input: string): string => {
    if (!input) return '';

    const trimmed = input.trim();

    // If user pasted full cookie (name=value)
    if (trimmed.includes('=')) {
        return trimmed;
    }

    // If user pasted just the value
    return `.AspNetCore.Cookies=${trimmed}`;
};

export const validateCookieValue = (value: string): boolean => {
    if (!value) return false;

    // Cookie value should be a long encrypted string
    // Usually starts with CfDJ8
    return value.length > 50;
};

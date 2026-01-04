/**
 * Local types for Step1Authentication module
 */

export interface Step1AuthenticationProps {
    onSubmit: (aktivitasId: string, cookieString: string) => void;
}

export type AuthMethod = 'login' | 'manual';

export interface ValidationResult {
    isValid: boolean;
    id: string;
    error: string;
}

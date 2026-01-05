/**
 * Local types for Step1Authentication module
 */

import { CookieData } from '@/types/logbook';

export interface Step1AuthenticationProps {
    onSubmit: (aktivitasId: string, cookieString: string) => void;
    savedAktivitasId?: string;
    savedCookies?: CookieData | null;
}

export type AuthMethod = 'login' | 'manual';

export interface ValidationResult {
    isValid: boolean;
    id: string;
    error: string;
}


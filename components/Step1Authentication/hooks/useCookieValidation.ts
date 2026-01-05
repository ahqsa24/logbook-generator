/**
 * Custom hook for URL and cookie validation
 */

import { useState, useEffect } from 'react';
import { validateAndExtractAktivitasId } from '../utils';

interface UseCookieValidationOptions {
    initialAktivitasId?: string;
}

export const useCookieValidation = (options?: UseCookieValidationOptions) => {
    const [aktivitasId, setAktivitasId] = useState('');
    const [urlError, setUrlError] = useState('');
    const [rawInput, setRawInput] = useState('');

    // Initialize with saved aktivitasId if provided
    useEffect(() => {
        if (options?.initialAktivitasId && !aktivitasId) {
            setAktivitasId(options.initialAktivitasId);
            setRawInput(options.initialAktivitasId);
        }
    }, [options?.initialAktivitasId]);

    const handleAktivitasIdChange = (input: string) => {
        setRawInput(input);
        const validation = validateAndExtractAktivitasId(input);

        if (validation.isValid) {
            setAktivitasId(validation.id);
            setUrlError('');
        } else {
            setAktivitasId('');
            setUrlError(validation.error);
        }
    };

    return {
        aktivitasId,
        urlError,
        rawInput,
        handleAktivitasIdChange,
        setRawInput,
    };
};

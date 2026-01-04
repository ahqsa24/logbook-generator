/**
 * Custom hook for URL and cookie validation
 */

import { useState } from 'react';
import { validateAndExtractAktivitasId } from '../utils';

export const useCookieValidation = () => {
    const [aktivitasId, setAktivitasId] = useState('');
    const [urlError, setUrlError] = useState('');
    const [rawInput, setRawInput] = useState('');

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
        handleAktivitasIdChange
    };
};

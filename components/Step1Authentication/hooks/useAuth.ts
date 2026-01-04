/**
 * Custom hook for authentication logic
 */

import { useState } from 'react';
import type { AuthMethod } from '../types';

export const useAuth = (onSubmit: (aktivitasId: string, cookieString: string) => void) => {
    // Auth method state
    const [authMethod, setAuthMethod] = useState<AuthMethod>('login');

    // Login method states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState('');

    // Manual method states
    const [aspNetCoreCookies, setAspNetCoreCookies] = useState('');

    const handleLogin = async (aktivitasId: string) => {
        if (!aktivitasId || !username || !password) {
            setError('Please fill all fields');
            return;
        }

        setIsLoggingIn(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    aktivitasId
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onSubmit(aktivitasId, data.cookies);
            } else {
                setError(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleManualSubmit = (aktivitasId: string, cookieInput: string) => {
        let cookieString = '';

        if (cookieInput) {
            if (cookieInput.includes('=')) {
                cookieString = cookieInput;
            } else {
                cookieString = `.AspNetCore.Cookies=${cookieInput}`;
            }
        }

        cookieString = cookieString.trim();
        onSubmit(aktivitasId, cookieString);
    };

    return {
        authMethod,
        setAuthMethod,
        username,
        setUsername,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        isLoggingIn,
        error,
        setError,
        aspNetCoreCookies,
        setAspNetCoreCookies,
        handleLogin,
        handleManualSubmit
    };
};

'use client';

import { useState } from 'react';

interface Step1AuthenticationProps {
    onSubmit: (aktivitasId: string, cookieString: string) => void;
}

export default function Step1Authentication({ onSubmit }: Step1AuthenticationProps) {
    const [aktivitasId, setAktivitasId] = useState('');
    const [urlError, setUrlError] = useState('');
    const [rawInput, setRawInput] = useState('');

    // Helper function to validate and extract Aktivitas ID from URL
    const validateAndExtractAktivitasId = (input: string): { isValid: boolean; id: string; error: string } => {
        const trimmedInput = input.trim();

        // Empty input is valid (not yet filled)
        if (!trimmedInput) {
            return { isValid: true, id: '', error: '' };
        }

        // Check if input looks like a URL (contains http/https or domain)
        const isUrl = trimmedInput.includes('http') || trimmedInput.includes('studentportal') || trimmedInput.includes('://');

        if (isUrl) {
            // Must be from studentportal.ipb.ac.id
            if (!trimmedInput.includes('studentportal.ipb.ac.id')) {
                return {
                    isValid: false,
                    id: '',
                    error: 'URL must be from studentportal.ipb.ac.id domain'
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
                    error: 'Format URL tidak valid. Gunakan format: .../Index/[Aktivitas ID] / Invalid URL format. Use: .../Index/[Aktivitas ID]'
                };
            }
        }

        // If not a URL, assume it's just the ID (valid)
        return { isValid: true, id: trimmedInput, error: '' };
    };

    // Handle input change with validation
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

    const [authMethod, setAuthMethod] = useState<'login' | 'manual'>('login');

    // Login method states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState('');

    // Manual method states
    const [aspNetCoreCookies, setAspNetCoreCookies] = useState('');

    const handleLogin = async () => {
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

    const handleManualSubmit = () => {
        // Build cookie string - only need .AspNetCore.Cookies
        let cookieString = '';

        if (aspNetCoreCookies) {
            if (aspNetCoreCookies.includes('=')) {
                // User pasted full cookie (name=value)
                cookieString = aspNetCoreCookies;
            } else {
                // User pasted just the value
                cookieString = `.AspNetCore.Cookies=${aspNetCoreCookies}`;
            }
        }

        cookieString = cookieString.trim();
        onSubmit(aktivitasId, cookieString);
    };

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Step 1: Authentication
            </h2>

            {/* Method Selector */}
            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => setAuthMethod('login')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${authMethod === 'login'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    Username & Password
                    <span className="block text-xs mt-1 opacity-80">Recommended</span>
                </button>
                <button
                    onClick={() => setAuthMethod('manual')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${authMethod === 'manual'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    Manual Cookies
                    <span className="block text-xs mt-1 opacity-80">Advanced</span>
                </button>
            </div>

            {/* Aktivitas ID (common for both methods) */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aktivitas ID <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={rawInput}
                    onChange={(e) => handleAktivitasIdChange(e.target.value)}
                    placeholder="Paste full URL or just the ID (e.g., b4sAPiIYStKqwF_UFVMTzrjO0wUHqIw27KJW2pQg5tc)"
                    className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm ${urlError ? 'border-red-500 dark:border-red-500' : ''
                        }`}
                    disabled={isLoggingIn}
                />
                {urlError ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                        ❌ {urlError}
                    </p>
                ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 You can paste the full URL or just the ID from: .../Index/<strong>[Aktivitas ID]</strong>
                    </p>
                )}
                {aktivitasId && !urlError && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                        ✅ Aktivitas ID: {aktivitasId}
                    </p>
                )}
            </div>

            {/* Method 1: Username & Password */}
            {authMethod === 'login' && (
                <div className="space-y-4">
                    {/* Security Notice */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-600 rounded-lg">
                        <div className="flex gap-3">
                            <div className="text-2xl">🔒</div>
                            <div className="flex-1">
                                <h3 className="font-bold text-green-900 dark:text-green-300 mb-1 text-sm">
                                    Your Data is Safe
                                </h3>
                                <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                                    <li>✅ Credentials are NEVER stored</li>
                                    <li>✅ Direct login to IPB Portal</li>
                                    <li>✅ Temporary session only</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            IPB Username <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your IPB username"
                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm"
                            disabled={isLoggingIn}
                            autoComplete="username"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            IPB Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your IPB password"
                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm"
                            disabled={isLoggingIn}
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">
                                ❌ {error}
                            </p>
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        disabled={!aktivitasId || !username || !password || isLoggingIn}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoggingIn ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : (
                            'Login & Continue'
                        )}
                    </button>
                </div>
            )}

            {/* Method 2: Manual Cookies */}
            {authMethod === 'manual' && (
                <div className="space-y-4">
                    {/* Instructions */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm">
                            📍 How to get the cookie:
                        </h3>
                        <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                            <li>Login to IPB Student Portal</li>
                            <li>Press <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">Ctrl + Shift + i</kbd> → <strong>Application</strong> tab</li>
                            <li>Expand <strong>Cookies</strong> → <strong>studentportal.ipb.ac.id</strong></li>
                            <li>Find <strong>.AspNetCore.Cookies</strong></li>
                            <li><strong>Copy ONLY the Value column</strong> (not the Name!)</li>
                        </ol>
                    </div>

                    {/* .AspNetCore.Cookies */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            .AspNetCore.Cookies <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={aspNetCoreCookies}
                            onChange={(e) => setAspNetCoreCookies(e.target.value)}
                            placeholder="Paste the VALUE only (starts with CfDJ8...)"
                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            💡 This is a long encrypted string, usually starts with <strong>CfDJ8</strong>
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleManualSubmit}
                        disabled={!aktivitasId || !aspNetCoreCookies}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue to File Upload
                    </button>
                </div>
            )}
        </div>
    );
}
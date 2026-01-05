'use client';

import { useState, useEffect } from 'react';
import { useAuth, useCookieValidation } from './Step1Authentication/hooks';
import { PrivacyNotice, UsernamePasswordForm, ManualCookieInput } from './Step1Authentication/components';
import type { Step1AuthenticationProps } from './Step1Authentication/types';

export default function Step1Authentication({ onSubmit, savedAktivitasId, savedCookies }: Step1AuthenticationProps) {
    const [hasSavedSession, setHasSavedSession] = useState(false);

    // Use custom hooks with saved data
    const {
        aktivitasId,
        urlError,
        rawInput,
        handleAktivitasIdChange
    } = useCookieValidation({ initialAktivitasId: savedAktivitasId });

    const {
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
        aspNetCoreCookies,
        setAspNetCoreCookies,
        handleLogin,
        handleManualSubmit
    } = useAuth(onSubmit);

    // Check if there's saved session data
    useEffect(() => {
        if (savedAktivitasId && savedCookies) {
            setHasSavedSession(true);
        }
    }, [savedAktivitasId, savedCookies]);

    // Handle resume with saved session
    const handleResumeSession = () => {
        if (savedAktivitasId && savedCookies) {
            // Convert cookies object to string format expected by onSubmit
            const cookieString = Object.entries(savedCookies)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
            onSubmit(savedAktivitasId, cookieString);
        }
    };

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Step 1: Authentication
            </h2>

            <PrivacyNotice />

            {/* Resume Session Banner - Show if there's saved session */}
            {hasSavedSession && (
                <div className="mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg overflow-hidden">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-green-800 dark:text-green-300 text-sm sm:text-base">
                                    Previous Session Found
                                </p>
                                <div className="text-xs sm:text-sm text-green-700 dark:text-green-400 mt-1 overflow-hidden">
                                    <span className="block mb-1">Aktivitas ID:</span>
                                    <code className="block bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs break-all max-w-full overflow-wrap-anywhere">
                                        {savedAktivitasId}
                                    </code>
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                                    You can continue with your previous session or start fresh below.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleResumeSession}
                            className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
                        >
                            Resume Session →
                        </button>
                    </div>
                </div>
            )}

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
                    placeholder="Paste the full URL from IPB Student Portal (e.g., https://studentportal.ipb.ac.id/.../Index/abc123)"
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
                        💡 Paste the complete URL from your browser&apos;s address bar when viewing the logbook activity page
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
                <UsernamePasswordForm
                    username={username}
                    setUsername={setUsername}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    isLoggingIn={isLoggingIn}
                    error={error}
                    onSubmit={() => handleLogin(aktivitasId)}
                    isDisabled={!aktivitasId || !username || !password || isLoggingIn}
                />
            )}

            {/* Method 2: Manual Cookies */}
            {authMethod === 'manual' && (
                <ManualCookieInput
                    aspNetCoreCookies={aspNetCoreCookies}
                    setAspNetCoreCookies={setAspNetCoreCookies}
                    onSubmit={() => handleManualSubmit(aktivitasId, aspNetCoreCookies)}
                    isDisabled={!aktivitasId || !aspNetCoreCookies}
                />
            )}
        </div>
    );
}
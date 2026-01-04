'use client';

import { useState } from 'react';
import { useAuth, useCookieValidation } from './Step1Authentication/hooks';
import { PrivacyNotice, UsernamePasswordForm, ManualCookieInput } from './Step1Authentication/components';
import type { Step1AuthenticationProps } from './Step1Authentication/types';

export default function Step1Authentication({ onSubmit }: Step1AuthenticationProps) {
    // Use custom hooks
    const {
        aktivitasId,
        urlError,
        rawInput,
        handleAktivitasIdChange
    } = useCookieValidation();

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

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Step 1: Authentication
            </h2>

            <PrivacyNotice />

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
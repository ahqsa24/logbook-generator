'use client';

import { useState } from 'react';

interface Step1AuthenticationProps {
    onSubmit: (aktivitasId: string, cookieString: string) => void;
}

export default function Step1Authentication({ onSubmit }: Step1AuthenticationProps) {
    const [aktivitasId, setAktivitasId] = useState('');
    const [aspNetCoreSession, setAspNetCoreSession] = useState('');
    const [aspNetCoreCookies, setAspNetCoreCookies] = useState('');
    const [aspNetCoreAntiforgery, setAspNetCoreAntiforgery] = useState('');

    const handleSubmit = () => {
        if (aktivitasId && aspNetCoreSession && aspNetCoreCookies && aspNetCoreAntiforgery) {
            // Combine the three cookies into the format the backend expects
            const cookieString = `AspNetCore.Session=${aspNetCoreSession}; AspNetCore.Cookies=${aspNetCoreCookies}; .AspNetCore.Antiforgery=${aspNetCoreAntiforgery}`;
            onSubmit(aktivitasId, cookieString);
        }
    };

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Step 1: Authentication
            </h2>

            {/* Aktivitas ID Section */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aktivitas ID
                </label>
                <input
                    type="text"
                    value={aktivitasId}
                    onChange={(e) => setAktivitasId(e.target.value)}
                    placeholder="e.g., b4sAPiIYStKqwF_UFVMTzrjO0wUHqIw27KJW2pQg5tc"
                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-base"
                />

                {/* Aktivitas ID Help */}
                <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        📍 How to get Aktivitas ID:
                    </p>
                    <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                        <li>Login to IPB Student Portal</li>
                        <li>Go to <strong>Student Portal</strong> → <strong>Log Aktivitas</strong></li>
                        <li>Look at the URL in your browser's address bar</li>
                        <li>Copy the text <strong>after</strong> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/Index/</code></li>
                    </ol>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                        Example URL: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
                            https://studentportal.ipb.ac.id/.../Index/<strong>b4sAPiIYStKqwF...</strong>
                        </code>
                    </p>
                </div>
            </div>

            {/* Session Cookies Section */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">Session Cookies</h3>

                {/* Cookie Instructions */}
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                        🍪 How to get Session Cookies:
                    </p>
                    <ol className="text-sm text-green-800 dark:text-green-200 space-y-2 list-decimal list-inside">
                        <li>Make sure you're logged in to IPB Student Portal</li>
                        <li>On the logbook page, press <kbd className="px-2 py-1 bg-green-100 dark:bg-green-800 rounded border border-green-300 dark:border-green-600 text-xs font-mono">F12</kbd> to open DevTools</li>
                        <li>Click the <strong>Application</strong> tab (not Console!)</li>
                        <li>In the left sidebar, expand <strong>Cookies</strong></li>
                        <li>Click on <code className="bg-green-100 dark:bg-green-800 px-1 rounded">studentportal.ipb.ac.id</code></li>
                        <li>Find and copy the <strong>Value</strong> column for each cookie below</li>
                    </ol>
                </div>

                {/* AspNetCore.Session */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        AspNetCore.Session <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={aspNetCoreSession}
                        onChange={(e) => setAspNetCoreSession(e.target.value)}
                        placeholder="Paste the Value of AspNetCore.Session cookie"
                        className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-base"
                    />
                </div>

                {/* AspNetCore.Cookies */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        AspNetCore.Cookies <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={aspNetCoreCookies}
                        onChange={(e) => setAspNetCoreCookies(e.target.value)}
                        placeholder="Paste the Value of AspNetCore.Cookies cookie"
                        className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-base"
                    />
                </div>

                {/* .AspNetCore.Antiforgery */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        .AspNetCore.Antiforgery <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={aspNetCoreAntiforgery}
                        onChange={(e) => setAspNetCoreAntiforgery(e.target.value)}
                        placeholder="Paste the Value of .AspNetCore.Antiforgery cookie"
                        className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-base"
                    />
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ⚠️ <strong>Important:</strong> Copy only the <strong>Value</strong> column, not the cookie name!
                </p>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!aktivitasId || !aspNetCoreSession || !aspNetCoreCookies || !aspNetCoreAntiforgery}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Continue to File Upload
            </button>
        </div>
    );
}

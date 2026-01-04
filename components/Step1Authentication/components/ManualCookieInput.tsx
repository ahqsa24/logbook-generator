/**
 * Manual Cookie Input Component
 */

interface ManualCookieInputProps {
    aspNetCoreCookies: string;
    setAspNetCoreCookies: (value: string) => void;
    onSubmit: () => void;
    isDisabled: boolean;
}

export const ManualCookieInput = ({
    aspNetCoreCookies,
    setAspNetCoreCookies,
    onSubmit,
    isDisabled
}: ManualCookieInputProps) => {
    // Validate cookie format
    const isCookieValid = aspNetCoreCookies.trim().length > 0 && aspNetCoreCookies.trim().startsWith('CfDJ8');
    const showValidation = aspNetCoreCookies.trim().length > 0;

    return (
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
                    rows={6}
                    value={aspNetCoreCookies}
                    onChange={(e) => setAspNetCoreCookies(e.target.value)}
                    placeholder="Paste the VALUE only (starts with CfDJ8...)"
                    className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 text-sm`}
                />
                {showValidation && !isCookieValid ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                        ❌ Invalid cookie format. Cookie must start with "CfDJ8"
                    </p>
                ) : showValidation && isCookieValid ? (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                        ✅ Cookie format is valid
                    </p>
                ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 This is a long encrypted string, usually starts with <strong>CfDJ8</strong>
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                onClick={onSubmit}
                disabled={isDisabled || !isCookieValid}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Continue to File Upload
            </button>
        </div>
    );
};

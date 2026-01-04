/**
 * Privacy Notice Component
 */

export const PrivacyNotice = () => {
    return (
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-xl shadow-sm">
            <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">🛡️</div>
                <div className="flex-1">
                    <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2 text-lg">
                        Your Privacy is Protected
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        The authentication data you provide (username, password, or cookies) is <strong>not stored on our servers</strong> and is <strong>only used temporarily</strong> to generate logbook entries to IPB Student Portal.
                    </p>
                </div>
            </div>
        </div>
    );
};

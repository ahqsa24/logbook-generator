'use client';

import { HelpCircle } from 'lucide-react';
import { useTutorial } from '@/lib/TutorialContext';

export default function TutorialButton() {
    const { openTutorial, hasSeenTutorial } = useTutorial();

    return (
        <button
            onClick={openTutorial}
            className="fixed top-3 right-16 md:top-4 md:right-20 z-50 p-2 md:p-3 rounded-full bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Open tutorial"
            title="Tutorial"
        >
            <div className="relative">
                <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />

                {/* Badge for first-time users */}
                {!hasSeenTutorial && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
            </div>
        </button>
    );
}

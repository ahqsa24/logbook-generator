'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTutorial } from '@/lib/TutorialContext';
import { tutorialSteps } from './tutorialSteps';
import TutorialStep from './TutorialStep';
import TutorialNavigation from './TutorialNavigation';

export default function TutorialModal() {
    const { isOpen, currentStep, closeTutorial } = useTutorial();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const currentStepData = tutorialSteps[currentStep];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
                onClick={closeTutorial}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-slideUp"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={closeTutorial}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close tutorial"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Progress indicator */}
                    <div className="h-1 bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-full bg-purple-600 transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <TutorialStep step={currentStepData} />
                    </div>

                    {/* Navigation */}
                    <TutorialNavigation
                        currentStep={currentStep}
                        totalSteps={tutorialSteps.length}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
}

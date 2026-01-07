import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useTutorial } from '@/lib/TutorialContext';

interface TutorialNavigationProps {
    currentStep: number;
    totalSteps: number;
}

export default function TutorialNavigation({ currentStep, totalSteps }: TutorialNavigationProps) {
    const { nextStep, previousStep, markAsCompleted, closeTutorial } = useTutorial();

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
                {/* Previous button */}
                <button
                    onClick={previousStep}
                    disabled={isFirstStep}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isFirstStep
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                </button>

                {/* Step indicators */}
                <div className="flex gap-2">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                    ? 'bg-purple-600 w-6'
                                    : index < currentStep
                                        ? 'bg-purple-400'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        />
                    ))}
                </div>

                {/* Next/Finish button */}
                {isLastStep ? (
                    <button
                        onClick={markAsCompleted}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Check className="w-5 h-5" />
                        Got it!
                    </button>
                ) : (
                    <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Next
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Skip button */}
            <div className="mt-4 text-center">
                <button
                    onClick={closeTutorial}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                    Skip tutorial
                </button>
            </div>
        </div>
    );
}

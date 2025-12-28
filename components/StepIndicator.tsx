'use client';

interface StepIndicatorProps {
    currentStep: number;
}

const steps = [
    { number: 1, label: 'Authentication' },
    { number: 2, label: 'Upload File' },
    { number: 3, label: 'Review' },
    { number: 4, label: 'Results' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    {/* Step Circle */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`
                                w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
                                ${currentStep >= step.number
                                    ? 'bg-purple-600 text-white shadow-lg scale-110'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }
                            `}
                        >
                            {currentStep > step.number ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                step.number
                            )}
                        </div>
                        <span
                            className={`
                                mt-2 text-sm font-medium transition-colors duration-300
                                ${currentStep >= step.number
                                    ? 'text-purple-700 dark:text-purple-400'
                                    : 'text-gray-500 dark:text-gray-500'
                                }
                            `}
                        >
                            {step.label}
                        </span>
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div
                            className={`
                                w-16 md:w-24 h-1 mx-2 transition-all duration-300 rounded-full
                                ${currentStep > step.number
                                    ? 'bg-purple-600'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }
                            `}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

import { TutorialStep as TutorialStepType } from './tutorialSteps';

interface TutorialStepProps {
    step: TutorialStepType;
}

export default function TutorialStep({ step }: TutorialStepProps) {
    return (
        <div className="min-h-[400px] max-h-[500px] flex flex-col items-center text-center overflow-y-auto px-4">
            {/* Step number badge */}
            <div className="mb-6 mt-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-200 dark:bg-purple-600 text-purple-600 dark:text-purple-200 font-bold text-lg">
                    {step.id}
                </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {step.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed mb-6">
                {step.description}
            </p>

            {/* Detailed bullet points */}
            {step.details && step.details.length > 0 && (
                <div className="w-full max-w-2xl text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                    <div className="space-y-1 text-sm md:text-base text-gray-700 dark:text-gray-300">
                        {step.details.map((detail, index) => {
                            // Check if it's a header (doesn't start with spaces or bullet)
                            const isHeader = !detail.startsWith('  ') && !detail.startsWith('•') && detail.trim() !== '';
                            const isEmpty = detail.trim() === '';

                            if (isEmpty) {
                                return <div key={index} className="h-2" />;
                            }

                            if (isHeader && detail.endsWith(':')) {
                                return (
                                    <div key={index} className="font-semibold text-purple-600 dark:text-purple-400 mt-3 first:mt-0">
                                        {detail}
                                    </div>
                                );
                            }

                            return (
                                <div key={index} className="pl-2 leading-relaxed">
                                    {detail}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Optional image/illustration */}
            {step.image && (
                <div className="mt-4 mb-6">
                    <img
                        src={step.image}
                        alt={step.title}
                        className="rounded-lg shadow-lg max-w-full h-auto"
                        onError={(e) => {
                            // Hide image if it fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            )}
        </div>
    );
}


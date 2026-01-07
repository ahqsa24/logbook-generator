'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TutorialContextType {
    isOpen: boolean;
    currentStep: number;
    hasSeenTutorial: boolean;
    openTutorial: () => void;
    closeTutorial: () => void;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: number) => void;
    markAsCompleted: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasSeenTutorial, setHasSeenTutorial] = useState(true); // Default true, will check localStorage

    useEffect(() => {
        // Check if user has seen tutorial
        const seen = localStorage.getItem('hasSeenTutorial');
        if (!seen) {
            setHasSeenTutorial(false);
            // Auto-open tutorial for first-time users after a delay
            setTimeout(() => {
                setIsOpen(true);
            }, 2000);
        }
    }, []);

    const openTutorial = () => {
        setIsOpen(true);
        setCurrentStep(0);
    };

    const closeTutorial = () => {
        setIsOpen(false);
        setCurrentStep(0);
    };

    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    const previousStep = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const markAsCompleted = () => {
        localStorage.setItem('hasSeenTutorial', 'true');
        setHasSeenTutorial(true);
        closeTutorial();
    };

    return (
        <TutorialContext.Provider value={{
            isOpen,
            currentStep,
            hasSeenTutorial,
            openTutorial,
            closeTutorial,
            nextStep,
            previousStep,
            goToStep,
            markAsCompleted
        }}>
            {children}
        </TutorialContext.Provider>
    );
}

export function useTutorial() {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial must be used within TutorialProvider');
    }
    return context;
}

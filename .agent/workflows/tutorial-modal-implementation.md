# Tutorial Modal - Implementation Plan

## 📋 Overview

Menambahkan tutorial modal interaktif yang menjelaskan step-by-step cara menggunakan IPB Logbook Generator. Tutorial akan muncul sebagai modal popup dengan navigasi next/previous dan dapat diakses kapan saja melalui button di samping dark mode toggle.

---

## 🎯 Goals

1. **Onboarding Experience**: Membantu user baru memahami cara menggunakan aplikasi
2. **Easy Access**: Button tutorial yang mudah diakses di pojok kanan atas
3. **Interactive**: Modal dengan navigasi step-by-step
4. **Persistent**: Menyimpan status tutorial (sudah pernah dilihat atau belum)
5. **Responsive**: Bekerja dengan baik di desktop dan mobile

---

## 🏗️ Architecture

### **Components Structure:**

```
components/
├── TutorialButton.tsx          # Button untuk membuka tutorial
├── TutorialModal/
│   ├── index.tsx              # Main tutorial modal component
│   ├── TutorialStep.tsx       # Individual step component
│   ├── TutorialNavigation.tsx # Next/Previous/Skip buttons
│   └── tutorialSteps.ts       # Tutorial content configuration
└── DarkModeToggle.tsx         # (existing - will be adjusted)
```

### **Context/State Management:**

```
lib/
└── TutorialContext.tsx        # Context for tutorial state
```

---

## 📝 Detailed Implementation

### **1. Tutorial Content Structure**

**File:** `components/TutorialModal/tutorialSteps.ts`

```typescript
export interface TutorialStep {
    id: number;
    title: string;
    description: string;
    image?: string; // Optional screenshot/illustration
    highlightElement?: string; // CSS selector to highlight
    position?: 'center' | 'top' | 'bottom'; // Modal position
}

export const tutorialSteps: TutorialStep[] = [
    {
        id: 1,
        title: "Welcome to IPB Logbook Generator",
        description: "Generate and submit your logbook entries automatically to IPB Student Portal in just 3 simple steps.",
        position: 'center'
    },
    {
        id: 2,
        title: "Step 1: Authentication",
        description: "Login with your IPB credentials or paste your session cookies. Your data is processed locally and never stored.",
        highlightElement: '#step-1',
        position: 'top'
    },
    {
        id: 3,
        title: "Step 2: Upload File",
        description: "Upload your logbook file (CSV, XLSX, or TXT). The system will automatically parse and validate your entries.",
        highlightElement: '#step-2',
        position: 'center'
    },
    {
        id: 4,
        title: "Step 3: Review & Submit",
        description: "Review your entries, make edits if needed, and submit to IPB Student Portal with one click.",
        highlightElement: '#step-3',
        position: 'center'
    },
    {
        id: 5,
        title: "Additional Features",
        description: "Download your logbook as CSV/XLSX/PDF, add manual entries, and track your submission history.",
        position: 'center'
    },
    {
        id: 6,
        title: "Need Help?",
        description: "You can access this tutorial anytime by clicking the tutorial button in the top right corner.",
        position: 'center'
    }
];
```

---

### **2. Tutorial Context**

**File:** `lib/TutorialContext.tsx`

```typescript
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
```

---

### **3. Tutorial Button Component**

**File:** `components/TutorialButton.tsx`

```typescript
'use client';

import { HelpCircle } from 'lucide-react';
import { useTutorial } from '@/lib/TutorialContext';

export default function TutorialButton() {
    const { openTutorial, hasSeenTutorial } = useTutorial();

    return (
        <button
            onClick={openTutorial}
            className="fixed top-3 right-16 md:top-4 md:right-20 z-50 p-2 md:p-3 rounded-full bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative"
            aria-label="Open tutorial"
            title="Tutorial"
        >
            <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            
            {/* Badge for first-time users */}
            {!hasSeenTutorial && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
        </button>
    );
}
```

---

### **4. Tutorial Modal Component**

**File:** `components/TutorialModal/index.tsx`

```typescript
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
```

---

### **5. Tutorial Step Component**

**File:** `components/TutorialModal/TutorialStep.tsx`

```typescript
import { TutorialStep as TutorialStepType } from './tutorialSteps';

interface TutorialStepProps {
    step: TutorialStepType;
}

export default function TutorialStep({ step }: TutorialStepProps) {
    return (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
            {/* Step number badge */}
            <div className="mb-6">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 font-bold text-lg">
                    {step.id}
                </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {step.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
                {step.description}
            </p>

            {/* Optional image/illustration */}
            {step.image && (
                <div className="mt-8">
                    <img
                        src={step.image}
                        alt={step.title}
                        className="rounded-lg shadow-lg max-w-full h-auto"
                    />
                </div>
            )}
        </div>
    );
}
```

---

### **6. Tutorial Navigation Component**

**File:** `components/TutorialModal/TutorialNavigation.tsx`

```typescript
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isFirstStep
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
                            className={`w-2 h-2 rounded-full transition-all ${
                                index === currentStep
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
```

---

## 🔧 Integration Steps

### **Step 1: Create Files**
1. Create `lib/TutorialContext.tsx`
2. Create `components/TutorialButton.tsx`
3. Create `components/TutorialModal/` directory with:
   - `index.tsx`
   - `TutorialStep.tsx`
   - `TutorialNavigation.tsx`
   - `tutorialSteps.ts`

### **Step 2: Update Layout**
Update `app/layout.tsx` to include TutorialProvider:

```typescript
import { TutorialProvider } from '@/lib/TutorialContext';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <LanguageProvider>
                    <TutorialProvider>
                        {children}
                    </TutorialProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
```

### **Step 3: Add Components to Page**
Update `app/page.tsx`:

```typescript
import TutorialButton from '@/components/TutorialButton';
import TutorialModal from '@/components/TutorialModal';

export default function Home() {
    return (
        <div>
            <TutorialButton />
            <TutorialModal />
            <DarkModeToggle />
            {/* ... rest of components */}
        </div>
    );
}
```

### **Step 4: Adjust DarkModeToggle Position**
Update `components/DarkModeToggle.tsx`:

```typescript
// Change from right-3 to right-3 (keep same, TutorialButton will be at right-16)
className="fixed top-3 right-3 md:top-4 md:right-4 z-50 ..."
```

---

## 🎨 Design Specifications

### **Colors:**
- Primary: Purple (`purple-600`)
- Background: White/Gray-900
- Text: Gray-900/Gray-100
- Accent: Purple-100/Purple-900

### **Animations:**
- Modal: Slide up + fade in (0.3s)
- Backdrop: Fade in (0.2s)
- Progress bar: Smooth transition (0.3s)
- Button hover: Scale 1.1 (0.3s)

### **Responsive:**
- Desktop: Max-width 768px (2xl)
- Mobile: Full width with padding
- Button: Smaller on mobile

---

## 📱 Features

### **Core Features:**
- ✅ Step-by-step tutorial with 6 steps
- ✅ Progress indicator (bar + dots)
- ✅ Next/Previous navigation
- ✅ Skip tutorial option
- ✅ Auto-show for first-time users
- ✅ Persistent state (localStorage)
- ✅ Accessible button in top-right corner
- ✅ Badge notification for new users

### **Optional Enhancements (Future):**
- 🔮 Element highlighting (spotlight effect)
- 🔮 Keyboard navigation (arrow keys)
- 🔮 Multi-language support
- 🔮 Video/GIF demonstrations
- 🔮 Interactive elements (click to try)
- 🔮 Analytics tracking

---

## 🧪 Testing Checklist

- [ ] Tutorial opens on first visit
- [ ] Tutorial can be opened via button
- [ ] Navigation works (next/previous)
- [ ] Progress indicator updates correctly
- [ ] Skip button works
- [ ] Close button works
- [ ] localStorage persists state
- [ ] Responsive on mobile
- [ ] Dark mode support
- [ ] Accessibility (keyboard navigation)

---

## 📊 File Size Estimate

- `TutorialContext.tsx`: ~2KB
- `TutorialButton.tsx`: ~1KB
- `TutorialModal/index.tsx`: ~3KB
- `TutorialStep.tsx`: ~1KB
- `TutorialNavigation.tsx`: ~2KB
- `tutorialSteps.ts`: ~2KB

**Total: ~11KB** (minimal impact)

---

## 🚀 Implementation Timeline

1. **Day 1**: Create context and basic modal structure
2. **Day 2**: Implement navigation and step components
3. **Day 3**: Add tutorial content and styling
4. **Day 4**: Integration and testing
5. **Day 5**: Polish and optimization

---

## 📝 Notes

- Tutorial content dapat di-customize sesuai kebutuhan
- Bisa ditambahkan screenshot/ilustrasi untuk setiap step
- Element highlighting bisa ditambahkan nanti jika diperlukan
- Multi-language support bisa menggunakan LanguageContext yang sudah ada

---

**Created**: January 7, 2026  
**Branch**: `feat/tutorial-modal`  
**Priority**: Medium  
**Complexity**: Medium

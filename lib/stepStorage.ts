/**
 * Step-based Storage Utility
 * 
 * Manages localStorage with granular control per step:
 * - Each step has its own storage key
 * - Going back clears subsequent steps
 * - Refresh preserves all data
 * - New input overwrites old data (no stacking)
 */

import { CookieData, LogbookEntry, SubmissionResult, Lecturer } from '@/types/logbook';

// Storage keys for each step
export const STORAGE_KEYS = {
    STEP1: 'ipb-logbook-step1',  // aktivitasId, cookies
    STEP2: 'ipb-logbook-step2',  // lecturers (file data is in IndexedDB)
    STEP3: 'ipb-logbook-step3',  // entries metadata (file data in IndexedDB)
    META: 'ipb-logbook-meta',    // current step, timestamps
} as const;

// Legacy key (for migration)
const LEGACY_KEY = 'ipb-logbook-generator-state';

// Types
export interface Step1Data {
    aktivitasId: string;
    cookies: CookieData | null;
    savedAt: string;
}

export interface Step2Data {
    lecturers: Lecturer[];
    savedAt: string;
}

export interface Step3Data {
    entries: LogbookEntry[];
    results?: SubmissionResult[];
    hasSubmitted: boolean;
    uploadedFiles?: Array<{
        name: string;
        entriesCount: number;
        uploadedAt: string;
        status: 'success' | 'error';
        source: 'step2' | 'step3';
    }>;
    savedAt: string;

}

export interface MetaData {
    currentStep: number;
    highestStep: number;  // Track the highest step user has reached
    lastVisited: string;
}

/**
 * Check if running in browser environment
 */
const isBrowser = (): boolean => {
    return typeof window !== 'undefined';
};

/**
 * Save Step 1 data (aktivitasId, cookies)
 */
export const saveStep1Data = (data: Omit<Step1Data, 'savedAt'>): void => {
    if (!isBrowser()) return;

    try {
        const dataToSave: Step1Data = {
            ...data,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.STEP1, JSON.stringify(dataToSave));
    } catch (error) {
        console.error('[StepStorage] Failed to save Step 1 data:', error);
    }
};

/**
 * Load Step 1 data
 */
export const loadStep1Data = (): Step1Data | null => {
    if (!isBrowser()) return null;

    try {
        const saved = localStorage.getItem(STORAGE_KEYS.STEP1);
        if (saved) {
            return JSON.parse(saved) as Step1Data;
        }
    } catch (error) {
        console.error('[StepStorage] Failed to load Step 1 data:', error);
    }
    return null;
};

/**
 * Save Step 2 data (lecturers)
 */
export const saveStep2Data = (data: Omit<Step2Data, 'savedAt'>): void => {
    if (!isBrowser()) return;

    try {
        const dataToSave: Step2Data = {
            ...data,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.STEP2, JSON.stringify(dataToSave));
    } catch (error) {
        console.error('[StepStorage] Failed to save Step 2 data:', error);
    }
};

/**
 * Load Step 2 data
 */
export const loadStep2Data = (): Step2Data | null => {
    if (!isBrowser()) return null;

    try {
        const saved = localStorage.getItem(STORAGE_KEYS.STEP2);
        if (saved) {
            return JSON.parse(saved) as Step2Data;
        }
    } catch (error) {
        console.error('[StepStorage] Failed to load Step 2 data:', error);
    }
    return null;
};

/**
 * Save Step 3 data (entries without fileData - that's in IndexedDB)
 */
export const saveStep3Data = (data: Omit<Step3Data, 'savedAt'>): void => {
    if (!isBrowser()) return;

    try {
        // Remove fileData to save space (stored in IndexedDB separately)
        const entriesWithoutFileData = data.entries.map(entry => ({
            ...entry,
            fileData: undefined,
        }));

        const dataToSave: Step3Data = {
            ...data,
            entries: entriesWithoutFileData,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.STEP3, JSON.stringify(dataToSave));
    } catch (error) {
        console.error('[StepStorage] Failed to save Step 3 data:', error);
        // If too large, try without results
        try {
            const minimalData = {
                entries: data.entries.map(e => ({ ...e, fileData: undefined })),
                hasSubmitted: data.hasSubmitted,
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEYS.STEP3, JSON.stringify(minimalData));
        } catch (e) {
            console.error('[StepStorage] Failed to save even minimal Step 3 data:', e);
        }
    }
};

/**
 * Load Step 3 data
 */
export const loadStep3Data = (): Step3Data | null => {
    if (!isBrowser()) return null;

    try {
        const saved = localStorage.getItem(STORAGE_KEYS.STEP3);
        if (saved) {
            return JSON.parse(saved) as Step3Data;
        }
    } catch (error) {
        console.error('[StepStorage] Failed to load Step 3 data:', error);
    }
    return null;
};

/**
 * Save meta data (current step and highest step reached)
 */
export const saveMetaData = (step: number): void => {
    if (!isBrowser()) return;

    try {
        // Load existing meta to preserve highestStep
        const existing = loadMetaData();
        const currentHighest = existing?.highestStep || 1;

        const data: MetaData = {
            currentStep: step,
            highestStep: Math.max(step, currentHighest), // Track the highest step reached
            lastVisited: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.META, JSON.stringify(data));
    } catch (error) {
        console.error('[StepStorage] Failed to save meta data:', error);
    }
};

/**
 * Load meta data
 */
export const loadMetaData = (): MetaData | null => {
    if (!isBrowser()) return null;

    try {
        const saved = localStorage.getItem(STORAGE_KEYS.META);
        if (saved) {
            return JSON.parse(saved) as MetaData;
        }
    } catch (error) {
        console.error('[StepStorage] Failed to load meta data:', error);
    }
    return null;
};

/**
 * Clear storage from a specific step onwards
 * e.g., clearFromStep(2) clears Step 2 and Step 3 data
 */
export const clearFromStep = (fromStep: number): void => {
    if (!isBrowser()) return;

    try {
        if (fromStep <= 1) {
            localStorage.removeItem(STORAGE_KEYS.STEP1);
        }
        if (fromStep <= 2) {
            localStorage.removeItem(STORAGE_KEYS.STEP2);
        }
        if (fromStep <= 3) {
            localStorage.removeItem(STORAGE_KEYS.STEP3);
        }
        console.log(`[StepStorage] Cleared storage from step ${fromStep} onwards`);
    } catch (error) {
        console.error('[StepStorage] Failed to clear storage:', error);
    }
};

/**
 * Clear all step storage data
 */
export const clearAllStepData = (): void => {
    if (!isBrowser()) return;

    try {
        localStorage.removeItem(STORAGE_KEYS.STEP1);
        localStorage.removeItem(STORAGE_KEYS.STEP2);
        localStorage.removeItem(STORAGE_KEYS.STEP3);
        localStorage.removeItem(STORAGE_KEYS.META);
        // Also clear legacy key if exists
        localStorage.removeItem(LEGACY_KEY);
        console.log('[StepStorage] Cleared all storage');
    } catch (error) {
        console.error('[StepStorage] Failed to clear all storage:', error);
    }
};

/**
 * Migrate from legacy storage format to new step-based format
 */
export const migrateFromLegacy = (): boolean => {
    if (!isBrowser()) return false;

    try {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
            const parsed = JSON.parse(legacy);

            // Migrate Step 1 data
            if (parsed.aktivitasId || parsed.cookies) {
                saveStep1Data({
                    aktivitasId: parsed.aktivitasId || '',
                    cookies: parsed.cookies || null,
                });
            }

            // Migrate Step 3 data
            if (parsed.entries) {
                saveStep3Data({
                    entries: parsed.entries,
                    results: parsed.results,
                    hasSubmitted: false,
                });
            }

            // Save current step
            if (parsed.step) {
                saveMetaData(parsed.step);
            }

            // Remove legacy key
            localStorage.removeItem(LEGACY_KEY);
            console.log('[StepStorage] Migrated from legacy storage');
            return true;
        }
    } catch (error) {
        console.error('[StepStorage] Failed to migrate from legacy:', error);
    }
    return false;
};

/**
 * Check if there's any saved session data
 */
export const hasSavedSession = (): boolean => {
    if (!isBrowser()) return false;

    const step1 = loadStep1Data();
    return !!(step1?.aktivitasId && step1?.cookies);
};

/**
 * Get session age in minutes
 */
export const getSessionAge = (): number | null => {
    if (!isBrowser()) return null;

    const step1 = loadStep1Data();
    if (step1?.savedAt) {
        const savedTime = new Date(step1.savedAt).getTime();
        const now = new Date().getTime();
        return Math.floor((now - savedTime) / (1000 * 60));
    }
    return null;
};

/**
 * Get the highest step user has reached
 * Used for "Resume Session" to return to the furthest progress
 */
export const getHighestStep = (): number => {
    if (!isBrowser()) return 1;

    const meta = loadMetaData();
    return meta?.highestStep || 1;
};

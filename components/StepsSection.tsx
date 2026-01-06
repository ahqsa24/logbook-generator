'use client';

import { useState, useEffect, useCallback } from 'react';
import { LogbookEntry, SubmissionResult, CookieData, Lecturer } from '@/types/logbook';
import { parseExcelFile, parseZipFile, parseCookieString } from '@/lib/logbook-service';
import { validateLogbookEntry } from '@/lib/validation';
import { fileStorage } from '@/lib/fileStorage';
import { findDuplicates, removeDuplicates } from '@/lib/duplicateChecker';
import {
    saveStep1Data,
    loadStep1Data,
    saveStep2Data,
    loadStep2Data,
    saveStep3Data,
    loadStep3Data,
    saveMetaData,
    loadMetaData,
    clearFromStep,
    clearAllStepData,
    migrateFromLegacy,
    getHighestStep,
} from '@/lib/stepStorage';
import StepIndicator from '@/components/StepIndicator';
import Step1Authentication from '@/components/Step1Authentication';
import Step2FileUpload from '@/components/Step2FileUpload';
import Step3Review from '@/components/Step3Review';
import Step4Results from '@/components/Step4Results';
import CommentSection from '@/components/CommentSection';
import { useSubmission, useDownload } from './StepsSection/hooks';

export default function StepsSection() {
    // Initialize state
    const [step, setStep] = useState<number>(1);
    const [aktivitasId, setAktivitasId] = useState<string>('');
    const [cookies, setCookies] = useState<CookieData | null>(null);
    const [entries, setEntries] = useState<LogbookEntry[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Step 3 file upload state
    const [uploadedFiles, setUploadedFiles] = useState<Array<{
        name: string;
        entriesCount: number;
        uploadedAt: string;
        status: 'success' | 'error';
        source: 'step2' | 'step3';
    }>>([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [duplicateWarning, setDuplicateWarning] = useState<{
        duplicates: any[];
        newEntries: LogbookEntry[];
        fileName: string;
    } | null>(null);

    // Use custom hooks
    const { isSubmitting, currentSubmission, results, submitAll, setResults } = useSubmission();
    const { downloadResults, downloadXLSX } = useDownload(results, lecturers);

    // Load state from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadSavedState = async () => {
            // First, try to migrate from legacy storage
            migrateFromLegacy();

            // Load meta data to get current step
            const meta = loadMetaData();

            // Load Step 1 data (aktivitasId, cookies)
            const step1Data = loadStep1Data();
            if (step1Data) {
                if (step1Data.aktivitasId) setAktivitasId(step1Data.aktivitasId);
                if (step1Data.cookies) setCookies(step1Data.cookies);
            }

            // Load Step 2 data (lecturers)
            const step2Data = loadStep2Data();
            if (step2Data?.lecturers) {
                setLecturers(step2Data.lecturers);
            } else if (step1Data?.aktivitasId && step1Data?.cookies) {
                // If lecturers not saved but we have credentials, fetch them
                console.log('[StepsSection] Lecturers not found in storage, fetching...');
                try {
                    const response = await fetch('/api/auth/get-lecturers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            aktivitasId: step1Data.aktivitasId,
                            cookies: step1Data.cookies
                        })
                    });
                    const data = await response.json();
                    if (data.success && data.lecturers) {
                        setLecturers(data.lecturers);
                        // Save to Step 2 storage for next time
                        saveStep2Data({ lecturers: data.lecturers });
                        console.log('[StepsSection] Lecturers fetched and saved:', data.lecturers.length);
                    }
                } catch (error) {
                    console.error('[StepsSection] Failed to fetch lecturers on restore:', error);
                }
            }

            // Load Step 3 data (entries, results)
            const step3Data = loadStep3Data();
            if (step3Data) {
                if (step3Data.entries) {
                    // Load file data from IndexedDB for each entry
                    const entriesWithFiles = await Promise.all(
                        step3Data.entries.map(async (entry: LogbookEntry, idx: number) => {
                            const storedFile = await fileStorage.getEntry(`entry-${idx}`);
                            if (storedFile?.fileData) {
                                return {
                                    ...entry,
                                    fileData: storedFile.fileData,
                                    fileName: storedFile.fileName
                                };
                            }
                            return entry;
                        })
                    );
                    setEntries(entriesWithFiles);
                }
                if (step3Data.results) setResults(step3Data.results);
                if (step3Data.hasSubmitted) setHasSubmitted(step3Data.hasSubmitted);
                if (step3Data.uploadedFiles) setUploadedFiles(step3Data.uploadedFiles);
            }

            // Restore step if valid data exists
            if (meta?.currentStep) {
                // Validate that we have the required data for the saved step
                if (meta.currentStep >= 2 && !step1Data?.aktivitasId) {
                    // Missing Step 1 data, stay at Step 1
                    setStep(1);
                } else if (meta.currentStep >= 3 && (!step1Data?.aktivitasId || !step3Data?.entries)) {
                    // Missing required data for Step 3
                    setStep(step1Data?.aktivitasId ? 2 : 1);
                } else {
                    setStep(meta.currentStep);
                }
            }

            setIsLoaded(true);
        };

        loadSavedState();
    }, [setResults]);

    // Save Step 1 data when aktivitasId or cookies change
    useEffect(() => {
        if (!isLoaded || typeof window === 'undefined') return;

        if (aktivitasId || cookies) {
            saveStep1Data({ aktivitasId, cookies });
        }
    }, [aktivitasId, cookies, isLoaded]);

    // Save Step 2 data when lecturers change
    useEffect(() => {
        if (!isLoaded || typeof window === 'undefined') return;

        if (lecturers.length > 0) {
            saveStep2Data({ lecturers });
        }
    }, [lecturers, isLoaded]);

    // Save Step 3 data when entries or results change
    useEffect(() => {
        if (!isLoaded || typeof window === 'undefined') return;

        if (step >= 3 && entries.length > 0) {
            // Save file data to IndexedDB separately
            entries.forEach(async (entry, idx) => {
                if (entry.fileData && entry.fileName) {
                    await fileStorage.saveEntry(`entry-${idx}`, entry.fileData, entry.fileName);
                }
            });

            // Save entries metadata to localStorage (without fileData)
            saveStep3Data({
                entries: entries,
                results: results,
                hasSubmitted: hasSubmitted,
                uploadedFiles: uploadedFiles,
            });
        }
    }, [entries, results, hasSubmitted, step, isLoaded, uploadedFiles]);

    // Save meta data (current step) when step changes
    useEffect(() => {
        if (!isLoaded || typeof window === 'undefined') return;

        saveMetaData(step);
    }, [step, isLoaded]);

    // Handle going back - DON'T clear data, just change step
    // Data persists until "Start Over" or new Step 1 input
    const handleGoBack = useCallback((fromStep: number) => {
        const targetStep = fromStep - 1;

        // Simply go back to previous step
        // Data is preserved in localStorage and will be available for "Resume Session"
        setStep(targetStep);

        console.log(`[StepsSection] Going back from Step ${fromStep} to Step ${targetStep} (data preserved)`);
    }, []);


    const handleStep1Submit = (id: string, cookieString: string) => {
        // Check if this is a new session (different aktivitasId)
        const existingStep1 = loadStep1Data();
        const isNewSession = existingStep1?.aktivitasId && existingStep1.aktivitasId !== id;

        if (isNewSession) {
            // Clear all old session data when starting with new aktivitasId
            console.log('[StepsSection] New aktivitasId detected - clearing old session');
            clearAllStepData();
            fileStorage.clearAll();

            // Reset state
            setEntries([]);
            setResults([]);
            setHasSubmitted(false);
            setLecturers([]);
        }

        setAktivitasId(id);
        const parsedCookies = parseCookieString(cookieString);
        setCookies(parsedCookies);

        // Save Step 1 data immediately
        saveStep1Data({ aktivitasId: id, cookies: parsedCookies });

        // Move to Step 2 immediately - don't wait for lecturers
        setStep(2);

        // Fetch lecturers in background (non-blocking)
        fetch('/api/auth/get-lecturers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aktivitasId: id, cookies: parsedCookies })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.lecturers) {
                    setLecturers(data.lecturers);
                    // Save lecturers to Step 2 storage
                    saveStep2Data({ lecturers: data.lecturers });
                }
            })
            .catch(error => {
                console.error('Failed to fetch lecturers:', error);
                // Continue anyway - lecturers are optional
            });
    };

    const handleFileUpload = async (file: File) => {
        try {
            let parsedEntries: LogbookEntry[];

            // Detect file type and route to appropriate parser
            if (file.name.endsWith('.zip')) {
                const { entries } = await parseZipFile(file);
                parsedEntries = entries;
            } else {
                parsedEntries = await parseExcelFile(file);
            }

            // Add entry source metadata
            const entriesWithSource = parsedEntries.map(entry => ({
                ...entry,
                entrySource: {
                    type: 'step2' as const,
                    fileName: file.name,
                    uploadedAt: new Date().toISOString(),
                },
                validation: validateLogbookEntry(entry)
            }));

            setEntries(entriesWithSource);

            // Track uploaded file
            setUploadedFiles([{
                name: file.name,
                entriesCount: entriesWithSource.length,
                uploadedAt: new Date().toISOString(),
                status: 'success',
                source: 'step2'
            }]);

            setStep(3);
        } catch (error) {
            const errorMessage = (error as Error).message || 'Unknown error';
            // Don't use alert - let Step2FileUpload component handle the error display
            throw error; // Re-throw to be caught by Step2FileUpload
        }
    };

    const handleManualEntry = () => {
        // Start with empty entries - user can add entries manually using "Add Entry" button
        setEntries([]);
        setStep(3);
    };

    const handleAdditionalFileUpload = async (file: File) => {
        setIsUploadingFile(true);
        setUploadError(null);

        try {
            // 1. Parse file
            let newEntries: LogbookEntry[];
            if (file.name.endsWith('.zip')) {
                const { entries } = await parseZipFile(file);
                newEntries = entries;
            } else {
                newEntries = await parseExcelFile(file);
            }

            // 2. Add entry source metadata
            const entriesWithSource = newEntries.map(entry => ({
                ...entry,
                entrySource: {
                    type: 'step3_upload' as const,
                    fileName: file.name,
                    uploadedAt: new Date().toISOString(),
                },
                validation: validateLogbookEntry(entry)
            }));

            // 3. Check for duplicates
            const duplicates = findDuplicates(entries, entriesWithSource);

            if (duplicates.length > 0) {
                // Show duplicate warning modal
                setDuplicateWarning({
                    duplicates,
                    newEntries: entriesWithSource,
                    fileName: file.name
                });
                setIsUploadingFile(false);
                return; // Wait for user decision
            }

            // 4. No duplicates - merge directly
            setEntries([...entries, ...entriesWithSource]);

            // 5. Track uploaded file
            setUploadedFiles([...uploadedFiles, {
                name: file.name,
                entriesCount: entriesWithSource.length,
                uploadedAt: new Date().toISOString(),
                status: 'success',
                source: 'step3'
            }]);

            console.log(`[StepsSection] Added ${entriesWithSource.length} entries from ${file.name}`);
        } catch (error) {
            const errorMessage = (error as Error).message || 'Failed to upload file';
            setUploadError(errorMessage);
            console.error('[StepsSection] File upload error:', error);
        } finally {
            setIsUploadingFile(false);
        }
    };

    const handleSkipDuplicates = () => {
        if (!duplicateWarning) return;

        // Remove duplicates and add only unique entries
        const uniqueEntries = removeDuplicates(duplicateWarning.newEntries, duplicateWarning.duplicates);
        setEntries([...entries, ...uniqueEntries]);

        // Track uploaded file
        setUploadedFiles([...uploadedFiles, {
            name: duplicateWarning.fileName,
            entriesCount: uniqueEntries.length,
            uploadedAt: new Date().toISOString(),
            status: 'success',
            source: 'step3'
        }]);

        console.log(`[StepsSection] Added ${uniqueEntries.length} unique entries from ${duplicateWarning.fileName} (${duplicateWarning.duplicates.length} duplicates skipped)`);
        setDuplicateWarning(null);
    };

    const handleKeepAllDuplicates = () => {
        if (!duplicateWarning) return;

        // Add all entries including duplicates
        setEntries([...entries, ...duplicateWarning.newEntries]);

        // Track uploaded file
        setUploadedFiles([...uploadedFiles, {
            name: duplicateWarning.fileName,
            entriesCount: duplicateWarning.newEntries.length,
            uploadedAt: new Date().toISOString(),
            status: 'success',
            source: 'step3'
        }]);

        console.log(`[StepsSection] Added ${duplicateWarning.newEntries.length} entries from ${duplicateWarning.fileName} (including ${duplicateWarning.duplicates.length} duplicates)`);
        setDuplicateWarning(null);
    };

    const handleCancelDuplicate = () => {
        console.log('[StepsSection] Upload cancelled by user');
        setDuplicateWarning(null);
    };

    const handleKeepSelectedDuplicates = (selectedIndices: number[]) => {
        if (!duplicateWarning) return;

        // Get only the selected duplicate entries
        const selectedEntries = selectedIndices.map(index => duplicateWarning.duplicates[index].newEntry);

        // Get non-duplicate entries
        const nonDuplicateEntries = removeDuplicates(duplicateWarning.newEntries, duplicateWarning.duplicates);

        // Combine selected duplicates with non-duplicates
        const entriesToAdd = [...nonDuplicateEntries, ...selectedEntries];

        setEntries([...entries, ...entriesToAdd]);

        // Track uploaded file
        setUploadedFiles([...uploadedFiles, {
            name: duplicateWarning.fileName,
            entriesCount: entriesToAdd.length,
            uploadedAt: new Date().toISOString(),
            status: 'success',
            source: 'step3'
        }]);

        console.log(`[StepsSection] Added ${entriesToAdd.length} entries from ${duplicateWarning.fileName} (${selectedEntries.length} selected duplicates + ${nonDuplicateEntries.length} unique)`);
        setDuplicateWarning(null);
    };

    const handleRemoveUploadedFile = (fileName: string) => {
        // Remove all entries that came from this file
        const remainingEntries = entries.filter(entry =>
            entry.entrySource?.fileName !== fileName
        );

        // Remove file from uploaded files list
        const remainingFiles = uploadedFiles.filter(file => file.name !== fileName);

        const removedCount = entries.length - remainingEntries.length;

        setEntries(remainingEntries);
        setUploadedFiles(remainingFiles);

        console.log(`[StepsSection] Removed file "${fileName}" and ${removedCount} associated entries`);
    };

    const handleSupportingFileUpload = async (index: number, file: File) => {
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;
            const fileDataBase64 = base64.split(',')[1];

            // Save to IndexedDB
            await fileStorage.saveEntry(`entry-${index}`, fileDataBase64, file.name);

            // Update state
            const updatedEntries = [...entries];
            updatedEntries[index] = {
                ...updatedEntries[index],
                fileData: fileDataBase64,
                fileName: file.name,
                fileSource: 'review'  // Mark as from review section upload (reliable)
            };
            setEntries(updatedEntries);

            console.log('[DEBUG] File uploaded and saved to IndexedDB:', {
                index,
                fileName: file.name,
                fileDataLength: fileDataBase64.length
            });
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateEntry = async (index: number, updatedEntry: LogbookEntry) => {
        console.log('[DEBUG] StepsSection - Updating entry:', {
            index,
            fileName: updatedEntry.fileName,
            hasFileData: !!updatedEntry.fileData,
            fileDataLength: updatedEntry.fileData?.length || 0,
            fileSource: updatedEntry.fileSource
        });

        // Save file data to IndexedDB if present
        if (updatedEntry.fileData && updatedEntry.fileName) {
            await fileStorage.saveEntry(`entry-${index}`, updatedEntry.fileData, updatedEntry.fileName);
        }

        const updatedEntries = [...entries];
        updatedEntries[index] = updatedEntry;
        setEntries(updatedEntries);
    };

    const handleAddEntry = async (newEntry: LogbookEntry) => {
        console.log('[DEBUG] StepsSection - Adding new entry:', {
            fileName: newEntry.fileName,
            hasFileData: !!newEntry.fileData,
            fileDataLength: newEntry.fileData?.length || 0
        });

        // Add entry source metadata for manual entries
        const entryWithSource = {
            ...newEntry,
            entrySource: {
                type: 'manual' as const,
                uploadedAt: new Date().toISOString(),
            }
        };

        // Save file data to IndexedDB if present
        if (entryWithSource.fileData && entryWithSource.fileName) {
            const newIndex = entries.length;
            await fileStorage.saveEntry(`entry-${newIndex}`, entryWithSource.fileData, entryWithSource.fileName);
        }

        setEntries([...entries, entryWithSource]);
    };

    const handleDeleteEntry = async (index: number) => {
        // Delete from IndexedDB
        await fileStorage.deleteEntry(`entry-${index}`);

        const updatedEntries = entries.filter((_, i) => i !== index);
        setEntries(updatedEntries);
    };

    const handleDeleteAll = async () => {
        // Clear all entries and their files from IndexedDB
        await fileStorage.clearAll();
        setEntries([]);
        console.log('[StepsSection] All entries deleted');
    };

    const handleSubmitAll = async () => {
        const submissionResults = await submitAll(entries, aktivitasId, cookies);
        setHasSubmitted(true);
        setStep(4);
    };

    const handleStartOver = () => {
        // Clear all localStorage and IndexedDB
        clearAllStepData();
        fileStorage.clearAll();

        // Reset all state
        setStep(1);
        setAktivitasId('');
        setCookies(null);
        setEntries([]);
        setLecturers([]);
        setResults([]);
        setHasSubmitted(false);
    };

    return (
        <section id="steps-section" className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-2">
                        Start Submission
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Complete the steps below to submit your logbook entries</p>
                </div>

                <StepIndicator currentStep={step} />

                <div className="mt-8">
                    {step === 1 && (
                        <Step1Authentication
                            onSubmit={handleStep1Submit}
                            onResumeSession={() => {
                                const highestStep = getHighestStep();
                                console.log(`[StepsSection] Resuming session to Step ${highestStep}`);
                                setStep(highestStep);
                            }}
                            savedAktivitasId={aktivitasId}
                            savedCookies={cookies}
                        />
                    )}

                    {step === 2 && (
                        <Step2FileUpload
                            onFileUpload={handleFileUpload}
                            onBack={() => handleGoBack(2)}
                            onManualEntry={handleManualEntry}
                        />
                    )}

                    {step === 3 && (
                        <Step3Review
                            entries={entries}
                            isSubmitting={isSubmitting}
                            hasSubmitted={hasSubmitted}
                            currentSubmission={currentSubmission}
                            lecturers={lecturers}
                            onFileUpload={handleSupportingFileUpload}
                            onAdditionalFileUpload={handleAdditionalFileUpload}
                            uploadedFiles={uploadedFiles}
                            isUploadingFile={isUploadingFile}
                            uploadError={uploadError}
                            onRemoveUploadedFile={handleRemoveUploadedFile}
                            duplicateWarning={duplicateWarning}
                            onSkipDuplicates={handleSkipDuplicates}
                            onKeepAllDuplicates={handleKeepAllDuplicates}
                            onCancelDuplicate={handleCancelDuplicate}
                            onKeepSelectedDuplicates={handleKeepSelectedDuplicates}
                            onUpdateEntry={handleUpdateEntry}
                            onAddEntry={handleAddEntry}
                            onDeleteEntry={handleDeleteEntry}
                            onDeleteAll={handleDeleteAll}
                            onSubmit={handleSubmitAll}
                            onBack={() => handleGoBack(3)}
                        />
                    )}

                    {step === 4 && (
                        <Step4Results
                            results={results}
                            lecturers={lecturers}
                            onDownloadCSV={downloadResults}
                            onDownloadXLSX={downloadXLSX}
                            onStartOver={handleStartOver}
                        />
                    )}
                </div>

                {/* Comment Section */}
                <CommentSection />

                {/* Support Section */}
                <div className="mt-16">
                    <div className="card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-300 mb-2">
                                    Support the Creator
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    If this tool saves your time, consider supporting the development.
                                </p>
                            </div>

                            <a
                                href="https://tako.id/c0zzy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 dark:from-purple-500 dark:to-purple-600 dark:hover:from-purple-600 dark:hover:to-purple-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 01-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 00-1.322-.238c-.826 0-1.491.284-2.26.613z" />
                                </svg>
                                <span className="text-lg">Donate</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}


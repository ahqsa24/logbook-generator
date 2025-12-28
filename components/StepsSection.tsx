'use client';

import { useState, useEffect } from 'react';
import { LogbookEntry, SubmissionResult, CookieData } from '@/types/logbook';
import { parseExcelFile, parseCookieString } from '@/lib/logbook-service';
import { validateLogbookEntry } from '@/lib/validation';
import StepIndicator from '@/components/StepIndicator';
import Step1Authentication from '@/components/Step1Authentication';
import Step2FileUpload from '@/components/Step2FileUpload';
import Step3Review from '@/components/Step3Review';
import Step4Results from '@/components/Step4Results';

const STORAGE_KEY = 'ipb-logbook-generator-state';

export default function StepsSection() {
    // Initialize state with localStorage
    const [step, setStep] = useState<number>(1);
    const [aktivitasId, setAktivitasId] = useState<string>('');
    const [cookies, setCookies] = useState<CookieData | null>(null);
    const [entries, setEntries] = useState<LogbookEntry[]>([]);
    const [results, setResults] = useState<SubmissionResult[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState(0);

    // Load state from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.step) setStep(parsed.step);
                    if (parsed.aktivitasId) setAktivitasId(parsed.aktivitasId);
                    if (parsed.cookies) setCookies(parsed.cookies);
                    if (parsed.entries) setEntries(parsed.entries);
                    if (parsed.results) setResults(parsed.results);
                } catch (e) {
                    console.error('Failed to load saved state:', e);
                }
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stateToSave = {
                step,
                aktivitasId,
                cookies,
                entries,
                results,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [step, aktivitasId, cookies, entries, results]);

    const handleStep1Submit = (id: string, cookieString: string) => {
        setAktivitasId(id);
        const parsedCookies = parseCookieString(cookieString);
        setCookies(parsedCookies);
        setStep(2);
    };

    const handleFileUpload = async (file: File) => {
        try {
            const parsedEntries = await parseExcelFile(file);
            const validatedEntries = parsedEntries.map(entry => ({
                ...entry,
                validation: validateLogbookEntry(entry)
            }));
            setEntries(validatedEntries);
            setStep(3);
        } catch (error) {
            alert('Error parsing Excel file. Please check the format.');
        }
    };

    const handleSupportingFileUpload = async (index: number, file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            const updatedEntries = [...entries];
            updatedEntries[index] = {
                ...updatedEntries[index],
                fileData: base64.split(',')[1],
                fileName: file.name
            };
            setEntries(updatedEntries);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitAll = async () => {
        setIsSubmitting(true);
        setResults([]);
        setCurrentSubmission(0);

        for (let i = 0; i < entries.length; i++) {
            setCurrentSubmission(i + 1);
            const entry = entries[i];

            try {
                const formData = new FormData();
                formData.append('aktivitasId', aktivitasId);
                formData.append('cookies', JSON.stringify(cookies));
                formData.append('entry', JSON.stringify(entry));

                if (entry.fileData && entry.fileName) {
                    const blob = await fetch(`data:application/octet-stream;base64,${entry.fileData}`).then(r => r.blob());
                    formData.append('file', blob, entry.fileName);
                }

                const response = await fetch('/api/submit-logbook', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                console.log('Backend result:', result);
                console.log('Result status:', result.status);
                console.log('Result success:', result.success);

                setResults(prev => [...prev, {
                    row: i,
                    status: result.status || (result.success ? 'success' : 'error'),
                    success: result.success,
                    error: result.error || result.message,
                    entry
                }]);
            } catch (error) {
                setResults(prev => [...prev, {
                    success: false,
                    status: 'error',
                    entry,
                    error: 'Network error'
                }]);
            }
        }

        setIsSubmitting(false);
        setStep(4);
    };

    const downloadResults = () => {
        const csvContent = [
            ['Date', 'Start', 'End', 'Status', 'Message'].join(','),
            ...results.map(r => [
                r.entry?.Waktu || '',
                r.entry?.Tstart || '',
                r.entry?.Tend || '',
                r.success ? 'Success' : 'Failed',
                r.message || r.error || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'logbook-results.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleStartOver = () => {
        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }

        // Reset all state
        setStep(1);
        setAktivitasId('');
        setCookies(null);
        setEntries([]);
        setResults([]);
        setIsSubmitting(false);
        setCurrentSubmission(0);
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
                        />
                    )}

                    {step === 2 && (
                        <Step2FileUpload
                            onFileUpload={handleFileUpload}
                            onBack={() => setStep(1)}
                        />
                    )}

                    {step === 3 && (
                        <Step3Review
                            entries={entries}
                            isSubmitting={isSubmitting}
                            currentSubmission={currentSubmission}
                            onFileUpload={handleSupportingFileUpload}
                            onSubmit={handleSubmitAll}
                            onBack={() => setStep(2)}
                        />
                    )}

                    {step === 4 && (
                        <Step4Results
                            results={results}
                            onDownload={downloadResults}
                            onStartOver={handleStartOver}
                        />
                    )}
                </div>

                {/* Donation Section */}
                <div className="text-center mt-16">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 dark:from-purple-600 dark:via-pink-600 dark:to-purple-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>

                        <div className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-3xl px-12 py-10 shadow-2xl">
                            <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>

                            <div className="flex items-center justify-center gap-3 mb-6">
                                <svg className="w-8 h-8 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    Support the Creators
                                </h3>
                                <svg className="w-8 h-8 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            </div>

                            <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                                If this tool saves your time and makes your life easier, consider buying us a coffee!
                            </p>

                            <a
                                href="https://tako.id/c0zzy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold px-12 py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>

                                <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-xl relative z-10">Donate Now</span>
                                <svg className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

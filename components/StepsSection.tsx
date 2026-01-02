'use client';

import { useState, useEffect } from 'react';
import { LogbookEntry, SubmissionResult, CookieData, Lecturer } from '@/types/logbook';
import { parseExcelFile, parseZipFile, parseCookieString } from '@/lib/logbook-service';
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
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);

    // Load state from localStorage on mount (only if from Step 3+)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Only restore if saved state was from Step 3 or later
                    if (parsed.step && parsed.step >= 3) {
                        if (parsed.step) setStep(parsed.step);
                        if (parsed.aktivitasId) setAktivitasId(parsed.aktivitasId);
                        if (parsed.cookies) setCookies(parsed.cookies);
                        if (parsed.entries) setEntries(parsed.entries);
                        if (parsed.results) setResults(parsed.results);
                    }
                } catch (e) {
                    console.error('Failed to load saved state:', e);
                }
            }
        }
    }, []);

    // Save state to localStorage only after Step 2 (file upload completed)
    useEffect(() => {
        if (typeof window !== 'undefined' && step >= 3) {
            // Remove fileData from entries to save space
            const entriesWithoutFileData = entries.map(entry => ({
                ...entry,
                fileData: undefined, // Don't save base64 data
            }));

            const stateToSave = {
                step,
                aktivitasId,
                cookies,
                entries: entriesWithoutFileData,
                results,
                timestamp: new Date().toISOString(),
            };

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
            } catch (error) {
                console.warn('Failed to save state to localStorage:', error);
                // If still too large, clear old state
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (e) {
                    console.error('Failed to clear localStorage:', e);
                }
            }
        } else if (typeof window !== 'undefined' && step < 3) {
            // Clear localStorage when going back to Step 1 or 2
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
                console.error('Failed to clear localStorage:', e);
            }
        }
    }, [step, aktivitasId, cookies, entries, results]);

    const handleStep1Submit = (id: string, cookieString: string) => {
        setAktivitasId(id);
        const parsedCookies = parseCookieString(cookieString);
        setCookies(parsedCookies);


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
                    //console.log(`Loaded ${data.lecturers.length} lecturers`);
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

            const validatedEntries = parsedEntries.map(entry => ({
                ...entry,
                validation: validateLogbookEntry(entry)
            }));
            setEntries(validatedEntries);
            setStep(3);
        } catch (error) {
            const errorMessage = (error as Error).message || 'Unknown error';
            // Don't use alert - let Step2FileUpload component handle the error display
            throw error; // Re-throw to be caught by Step2FileUpload
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

    const handleUpdateEntry = (index: number, updatedEntry: LogbookEntry) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = updatedEntry;
        setEntries(updatedEntries);
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
        setHasSubmitted(true);
        setStep(4);
    };

    // Helper function to convert Dosen IDs to names (shared by download functions)
    const getDosenNames = (dosenStr: string | undefined): string => {
        if (!dosenStr || dosenStr.trim() === '') return '-';

        if (lecturers.length === 0) {
            // Fallback to numbers if lecturers not loaded
            return dosenStr;
        }

        // Parse comma-separated IDs and convert to names
        return dosenStr
            .split(',')
            .map(id => {
                const lecturerId = parseInt(id.trim(), 10);
                const lecturer = lecturers.find(l => l.id === lecturerId);
                return lecturer ? lecturer.name : `Dosen ${id}`;
            })
            .join(', ');
    };

    const downloadResults = () => {
        // Helper function to escape CSV fields
        const escapeCSV = (field: string | undefined | null): string => {
            if (!field) return '';
            const str = String(field);
            // If field contains comma, quote, or newline, wrap in quotes and escape quotes
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        // Helper functions for labels
        const getJenisLogLabel = (id: number) => {
            const labels = { 1: 'Pembimbingan', 2: 'Ujian', 3: 'Kegiatan' };
            return labels[id as keyof typeof labels] || String(id);
        };

        const getModeLabel = (mode: number) => {
            const labels = { 0: 'Online', 1: 'Offline', 2: 'Hybrid' };
            return labels[mode as keyof typeof labels] || String(mode);
        };

        // CSV Header matching Step 4 table
        const headers = ['No', 'Waktu', 'Keterangan', 'Durasi', 'Media', 'Jenis Kegiatan', 'Dosen Penggerak', 'Dokumen', 'Status', 'Error'];

        // CSV Rows
        const rows = results.map((r, idx) => {
            const entry = r.entry;
            const durasi = entry ? `${entry.Tstart} - ${entry.Tend}` : '-';
            const status = r.status === 'success' ? 'Success' : 'Error';
            const errorMsg = r.status === 'success' ? '' : (r.error || '');

            return [
                String(idx + 1), // No
                escapeCSV(entry?.Waktu), // Waktu
                escapeCSV(entry?.Keterangan), // Keterangan
                escapeCSV(durasi), // Durasi
                escapeCSV(entry ? getModeLabel(entry.IsLuring) : '-'), // Media
                escapeCSV(entry ? getJenisLogLabel(entry.JenisLogId) : '-'), // Jenis Kegiatan
                escapeCSV(getDosenNames(entry?.Dosen)), // Dosen Penggerak
                escapeCSV(entry?.fileName || '-'), // Dokumen
                status, // Status
                escapeCSV(errorMsg) // Error
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logbook-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadXLSX = async () => {
        // Dynamically import ExcelJS to avoid SSR issues
        const ExcelJS = await import('exceljs');

        // Helper functions for labels
        const getJenisLogLabel = (id: number) => {
            const labels = { 1: 'Pembimbingan', 2: 'Ujian', 3: 'Kegiatan' };
            return labels[id as keyof typeof labels] || String(id);
        };

        const getModeLabel = (mode: number) => {
            const labels = { 0: 'Online', 1: 'Offline', 2: 'Hybrid' };
            return labels[mode as keyof typeof labels] || String(mode);
        };

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Logbook Results');

        // Define columns with headers and widths
        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Waktu', key: 'waktu', width: 12 },
            { header: 'Keterangan', key: 'keterangan', width: 40 },
            { header: 'Durasi', key: 'durasi', width: 15 },
            { header: 'Media', key: 'media', width: 10 },
            { header: 'Jenis Kegiatan', key: 'jenisKegiatan', width: 15 },
            { header: 'Dosen Penggerak', key: 'dosen', width: 15 },
            { header: 'Dokumen', key: 'dokumen', width: 20 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Error', key: 'error', width: 30 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF9333EA' } // Purple
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        results.forEach((r, idx) => {
            const entry = r.entry;
            const durasi = entry ? `${entry.Tstart} - ${entry.Tend}` : '-';
            const status = r.status === 'success' ? 'Success' : 'Error';
            const errorMsg = r.status === 'success' ? '' : (r.error || '');

            worksheet.addRow({
                no: idx + 1,
                waktu: entry?.Waktu || '-',
                keterangan: entry?.Keterangan || '-',
                durasi: durasi,
                media: entry ? getModeLabel(entry.IsLuring) : '-',
                jenisKegiatan: entry ? getJenisLogLabel(entry.JenisLogId) : '-',
                dosen: getDosenNames(entry?.Dosen),
                dokumen: entry?.fileName || '-',
                status: status,
                error: errorMsg
            });

            // Color code status column
            const row = worksheet.lastRow;
            if (row) {
                const statusCell = row.getCell('status');
                if (status === 'Success') {
                    statusCell.font = { color: { argb: 'FF22C55E' }, bold: true }; // Green
                } else {
                    statusCell.font = { color: { argb: 'FFEF4444' }, bold: true }; // Red
                }
            }
        });

        // Generate buffer and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logbook-results-${new Date().toISOString().split('T')[0]}.xlsx`;
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
                            hasSubmitted={hasSubmitted}
                            currentSubmission={currentSubmission}
                            lecturers={lecturers}
                            onFileUpload={handleSupportingFileUpload}
                            onUpdateEntry={handleUpdateEntry}
                            onSubmit={handleSubmitAll}
                            onBack={() => setStep(2)}
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

/**
 * Custom hook for submission logic
 */

import { useState } from 'react';
import { LogbookEntry, SubmissionResult, CookieData } from '@/types/logbook';
import { useCookieRefresh } from './useCookieRefresh';

export const useSubmission = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState(0);
    const [results, setResults] = useState<SubmissionResult[]>([]);

    const { refreshSessionCookies } = useCookieRefresh();

    const submitAll = async (
        entries: LogbookEntry[],
        aktivitasId: string,
        cookies: CookieData | null
    ) => {
        setIsSubmitting(true);
        setResults([]);
        setCurrentSubmission(0);

        // Use a mutable reference for cookies that can be updated
        let currentCookies = cookies;
        let refreshCount = 0;

        for (let i = 0; i < entries.length; i++) {
            setCurrentSubmission(i + 1);
            const entry = entries[i];

            // Refresh cookies every 25 entries (except for the first entry)
            if (i > 0 && i % 25 === 0 && i < entries.length) {
                const refreshedCookies = await refreshSessionCookies(aktivitasId, currentCookies);
                if (refreshedCookies) {
                    currentCookies = refreshedCookies;
                    refreshCount++;
                }
            }

            try {
                console.log('[DEBUG] useSubmission - Submitting entry:', {
                    index: i,
                    fileName: entry.fileName,
                    hasFileData: !!entry.fileData,
                    fileDataLength: entry.fileData?.length || 0
                });

                const formData = new FormData();
                formData.append('aktivitasId', aktivitasId);
                formData.append('cookies', JSON.stringify(currentCookies));
                formData.append('entry', JSON.stringify(entry));

                if (entry.fileData && entry.fileName) {
                    const blob = await fetch(`data:application/octet-stream;base64,${entry.fileData}`).then(r => r.blob());
                    formData.append('file', blob, entry.fileName);
                    console.log('[DEBUG] File attached to FormData:', entry.fileName);
                } else {
                    console.log('[DEBUG] No file data to attach');
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

            // Add 1-second delay between submissions (except after the last one)
            if (i < entries.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        setIsSubmitting(false);
        return results;
    };

    return {
        isSubmitting,
        currentSubmission,
        results,
        submitAll,
        setResults
    };
};

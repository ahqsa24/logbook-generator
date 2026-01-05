'use client';

import { LogbookEntry } from '@/types/logbook';
import EntryFormFields from './EntryFormFields';

interface Lecturer {
    id: number;
    name: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

interface AddEntryFormProps {
    newEntry: LogbookEntry | null;
    lecturers: Lecturer[];
    isNewEntryValid: boolean;
    validation: ValidationResult | null;
    onFieldChange: (field: keyof LogbookEntry, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
    formRef: React.RefObject<HTMLDivElement>;
}

export default function AddEntryForm({
    newEntry,
    lecturers,
    isNewEntryValid,
    validation,
    onFieldChange,
    onSave,
    onCancel,
    formRef,
}: AddEntryFormProps) {
    if (!newEntry) return null;

    // Check if there are any validation errors to show
    const hasErrors = validation && !validation.isValid && validation.errors.length > 0;

    // Check for empty required fields
    const missingFields: string[] = [];
    if (!newEntry.Waktu?.trim()) missingFields.push('Date (Waktu)');
    if (!newEntry.Tstart?.trim()) missingFields.push('Start Time');
    if (!newEntry.Tend?.trim()) missingFields.push('End Time');
    if (!newEntry.Lokasi?.trim()) missingFields.push('Location');
    if (!newEntry.Keterangan?.trim()) missingFields.push('Description');

    const hasMissingFields = missingFields.length > 0;

    return (
        <div
            ref={formRef}
            className={`border-2 rounded-lg p-4 mb-4 ${isNewEntryValid
                    ? 'border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10'
                    : 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                        New Entry
                    </span>
                    {isNewEntryValid ? (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                            ✓ Ready to save
                        </span>
                    ) : (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                            ⚠ Incomplete
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onSave}
                        disabled={!isNewEntryValid}
                        className={`text-xs px-3 py-1 rounded transition-colors ${isNewEntryValid
                            ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                    >
                        Save
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Validation Warnings */}
            {!isNewEntryValid && (hasMissingFields || hasErrors) && (
                <div className="mb-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded p-3">
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Please fix the following to save:
                    </p>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 list-disc list-inside space-y-0.5 ml-1">
                        {/* Show missing required fields first */}
                        {hasMissingFields && (
                            <li>Missing required fields: {missingFields.join(', ')}</li>
                        )}
                        {/* Show format/validation errors */}
                        {hasErrors && validation.errors.map((error, errorIdx) => (
                            <li key={errorIdx}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Fields Grid */}
            <EntryFormFields
                entry={newEntry}
                lecturers={lecturers}
                isEditing={true}
                onFieldChange={onFieldChange}
            />
        </div>
    );
}

'use client';

import { LogbookEntry } from '@/types/logbook';
import EntryFormFields from './EntryFormFields';

interface Lecturer {
    id: number;
    name: string;
}

interface AddEntryFormProps {
    newEntry: LogbookEntry | null;
    lecturers: Lecturer[];
    isNewEntryValid: boolean;
    onFieldChange: (field: keyof LogbookEntry, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
    formRef: React.RefObject<HTMLDivElement>;
}

export default function AddEntryForm({
    newEntry,
    lecturers,
    isNewEntryValid,
    onFieldChange,
    onSave,
    onCancel,
    formRef,
}: AddEntryFormProps) {
    if (!newEntry) return null;

    return (
        <div
            ref={formRef}
            className="border-2 border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10 rounded-lg p-4 mb-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-200">
                        New Entry
                    </span>
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        Adding...
                    </span>
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

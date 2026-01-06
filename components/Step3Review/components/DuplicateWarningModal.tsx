'use client';

import { useState, useEffect } from 'react';
import { DuplicateEntry } from '@/lib/duplicateChecker';

interface DuplicateWarningModalProps {
    isOpen: boolean;
    duplicates: DuplicateEntry[];
    fileName: string;
    onSkipDuplicates: () => void;
    onKeepAll: () => void;
    onCancel: () => void;
    onKeepSelected?: (selectedIndices: number[]) => void;
}

export default function DuplicateWarningModal({
    isOpen,
    duplicates,
    fileName,
    onSkipDuplicates,
    onKeepAll,
    onCancel,
    onKeepSelected
}: DuplicateWarningModalProps) {
    const [selectedDuplicates, setSelectedDuplicates] = useState<Set<number>>(new Set());

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedDuplicates(new Set());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleDuplicate = (index: number) => {
        const newSelected = new Set(selectedDuplicates);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedDuplicates(newSelected);
    };

    const selectAll = () => {
        setSelectedDuplicates(new Set(duplicates.map((_, i) => i)));
    };

    const deselectAll = () => {
        setSelectedDuplicates(new Set());
    };

    const handleKeepSelected = () => {
        if (onKeepSelected && selectedDuplicates.size > 0) {
            onKeepSelected(Array.from(selectedDuplicates));
        } else if (selectedDuplicates.size === 0) {
            onSkipDuplicates(); // If nothing selected, skip all
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Duplicate Entries Detected
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Found <strong className="text-amber-600 dark:text-amber-400">{duplicates.length}</strong> duplicate {duplicates.length === 1 ? 'entry' : 'entries'} in <strong>{fileName}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Select which duplicate entries you want to keep. Unselected entries will be skipped.
                    </p>

                    {/* Selection Controls */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>{selectedDuplicates.size}</strong> of <strong>{duplicates.length}</strong> selected
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAll}
                                className="text-xs px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded transition-colors"
                            >
                                Select All
                            </button>
                            <button
                                onClick={deselectAll}
                                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>

                    {/* Duplicate List with Checkboxes */}
                    <div className="space-y-2">
                        {duplicates.map((dup, index) => (
                            <label
                                key={index}
                                className={`block p-3 border rounded-lg cursor-pointer transition-all ${selectedDuplicates.has(index)
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                                        : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700 hover:border-amber-300 dark:hover:border-amber-600'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedDuplicates.has(index)}
                                        onChange={() => toggleDuplicate(index)}
                                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {dup.newEntry.Waktu} • {dup.newEntry.Tstart} - {dup.newEntry.Tend}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {dup.newEntry.Keterangan}
                                                </p>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 rounded-full whitespace-nowrap flex-shrink-0">
                                                Matches #{dup.existingIndex + 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSkipDuplicates}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                        >
                            Skip All Duplicates
                        </button>
                        {onKeepSelected && (
                            <button
                                onClick={handleKeepSelected}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                            >
                                Keep Selected ({selectedDuplicates.size})
                            </button>
                        )}
                        <button
                            onClick={onKeepAll}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                        >
                            Keep All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

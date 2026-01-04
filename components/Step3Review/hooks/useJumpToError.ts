/**
 * Custom hook for jump-to-error functionality
 */

import { useState, useRef } from 'react';

interface UseJumpToErrorProps {
    errorIndices: number[];
}

interface UseJumpToErrorReturn {
    currentErrorIndex: number;
    setCurrentErrorIndex: (index: number) => void;
    entryRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
    handleJumpToNextError: () => void;
}

export const useJumpToError = ({ errorIndices }: UseJumpToErrorProps): UseJumpToErrorReturn => {
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
    const entryRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleJumpToNextError = () => {
        if (errorIndices.length === 0) return;

        const nextIndex = (currentErrorIndex + 1) % errorIndices.length;
        const entryIndex = errorIndices[nextIndex];

        entryRefs.current[entryIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        setCurrentErrorIndex(nextIndex);
    };

    return {
        currentErrorIndex,
        setCurrentErrorIndex,
        entryRefs,
        handleJumpToNextError
    };
};

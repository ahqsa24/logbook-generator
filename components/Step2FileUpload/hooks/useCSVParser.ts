/**
 * Custom hook for CSV parsing logic
 */

import { useState } from 'react';
import { parseCSVFile, validateCSVStructure, type CSVParseResult } from '../utils/csvParser';

export const useCSVParser = () => {
    const [parsedData, setParsedData] = useState<any[] | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    const parseFile = async (file: File): Promise<CSVParseResult> => {
        setIsParsing(true);
        setParseError(null);
        setParsedData(null);

        try {
            const result = await parseCSVFile(file);

            if (!result.success) {
                setParseError(result.error || 'Failed to parse CSV');
                return result;
            }

            // Validate structure
            const validation = validateCSVStructure(result.data || []);
            if (!validation.isValid) {
                setParseError(validation.error || 'Invalid CSV structure');
                return {
                    success: false,
                    error: validation.error
                };
            }

            setParsedData(result.data || []);
            return result;
        } catch (error) {
            const errorMessage = `Parsing error: ${(error as Error).message}`;
            setParseError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setIsParsing(false);
        }
    };

    const clearParsedData = () => {
        setParsedData(null);
        setParseError(null);
    };

    return {
        parsedData,
        parseError,
        isParsing,
        parseFile,
        clearParsedData
    };
};

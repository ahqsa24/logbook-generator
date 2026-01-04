/**
 * CSV parsing utilities
 */

export interface CSVParseResult {
    success: boolean;
    data?: any[];
    error?: string;
}

export const parseCSVFile = async (file: File): Promise<CSVParseResult> => {
    try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            return {
                success: false,
                error: 'CSV file is empty'
            };
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim());

        // Parse rows
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to parse CSV: ${(error as Error).message}`
        };
    }
};

export const validateCSVStructure = (data: any[]): { isValid: boolean; error?: string } => {
    if (!data || data.length === 0) {
        return {
            isValid: false,
            error: 'No data found in CSV'
        };
    }

    // Check for required columns
    const requiredColumns = ['Waktu', 'Tstart', 'Tend', 'JenisLogId', 'Keterangan'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
        return {
            isValid: false,
            error: `Missing required columns: ${missingColumns.join(', ')}`
        };
    }

    return { isValid: true };
};

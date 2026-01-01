import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { LogbookEntry } from '@/types/logbook';

// Helper function to format Excel date serial numbers to DD/MM/YYYY
function formatExcelDate(value: any): string {
    // If it's already a string in the correct format, return it
    if (typeof value === 'string') {
        // Check if it's already in DD/MM/YYYY format
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
            return value;
        }
        // Check if it's in other date formats and try to parse
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
            const day = String(parsed.getDate()).padStart(2, '0');
            const month = String(parsed.getMonth() + 1).padStart(2, '0');
            const year = parsed.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return value;
    }

    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
        // Excel stores dates as days since 1900-01-01 (with a leap year bug)
        const excelEpoch = new Date(1900, 0, 1);
        const daysOffset = value - 2; // Adjust for Excel's 1900 leap year bug
        const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // If it's a Date object
    if (value instanceof Date && !isNaN(value.getTime())) {
        const day = String(value.getDate()).padStart(2, '0');
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const year = value.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return String(value || '');
}

// Helper function to format time values
function formatExcelTime(value: any): string {
    // If it's already a string in HH:MM format, return it
    if (typeof value === 'string') {
        if (/^\d{1,2}:\d{2}$/.test(value)) {
            return value;
        }
        return value;
    }

    // If it's a number (Excel time fraction)
    if (typeof value === 'number' && value < 1) {
        const totalMinutes = Math.round(value * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    return String(value || '');
}

export async function parseExcelFile(file: File): Promise<LogbookEntry[]> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error('No worksheet found in Excel file');
        }

        const entries: LogbookEntry[] = [];
        const headers: string[] = [];

        // Get headers from first row
        worksheet.getRow(1).eachCell((cell, colNumber) => {
            headers[colNumber] = String(cell.value || '');
        });

        // Process data rows (skip header row)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const rowData: any = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber];
                if (header) {
                    rowData[header] = cell.value;
                }
            });

            // Skip empty rows
            if (!rowData.Waktu && !rowData.Keterangan && !rowData.Lokasi) {
                return;
            }

            const entry: LogbookEntry = {
                Waktu: formatExcelDate(rowData.Waktu),
                Tstart: formatExcelTime(rowData.Tstart),
                Tend: formatExcelTime(rowData.Tend),
                JenisLogId: Number(rowData.JenisLogId || 0),
                IsLuring: Number(rowData.IsLuring || 0),
                Lokasi: String(rowData.Lokasi || ''),
                Keterangan: String(rowData.Keterangan || ''),
                Dosen: rowData.Dosen !== undefined && rowData.Dosen !== null && String(rowData.Dosen).trim() !== ''
                    ? String(rowData.Dosen).trim()
                    : undefined,
                FilePath: rowData.FilePath ? String(rowData.FilePath) : undefined,
            };

            // Log if any required field is missing
            if (!entry.Waktu || !entry.Keterangan) {
                console.warn(`Row ${rowNumber} missing required fields:`, entry);
            }

            entries.push(entry);
        });

        return entries;
    } catch (error) {
        throw new Error('Failed to parse Excel file: ' + (error as Error).message);
    }
}

export function parseCookieString(cookieStr: string): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};

    // Support both cookie header format and JSON format
    try {
        // Try parsing as JSON first
        const parsed = JSON.parse(cookieStr);
        return parsed;
    } catch {
        // Parse as cookie header format
        const pairs = cookieStr.split(';');
        pairs.forEach(pair => {
            const [key, ...valueParts] = pair.split('=');
            if (key && valueParts.length > 0) {
                cookies[key.trim()] = valueParts.join('=').trim();
            }
        });
    }

    return cookies;
}

export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Helper function to normalize file paths
function normalizePath(path: string): string {
    return path
        .replace(/\\/g, '/') // Convert backslashes to forward slashes
        .replace(/^\/+/, '') // Remove leading slashes
        .toLowerCase(); // Case-insensitive matching
}

// Helper to determine MIME type from filename
function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
}

// Parse ZIP file containing Excel + supporting files
export async function parseZipFile(zipFile: File): Promise<{
    entries: LogbookEntry[];
    files: Map<string, File>;
}> {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);

    // Find Excel file
    let excelFile: JSZip.JSZipObject | null = null;
    let excelFileName = '';

    for (const [filename, file] of Object.entries(zipContent.files)) {
        if (!file.dir && (filename.endsWith('.xlsx') || filename.endsWith('.xls') || filename.endsWith('.csv'))) {
            excelFile = file;
            excelFileName = filename;
            break;
        }
    }

    if (!excelFile) {
        throw new Error('No Excel file found in ZIP. Please include a .xlsx, .xls, or .csv file.');
    }

    // Extract and parse Excel
    const excelBlob = await excelFile.async('blob');
    const excelFileObj = new File([excelBlob], excelFileName);
    const entries = await parseExcelFile(excelFileObj);

    // Extract all other files (PDFs, images, etc.)
    const filesMap = new Map<string, File>();

    for (const [filename, file] of Object.entries(zipContent.files)) {
        // Skip directories and the Excel file itself
        if (file.dir || filename === excelFileName) {
            continue;
        }

        // Skip hidden files and system files
        if (filename.startsWith('.') || filename.startsWith('__MACOSX')) {
            continue;
        }

        const blob = await file.async('blob');
        const mimeType = getMimeType(filename);
        const fileObj = new File([blob], filename.split('/').pop() || filename, { type: mimeType });

        const normalizedPath = normalizePath(filename);
        filesMap.set(normalizedPath, fileObj);
    }



    // Match FilePath in entries with extracted files
    let matchedCount = 0;
    let missingCount = 0;

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.FilePath) {
            const normalizedFilePath = normalizePath(entry.FilePath);

            // Try exact match first
            let matchedFile = filesMap.get(normalizedFilePath);

            // If not found, try matching just the filename
            if (!matchedFile) {
                const filename = normalizedFilePath.split('/').pop() || '';
                for (const [path, file] of filesMap.entries()) {
                    if (path.endsWith(filename)) {
                        matchedFile = file;
                        break;
                    }
                }
            }

            if (matchedFile) {
                const base64 = await fileToBase64(matchedFile);
                entry.fileData = base64;
                entry.fileName = matchedFile.name;
                matchedCount++;
            } else {
                missingCount++;
                console.warn(`✗ Missing: ${entry.FilePath}`);
            }
        }
    }

    return { entries, files: filesMap };
}

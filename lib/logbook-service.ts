import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { LogbookEntry } from '@/types/logbook';

export function parseExcelFile(file: File): Promise<LogbookEntry[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                console.log('Total rows from Excel:', jsonData.length);

                const entries: LogbookEntry[] = jsonData
                    .filter((row: any) => {
                        // Skip empty rows
                        return row.Waktu || row.Keterangan || row.Lokasi;
                    })
                    .map((row: any, index: number) => {
                        const entry = {
                            Waktu: String(row.Waktu || ''),
                            Tstart: String(row.Tstart || ''),
                            Tend: String(row.Tend || ''),
                            JenisLogId: Number(row.JenisLogId || 0),
                            IsLuring: Number(row.IsLuring || 0),
                            Lokasi: String(row.Lokasi || ''),
                            Keterangan: String(row.Keterangan || ''),
                            Dosen: row.Dosen ? String(row.Dosen) : undefined,
                            FilePath: row.FilePath ? String(row.FilePath) : undefined,
                        };

                        // Log if any required field is missing
                        if (!entry.Waktu || !entry.Keterangan) {
                            console.warn(`Row ${index + 1} missing required fields:`, entry);
                        }

                        return entry;
                    });

                console.log('Parsed entries:', entries.length);
                console.log('First entry:', entries[0]);
                console.log('Last entry:', entries[entries.length - 1]);

                resolve(entries);
            } catch (error) {
                reject(new Error('Failed to parse Excel file: ' + (error as Error).message));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsBinaryString(file);
    });
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
    console.log('=== ZIP PARSING START ===');
    console.log('ZIP file:', zipFile.name, zipFile.size, 'bytes');

    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);

    console.log('ZIP loaded, files:', Object.keys(zipContent.files).length);

    // Find Excel file
    let excelFile: JSZip.JSZipObject | null = null;
    let excelFileName = '';

    for (const [filename, file] of Object.entries(zipContent.files)) {
        if (!file.dir && (filename.endsWith('.xlsx') || filename.endsWith('.xls') || filename.endsWith('.csv'))) {
            excelFile = file;
            excelFileName = filename;
            console.log('Found Excel file:', filename);
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

    console.log('Parsed', entries.length, 'entries from Excel');

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

        // Store with normalized path as key
        const normalizedPath = normalizePath(filename);
        filesMap.set(normalizedPath, fileObj);

        console.log('Extracted file:', filename, '→', normalizedPath, fileObj.size, 'bytes');
    }

    console.log('Total files extracted:', filesMap.size);

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
                        console.log(`Matched by filename: ${entry.FilePath} → ${path}`);
                        break;
                    }
                }
            }

            if (matchedFile) {
                // Convert file to base64 and attach to entry
                const base64 = await fileToBase64(matchedFile);
                entry.fileData = base64;
                entry.fileName = matchedFile.name;
                matchedCount++;
                console.log(`✓ Matched: ${entry.FilePath}`);
            } else {
                missingCount++;
                console.warn(`✗ Missing: ${entry.FilePath}`);
            }
        }
    }

    console.log(`File matching: ${matchedCount} matched, ${missingCount} missing`);
    console.log('=== ZIP PARSING COMPLETE ===');

    return { entries, files: filesMap };
}

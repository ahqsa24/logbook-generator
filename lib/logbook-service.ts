import * as XLSX from 'xlsx';
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

                const entries: LogbookEntry[] = jsonData.map((row: any) => ({
                    Waktu: String(row.Waktu || ''),
                    Tstart: String(row.Tstart || ''),
                    Tend: String(row.Tend || ''),
                    JenisLogId: Number(row.JenisLogId || 0),
                    IsLuring: Number(row.IsLuring || 0),
                    Lokasi: String(row.Lokasi || ''),
                    Keterangan: String(row.Keterangan || ''),
                    FilePath: row.FilePath ? String(row.FilePath) : undefined,
                }));

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

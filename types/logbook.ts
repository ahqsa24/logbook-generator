export interface LogbookEntry {
    Waktu: string;          // DD/MM/YYYY
    Tstart: string;         // HH:MM
    Tend: string;           // HH:MM
    JenisLogId: number;     // 1, 2, or 3
    IsLuring: number;       // 0 (online), 1 (offline), 2 (hybrid)
    Lokasi: string;
    Keterangan: string;
    FilePath?: string;
    fileData?: string;      // base64 encoded file
    fileName?: string;      // original file name
    validation?: {
        isValid: boolean;
        errors: string[];
    };
}

export interface SubmissionResult {
    row?: number;
    status?: 'success' | 'error' | 'pending' | 'processing';
    statusCode?: number | string;
    error?: string;
    success?: boolean;
    message?: string;
    entry?: LogbookEntry;
}

export interface CookieData {
    [key: string]: string;
}

export interface SubmitLogbookRequest {
    aktivitasId: string;
    cookies: CookieData;
    entry: LogbookEntry;
    fileData?: {
        name: string;
        data: string; // base64
        type: string;
    };
}

export interface SubmitLogbookResponse {
    success: boolean;
    statusCode: number;
    error?: string;
}

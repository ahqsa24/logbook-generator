/**
 * CSV and XLSX export utilities
 */

import { SubmissionResult, Lecturer } from '@/types/logbook';
import { getJenisLogLabel, getModeLabel, getDosenNames, escapeCSV } from './formatters';

export const exportToCSV = (results: SubmissionResult[], lecturers: Lecturer[]) => {
    // CSV Header matching Step 4 table
    const headers = ['No', 'Waktu', 'Keterangan', 'Durasi', 'Media', 'Jenis Kegiatan', 'Dosen Penggerak', 'Dokumen', 'Status', 'Error'];

    // CSV Rows
    const rows = results.map((r, idx) => {
        const entry = r.entry;
        const durasi = entry ? `${entry.Tstart} - ${entry.Tend}` : '-';
        const status = r.status === 'success' ? 'Success' : 'Error';
        const errorMsg = r.status === 'success' ? '' : (r.error || '');

        return [
            String(idx + 1), // No
            escapeCSV(entry?.Waktu), // Waktu
            escapeCSV(entry?.Keterangan), // Keterangan
            escapeCSV(durasi), // Durasi
            escapeCSV(entry ? getModeLabel(entry.IsLuring) : '-'), // Media
            escapeCSV(entry ? getJenisLogLabel(entry.JenisLogId) : '-'), // Jenis Kegiatan
            escapeCSV(getDosenNames(entry?.Dosen, lecturers)), // Dosen Penggerak
            escapeCSV(entry?.fileName || '-'), // Dokumen
            status, // Status
            escapeCSV(errorMsg) // Error
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logbook-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportToXLSX = async (results: SubmissionResult[], lecturers: Lecturer[]) => {
    // Dynamically import ExcelJS to avoid SSR issues
    const ExcelJS = await import('exceljs');

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Logbook Results');

    // Define columns with headers and widths
    worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Waktu', key: 'waktu', width: 12 },
        { header: 'Keterangan', key: 'keterangan', width: 40 },
        { header: 'Durasi', key: 'durasi', width: 15 },
        { header: 'Media', key: 'media', width: 10 },
        { header: 'Jenis Kegiatan', key: 'jenisKegiatan', width: 15 },
        { header: 'Dosen Penggerak', key: 'dosen', width: 15 },
        { header: 'Dokumen', key: 'dokumen', width: 20 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Error', key: 'error', width: 30 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF9333EA' } // Purple
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    results.forEach((r, idx) => {
        const entry = r.entry;
        const durasi = entry ? `${entry.Tstart} - ${entry.Tend}` : '-';
        const status = r.status === 'success' ? 'Success' : 'Error';
        const errorMsg = r.status === 'success' ? '' : (r.error || '');

        worksheet.addRow({
            no: idx + 1,
            waktu: entry?.Waktu || '-',
            keterangan: entry?.Keterangan || '-',
            durasi: durasi,
            media: entry ? getModeLabel(entry.IsLuring) : '-',
            jenisKegiatan: entry ? getJenisLogLabel(entry.JenisLogId) : '-',
            dosen: getDosenNames(entry?.Dosen, lecturers),
            dokumen: entry?.fileName || '-',
            status: status,
            error: errorMsg
        });

        // Color code status column
        const row = worksheet.lastRow;
        if (row) {
            const statusCell = row.getCell('status');
            if (status === 'Success') {
                statusCell.font = { color: { argb: 'FF22C55E' }, bold: true }; // Green
            } else {
                statusCell.font = { color: { argb: 'FFEF4444' }, bold: true }; // Red
            }
        }
    });

    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logbook-results-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
};

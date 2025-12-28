'use client';

interface Step2FileUploadProps {
    onFileUpload: (file: File) => void;
    onBack: () => void;
}

export default function Step2FileUpload({
    onFileUpload,
    onBack,
}: Step2FileUploadProps) {
    const handleDownloadTemplate = () => {
        // Create template data
        const templateData = [
            ['Waktu', 'Tstart', 'Tend', 'JenisLogId', 'IsLuring', 'Lokasi', 'Keterangan', 'FilePath'],
            ['25/08/2025', '08:00', '16:00', '3', '1', 'PT Islam Pacific Indonesia Lines (SPIL) - Tanjung Priok', 'Orientasi perusahaan dan pengenalan sistem logistik SPIL, dengan aktivitas melakukan koordinasi harian dan mempelajari standar pengembangan internal perusahaan', ''],
            ['26/08/2025', '08:00', '16:00', '3', '1', 'PT Islam Pacific Indonesia Lines (SPIL) - Tanjung Priok', 'Orientasi perusahaan dan pengenalan sistem logistik SPIL, dengan aktivitas melakukan koordinasi harian dan mempelajari standar pengembangan internal perusahaan', ''],
        ];

        // Convert to CSV
        const csv = templateData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'logbook-template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-purple-900 dark:text-purple-300 mb-6">
                Step 2: Upload Excel File
            </h2>

            <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Upload your Excel file containing logbook entries. Make sure it follows the correct format.
                </p>

                <button
                    onClick={handleDownloadTemplate}
                    className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Template
                </button>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-12 text-center hover:border-purple-500 dark:hover:border-purple-600 transition-colors duration-200 bg-purple-50 dark:bg-gray-700/50">
                <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileUpload(file);
                    }}
                    className="hidden"
                    id="excel-upload"
                />
                <label htmlFor="excel-upload" className="cursor-pointer">
                    <div className="text-purple-600 dark:text-purple-400 mb-2">
                        <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Excel files (.xlsx, .xls) or CSV files
                    </p>
                </label>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    📋 Required Excel Format:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li><strong>Waktu</strong>: Date in DD/MM/YYYY format</li>
                    <li><strong>Tstart</strong>: Start time in HH:MM format</li>
                    <li><strong>Tend</strong>: End time in HH:MM format</li>
                    <li><strong>JenisLogId</strong>: 1 (Pembimbingan), 2 (Ujian), or 3 (Kegiatan)</li>
                    <li><strong>IsLuring</strong>: 0 (Online), 1 (Offline), or 2 (Hybrid)</li>
                    <li><strong>Lokasi</strong>: Location text</li>
                    <li><strong>Keterangan</strong>: Activity description</li>
                    <li><strong>FilePath</strong>: (Optional) Path to supporting file</li>
                </ul>
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    onClick={onBack}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
            </div>
        </div>
    );
}

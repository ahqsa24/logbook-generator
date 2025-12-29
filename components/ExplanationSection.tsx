'use client';

export default function ExplanationSection() {
    return (
        <section id="explanation-section" className="min-h-screen flex items-center justify-center py-20 px-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-3">
                        How to Use
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Follow these simple steps to automate your logbook submission</p>
                </div>

                <div className="card dark:bg-gray-800 dark:border-gray-700 mb-8">
                    <ol className="space-y-4 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-semibold text-sm mr-4 mt-0.5 flex-shrink-0">
                                1
                            </span>
                            <div>
                                <strong className="text-lg text-purple-900 dark:text-purple-300">Choose Authentication Method</strong>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    <strong>Option 1 (Recommended):</strong> Login with IPB username & password - easiest method!<br />
                                    <strong>Option 2 (Advanced):</strong> Manually enter 3 session cookies from browser DevTools
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-semibold text-sm mr-4 mt-0.5 flex-shrink-0">
                                2
                            </span>
                            <div>
                                <strong className="text-lg text-purple-900 dark:text-purple-300">Enter your Aktivitas ID</strong>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Find it in the Student Portal logbook page URL (.../Index/[ID])</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-semibold text-sm mr-4 mt-0.5 flex-shrink-0">
                                3
                            </span>
                            <div>
                                <strong className="text-lg text-purple-900 dark:text-purple-300">Upload your Excel file</strong>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Use our template format with columns: Waktu, Tstart, Tend, JenisLogId, IsLuring, Lokasi, Keterangan</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-semibold text-sm mr-4 mt-0.5 flex-shrink-0">
                                4
                            </span>
                            <div>
                                <strong className="text-lg text-purple-900 dark:text-purple-300">Submit and track progress</strong>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">All entries will be uploaded automatically with real-time progress tracking</p>
                            </div>
                        </li>
                    </ol>
                </div>

                {/* Excel Format Table */}
                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-4">
                        Excel File Format
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-purple-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-200">Column</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-200">Format</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-200">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-100 dark:divide-gray-700">
                                <tr className="hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">Waktu</td>
                                    <td className="px-4 py-3 font-mono text-xs bg-purple-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300">DD/MM/YYYY</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-400">Date of activity (e.g., 15/01/2024)</td>
                                </tr>
                                <tr className="hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">Tstart</td>
                                    <td className="px-4 py-3 font-mono text-xs bg-purple-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300">HH:MM</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-400">Start time (e.g., 09:00)</td>
                                </tr>
                                <tr className="hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">Tend</td>
                                    <td className="px-4 py-3 font-mono text-xs bg-purple-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300">HH:MM</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-400">End time (e.g., 11:00)</td>
                                </tr>
                                <tr className="hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">JenisLogId</td>
                                    <td className="px-4 py-3 font-mono text-xs bg-purple-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300">1, 2, or 3</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-400">Activity type: 1=Pembimbingan, 2=Ujian, 3=Kegiatan</td>
                                </tr>
                                <tr className="hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">IsLuring</td>
                                    <td className="px-4 py-3 font-mono text-xs bg-purple-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300">0, 1, or 2</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-400">Mode: 0=Online, 1=Offline, 2=Hybrid</td>
                                </tr>
                                <tr className="hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">Lokasi</td>
                                    <td className="px-4 py-3 font-mono text-xs bg-purple-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300">Text</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-400">Location (e.g., &quot;Zoom&quot; or &quot;Gedung A&quot;)</td>
                                </tr>
                                <tr className="hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">Keterangan</td>
                                    <td className="px-4 py-3 font-mono text-xs bg-purple-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300">Text</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-400">Activity description</td>
                                </tr>
                                <tr className="hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">Dosen</td>
                                    <td className="px-4 py-3 font-mono text-xs bg-purple-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300">1, 2, 1,2,3</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-400">Lecturer selection (e.g., "1" or "1,2")</td>
                                </tr>
                                <tr className="hover:bg-purple-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-300">FilePath</td>
                                    <td className="px-4 py-3 font-mono text-xs bg-purple-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300">Text</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-400">Optional: File path (e.g., "files/bukti1.pdf")</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

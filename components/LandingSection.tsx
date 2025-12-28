'use client';

const creators = [
    { name: 'Ahmad Nur Rohim', github: 'https://github.com/anro128', instagram: 'https://instagram.com/ahmadnr_12' },
    { name: 'Ahmad Qaulan Sadida', github: 'https://github.com/ahqsa24', instagram: 'https://instagram.com/adidsadida24' },
];

export default function LandingSection() {
    return (
        <section id="landing-section" className="relative min-h-screen flex items-center justify-center py-20 px-4">
            {/* Decorative Background Elements */}
            <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 dark:opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 dark:opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10"></div>

            <div className="max-w-6xl w-full relative z-10">
                {/* Main Content - Centered */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                        </div>
                    </div>

                    {/* Gradient Title - Fixed clipping */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 dark:from-purple-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent pb-2 leading-tight">
                        IPB Logbook Generator
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-4 leading-relaxed font-medium">
                        Automated logbook submission tool for <span className="text-purple-600 dark:text-purple-400 font-bold">IPB Student Portal</span>
                    </p>

                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                        Save time and effort with intelligent batch processing
                    </p>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                        <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 px-4 py-2 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-shadow">
                            Batch Upload
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 px-4 py-2 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-shadow">
                            Fast Processing
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 px-4 py-2 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-shadow">
                            Secure & Private
                        </div>
                    </div>

                    {/* Creators Section - Compact */}
                    <div className="mt-12 pt-8 border-t border-purple-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 text-center mb-4">Created By</h3>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {creators.map((creator, index) => (
                                <div
                                    key={index}
                                    className="group bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-xl px-4 py-3 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-gray-900 dark:text-gray-200 text-sm">{creator.name}</span>
                                        <div className="flex gap-2">
                                            <a
                                                href={creator.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-1.5 rounded-lg transition-all duration-200"
                                                title="GitHub"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                </svg>
                                            </a>
                                            <a
                                                href={creator.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-1.5 rounded-lg transition-all duration-200"
                                                title="Instagram"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

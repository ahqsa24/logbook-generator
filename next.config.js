/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Transpile docx-preview for proper bundling
    transpilePackages: ['docx-preview'],
    // Increase body size limit for file uploads
    experimental: {
        serverActions: {
            bodySizeLimit: '15mb',
        },
    },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Increase body size limit for file uploads
    experimental: {
        serverActions: {
            bodySizeLimit: '15mb',
        },
    },
}

module.exports = nextConfig

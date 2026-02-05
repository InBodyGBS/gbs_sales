/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router doesn't use api.bodyParser config
  // Body size is handled by Vercel deployment settings
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
}

module.exports = nextConfig
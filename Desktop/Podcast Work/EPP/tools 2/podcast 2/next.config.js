/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['*'], // Allow all domains for podcast cover art
  },
  // Disable x-powered-by header for security
  poweredByHeader: false,
}

module.exports = nextConfig

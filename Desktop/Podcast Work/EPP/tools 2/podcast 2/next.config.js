/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['*'], // Allow all domains for podcast cover art
  },
}

module.exports = nextConfig

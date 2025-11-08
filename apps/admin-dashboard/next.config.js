/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Share Prisma client with deployment-platform
  transpilePackages: ['@prisma/client'],
}

module.exports = nextConfig

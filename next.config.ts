import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable standalone output due to Windows symlink issues
  // output: 'standalone',

  // Skip linting during build (for now)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip type checking during build (for now)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization for production
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

export default nextConfig;

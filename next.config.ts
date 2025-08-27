import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.informaniak.com',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://informaniak.com',
  },
  images: {
    unoptimized: true,
    domains: ['api.informaniak.com', 'localhost', 'helvetiforma.ch'],
  },
  // Disable static generation completely
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  // Enable static exports for GitHub Pages
  // output: 'export',
  // trailingSlash: true,
};

export default nextConfig;

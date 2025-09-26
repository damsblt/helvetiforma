import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://helvetiforma.vercel.app' : 'http://localhost:3000'),
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://helvetiforma.vercel.app' : 'http://localhost:3000'),
  },
  images: {
    unoptimized: true,
    domains: ['api.helvetiforma.ch', 'localhost'],
  },
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL' // Allow iframes from external domains for Tutor LMS integration
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://api.helvetiforma.ch https://*.helvetiforma.ch;"
          }
        ]
      }
    ];
  },
};

export default nextConfig;
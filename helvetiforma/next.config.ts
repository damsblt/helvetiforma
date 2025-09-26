import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://helvetiforma.vercel.app' : 'http://localhost:3000'),
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://helvetiforma.vercel.app' : 'http://localhost:3000'),
  },
  images: {
    unoptimized: true,
    domains: ['api.informaniak.com', 'localhost', 'helvetiforma.ch'],
  },
  // Disable static generation completely
  trailingSlash: false,
  // Enable static exports for Netlify (disabled for development with API routes)
  // output: 'export',
  // distDir: 'out',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://api.helvetiforma.ch https://helvetiforma.ch https://*.helvetiforma.ch;"
          },
          {
            key: 'Permissions-Policy',
            value: 'payment=*, fullscreen=*, camera=*, microphone=*, geolocation=*'
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
  // Disable server-side features for static export
  // experimental: {
  //   esmExternals: false,
  // },
};

export default nextConfig;

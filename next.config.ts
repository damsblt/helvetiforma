import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // App Router optimisé
  // typedRoutes: true, // Désactivé temporairement pour éviter les erreurs de build
  
  // Images optimisées
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.helvetiforma.ch',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.helvetiforma.ch',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // MDX Support
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  
  // Redirects pour SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
import React from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import './globals.css';
import type { Metadata } from 'next';
import HeaderButtons from '../components/HeaderButtons';
import StructuredData from '../components/StructuredData';

export const metadata: Metadata = {
  title: {
    default: 'HelvetiForma - Formations professionnelles en Suisse',
    template: '%s | HelvetiForma'
  },
  description: 'Plateforme de formations professionnelles en Suisse. Formations continues, e-learning et développement des compétences pour entreprises et particuliers.',
  keywords: ['formations', 'professionnelles', 'Suisse', 'e-learning', 'développement', 'compétences', 'formation continue'],
  authors: [{ name: 'HelvetiForma' }],
  creator: 'HelvetiForma',
  publisher: 'HelvetiForma',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://helvetiforma.ch'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CH',
    url: 'https://helvetiforma.ch',
    title: 'HelvetiForma - Formations professionnelles en Suisse',
    description: 'Plateforme de formations professionnelles en Suisse. Formations continues, e-learning et développement des compétences.',
    siteName: 'HelvetiForma',
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'HelvetiForma - Formations professionnelles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HelvetiForma - Formations professionnelles en Suisse',
    description: 'Plateforme de formations professionnelles en Suisse. Formations continues, e-learning et développement des compétences.',
    images: ['/images/hero-bg.jpg'],
    creator: '@helvetiforma',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <StructuredData />
        {/* Preload critical images for better performance */}
        <link 
          rel="preload" 
          href="/images/hero-bg.jpg" 
          as="image" 
          type="image/jpeg"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto flex items-center justify-between py-3 px-4 lg:px-8">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-700 mr-6 lg:mr-8">
                HelvetiForma
              </Link>
              <Navigation />
            </div>

            {/* Right side buttons */}
            <HeaderButtons />
          </div>
        </header>

        <main className="flex-1 w-full pt-0">{children}</main>

        {/* Footer */}
        <footer className="bg-green-100 py-6 mt-auto">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
            <div className="text-gray-600 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} HelvetiForma. Tous droits réservés.
            </div>
            <div className="flex gap-4 mt-2 md:mt-0 text-sm">
              <Link href="/cgu" className="text-gray-600 hover:text-blue-700">CGU</Link>
              <Link href="/mentions" className="text-gray-600 hover:text-blue-700">Mentions légales</Link>
              <span className="text-gray-400">Réseaux sociaux</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
// Helvetiforma Custom App - Tue Aug 26 13:35:43 CEST 2025

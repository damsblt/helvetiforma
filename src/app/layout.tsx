import React from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import './globals.css';
import type { Metadata } from 'next';
import HeaderButtons from '../components/HeaderButtons';

export const metadata: Metadata = {
  title: 'Helvetiforma - Formations professionnelles',
  description: 'Plateforme de formations professionnelles en Suisse',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between py-3 px-4 lg:px-8">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-700 mr-6 lg:mr-8">
                Helvetiforma
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
              &copy; {new Date().getFullYear()} Helvetiforma. Tous droits réservés.
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

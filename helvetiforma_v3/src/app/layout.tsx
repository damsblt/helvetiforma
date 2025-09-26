import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'HelvetiForma - Formation Professionnelle en Suisse',
    template: '%s | HelvetiForma',
  },
  description: 'Formations certifiées en comptabilité et gestion d\'entreprise pour professionnels suisses. Cours en ligne, webinaires interactifs et accompagnement personnalisé.',
  keywords: ['formation', 'comptabilité', 'suisse', 'certification', 'webinaire', 'e-learning'],
  authors: [{ name: 'HelvetiForma' }],
  creator: 'HelvetiForma',
  publisher: 'HelvetiForma',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CH',
    url: '/',
    title: 'HelvetiForma - Formation Professionnelle en Suisse',
    description: 'Formations certifiées en comptabilité et gestion d\'entreprise pour professionnels suisses.',
    siteName: 'HelvetiForma',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HelvetiForma - Formation Professionnelle en Suisse',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HelvetiForma - Formation Professionnelle en Suisse',
    description: 'Formations certifiées en comptabilité et gestion d\'entreprise pour professionnels suisses.',
    images: ['/images/og-image.jpg'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          {/* Header Navigation */}
          <Header />
          
          {/* Main Content */}
          <main className="flex-1 pt-16">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </body>
    </html>
  )
}
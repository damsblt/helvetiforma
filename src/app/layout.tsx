import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HelvetiForma - Formation professionnelle en Suisse",
  description: "Plateforme de formation professionnelle spécialisée en comptabilité, paie et gestion d'entreprise en Suisse.",
  keywords: "formation, comptabilité, paie, Suisse, HelvetiForma, Tutor LMS",
  other: {
    // Prevent WordPress stats and tracking scripts from loading
    'referrer': 'no-referrer-when-downgrade',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Block WordPress stats scripts and optimize preloading */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Block WordPress stats scripts that cause console errors
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  if (e.filename && (e.filename.includes('stats.wp.com') || e.filename.includes('wordpress.com'))) {
                    e.preventDefault();
                    return false;
                  }
                });
                
                // Suppress preload warnings
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('preloaded using link preload but not used') || 
                      message.includes('stats.wp.com') || 
                      message.includes('wordpress.com')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
                
                // Initialize optimizations when DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    // Remove unused preload links after page load
                    setTimeout(function() {
                      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
                      preloadLinks.forEach(function(link) {
                        if (link.href && !document.querySelector('script[src="' + link.href + '"], link[href="' + link.href + '"]')) {
                          link.remove();
                        }
                      });
                    }, 5000);
                  });
                } else {
                  // DOM is already ready
                  setTimeout(function() {
                    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
                    preloadLinks.forEach(function(link) {
                      if (link.href && !document.querySelector('script[src="' + link.href + '"], link[href="' + link.href + '"]')) {
                        link.remove();
                      }
                    });
                  }, 5000);
                }
              }
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">HelvetiForma</h3>
                <p className="text-gray-300">
                  Formation professionnelle de qualité en Suisse, spécialisée en comptabilité, paie et gestion d'entreprise.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="/concept" className="hover:text-white transition-colors">Concept</a></li>
                  <li><a href="/formations" className="hover:text-white transition-colors">Formations</a></li>
                  <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <div className="text-gray-300 space-y-2">
                  <p>Email: info@helvetiforma.ch</p>
                  <p>Suisse</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
              <p>&copy; 2024 HelvetiForma. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { navigationConfig } from '@/lib/navigation'
import type { NavigationConfig } from '@/lib/navigation'

export default function Footer() {
  const [navigation, setNavigation] = useState<NavigationConfig | null>(null)

  useEffect(() => {
    setNavigation(navigationConfig)
  }, [])

  if (!navigation) {
    return (
      <footer className="bg-muted/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-32 h-3 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info - Colonne de gauche */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-foreground">HelvetiForma</span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Formation professionnelle. 
              Développez vos compétences avec des experts reconnus.
            </p>
          </div>

          {/* Footer Links - Colonnes du centre et droite */}
          {navigation.footer.map((section, index) => (
            <div key={section.title} className={`lg:col-span-1 ${index === 0 ? 'text-center' : 'text-left'}`}>
              <h3 className="font-semibold text-foreground mb-4">
                {section.title}
              </h3>
              {index === 1 ? (
                // Section Contact simplifiée
                <div className="space-y-3">
                  <div>
                    <Link
                      href="mailto:contact@helvetiforma.ch"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      contact@helvetiforma.ch
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="tel:+41793090640"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      +41 79 309 06 40
                    </Link>
                  </div>
                </div>
              ) : (
                // Section Ressources avec liens
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        {...(link.external && {
                          target: '_blank',
                          rel: 'noopener noreferrer'
                        })}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>© 2024 HelvetiForma. Tous droits réservés.</span>
              <Link href="/mentions" className="hover:text-foreground transition-colors">
                Mentions légales
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Confidentialité
              </Link>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>🇨🇭 Fabriqué en Suisse par Damien Balet</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

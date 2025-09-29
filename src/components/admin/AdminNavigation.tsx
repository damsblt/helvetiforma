'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AdminNavigation() {
  const pathname = usePathname()

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">HelvetiForma</h1>
              <p className="text-xs text-muted-foreground">Administration</p>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-4">
            {/* Preview Site */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Voir le site
            </Link>

            {/* Save All Button */}
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              💾 Sauvegarder tout
            </button>

            {/* User Menu */}
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

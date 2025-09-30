'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface PageItem {
  slug: string
  title: string
  lastModified: string
  status: 'published' | 'draft'
}

export default function PagesManagement() {
  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadPages = async () => {
      try {
        // Utiliser des pages statiques pour éviter les problèmes client/serveur
        const staticPages: PageItem[] = [
          { slug: 'home', title: 'Accueil', lastModified: '2024-01-15', status: 'published' },
          { slug: 'concept', title: 'Notre Concept', lastModified: '2024-01-14', status: 'published' },
          { slug: 'contact', title: 'Contact', lastModified: '2024-01-13', status: 'published' },
        ]
        
        setPages(staticPages)
      } catch (error) {
        console.error('Error loading pages:', error)
        const fallbackPages: PageItem[] = [
          { slug: 'home', title: 'Accueil', lastModified: '2024-01-15', status: 'published' },
          { slug: 'concept', title: 'Notre Concept', lastModified: '2024-01-14', status: 'published' },
          { slug: 'contact', title: 'Contact', lastModified: '2024-01-13', status: 'published' },
        ]
        setPages(fallbackPages)
      } finally {
        setLoading(false)
      }
    }

    loadPages()
  }, [])

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Pages</h1>
          <p className="text-muted-foreground">
            Gérez le contenu de vos pages statiques
          </p>
        </div>
        
        <Link
          href="/admin/content/pages/new" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Nouvelle page
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher une page..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Pages List */}
      <div className="space-y-3">
        {filteredPages.map((page, index) => (
          <motion.div
            key={page.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {page.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    page.status === 'published' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {page.status === 'published' ? '✅ Publié' : '⏳ Brouillon'}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Slug: /{page.slug}</span>
                  <span>•</span>
                  <span>Modifié le {new Date(page.lastModified).toLocaleDateString('fr-CH')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Preview Button */}
                <Link
                  href={`/${page.slug === 'home' ? '' : page.slug}`}
                  target="_blank"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Prévisualiser"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>

                {/* Edit Button */}
                <Link
                  href={`/admin/content/pages/edit/${page.slug}`}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Éditer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
                      // Logique de suppression
                      console.log('Delete page:', page.slug)
                    }
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'Aucune page trouvée' : 'Aucune page'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Essayez avec d\'autres termes de recherche'
              : 'Commencez par créer votre première page'
            }
          </p>
          {!searchTerm && (
            <Link
              href="/admin/content/pages/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <span className="text-lg">+</span>
              Créer une page
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

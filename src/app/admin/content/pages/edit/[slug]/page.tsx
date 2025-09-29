'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface PageContent {
  slug: string
  title: string
  description: string
  frontmatter: Record<string, any>
  contentHtml: string
}

interface PageEditorProps {
  params: Promise<{ slug: string }>
}

export default function PageEditor({ params }: PageEditorProps) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>('')
  const [pageContent, setPageContent] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const resolvedParams = await params
        setSlug(resolvedParams.slug)
        
        // Simuler le chargement du contenu de la page
        const mockContent: PageContent = {
          slug: resolvedParams.slug,
          title: getPageTitle(resolvedParams.slug),
          description: getPageDescription(resolvedParams.slug),
          frontmatter: {},
          contentHtml: getPageContent(resolvedParams.slug)
        }
        
        setPageContent(mockContent)
        setTitle(mockContent.title)
        setDescription(mockContent.description)
        setContent(mockContent.contentHtml)
      } catch (err) {
        setError('Erreur lors du chargement de la page')
        console.error('Error loading page:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [params])

  const getPageTitle = (slug: string): string => {
    switch (slug) {
      case 'home': return 'Accueil'
      case 'concept': return 'Notre Concept'
      case 'contact': return 'Contact'
      default: return 'Page'
    }
  }

  const getPageDescription = (slug: string): string => {
    switch (slug) {
      case 'home': return 'Page d\'accueil de HelvetiForma'
      case 'concept': return 'Notre approche pédagogique unique'
      case 'contact': return 'Contactez notre équipe'
      default: return 'Description de la page'
    }
  }

  const getPageContent = (slug: string): string => {
    switch (slug) {
      case 'home': return `# Bienvenue sur HelvetiForma

## Votre partenaire formation en Suisse

HelvetiForma vous accompagne dans votre développement professionnel avec des formations certifiées et reconnues.

### Nos avantages

- Formation en ligne flexible
- Webinaires interactifs
- Certification reconnue
- Support personnalisé`

      case 'concept': return `# Notre Concept Pédagogique

## Une approche innovante

Notre méthode d'apprentissage combine le meilleur de la formation en ligne et des interactions humaines.

### Nos piliers

1. **Flexibilité** - Apprenez à votre rythme
2. **Qualité** - Contenus créés par des experts
3. **Accompagnement** - Support personnalisé
4. **Certification** - Diplômes reconnus`

      case 'contact': return `# Contactez-nous

## Notre équipe est à votre écoute

N'hésitez pas à nous contacter pour toute question sur nos formations.

### Coordonnées

- **Email** : info@helvetiforma.ch
- **Téléphone** : +41 21 123 45 67
- **Adresse** : 123 Rue de la Formation, 1000 Lausanne

### Horaires

Du lundi au vendredi : 9h00 - 17h00`

      default: return '# Contenu de la page\n\nVotre contenu ici...'
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // En production, ici on ferait l'appel API
      console.log('Saving page:', { slug, title, description, content })
      
      // Rediriger vers la liste des pages
      router.push('/admin/content/pages')
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
      console.error('Error saving page:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Chargement...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !pageContent) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-destructive mb-2">Erreur</h2>
            <p className="text-muted-foreground">{error}</p>
            <Link 
              href="/admin/content/pages"
              className="inline-block mt-4 text-primary hover:underline"
            >
              ← Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/content/pages"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Éditer : {title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Slug: /{slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/content/pages')}
                className="px-4 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                )}
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6"
          >
            <p className="text-destructive text-sm">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Éditeur */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Métadonnées</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Titre de la page"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Description de la page"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Contenu Markdown</h2>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="# Votre contenu en Markdown

## Sous-titre

Votre texte ici..."
              />
            </div>
          </div>

          {/* Prévisualisation */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Prévisualisation</h2>
            
            <div className="prose dark:prose-invert max-w-none">
              <div className="border border-border rounded-lg p-4 bg-background min-h-[500px]">
                <div className="whitespace-pre-wrap text-foreground">
                  {content || 'Tapez votre contenu pour voir la prévisualisation...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

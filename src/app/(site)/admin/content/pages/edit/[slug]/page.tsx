'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { getPageContentClient, updatePageContentClient } from '@/lib/content-client'

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
  const [sections, setSections] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const resolvedParams = await params
        setSlug(resolvedParams.slug)
        const existing = await getPageContentClient(resolvedParams.slug)
        if (!existing) {
          setError('Page introuvable')
          return
        }
        setPageContent({
          slug: existing.slug,
          title: existing.title,
          description: existing.description,
          frontmatter: {},
          contentHtml: existing.content || ''
        })
        setTitle(existing.title || '')
        setDescription(existing.description || '')
        setSections(Array.isArray((existing as any).sections) ? (existing as any).sections : [])
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
      const ok = await updatePageContentClient(slug, {
        slug,
        title,
        description,
        content: '',
        sections: sections.map((s) => ({
          type: s.type,
          title: s.title,
          subtitle: s.subtitle,
          items: s.items,
          limit: s.limit,
          cta_primary: s.cta_primary,
          cta_secondary: s.cta_secondary,
          markdown: s.markdown,
          columns: s.columns,
          columnsContent: s.columnsContent,
        })),
      } as any)
      if (!ok) {
        throw new Error('Échec de la sauvegarde')
      }
      
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

            {/* Sections Editor */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Sections</h2>
              {/* Add Section Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSections(prev => [...prev, { type: 'columns', columns: 1, title: '', subtitle: '', markdown: '', columnsContent: [{ title: '', description: '', markdown: '' }] }])}
                  className="px-3 py-2 text-sm border border-border rounded-md hover:bg-muted"
                >
                  + Ajouter section 1 colonne
                </button>
                <button
                  onClick={() => setSections(prev => [...prev, { type: 'columns', columns: 2, title: '', subtitle: '', markdown: '', columnsContent: [{ title: '', description: '', markdown: '' }, { title: '', description: '', markdown: '' }] }])}
                  className="px-3 py-2 text-sm border border-border rounded-md hover:bg-muted"
                >
                  + Ajouter section 2 colonnes
                </button>
                <button
                  onClick={() => setSections(prev => [...prev, { type: 'columns', columns: 3, title: '', subtitle: '', markdown: '', columnsContent: [{ title: '', description: '', markdown: '' }, { title: '', description: '', markdown: '' }, { title: '', description: '', markdown: '' }] }])}
                  className="px-3 py-2 text-sm border border-border rounded-md hover:bg-muted"
                >
                  + Ajouter section 3 colonnes
                </button>
              </div>

              <div className="space-y-6">
                {sections.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune section n'est définie dans cette page.</p>
                )}
                {sections.map((section, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Section {index + 1}</div>
                        <div className="font-semibold">Type: <span className="font-mono text-sm">{section.type}</span></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (index === 0) return
                            const next = [...sections]
                            const [removed] = next.splice(index, 1)
                            next.splice(index - 1, 0, removed)
                            setSections(next)
                          }}
                          className="text-sm px-2 py-1 border border-border rounded hover:bg-muted"
                        >
                          ↑ Monter
                        </button>
                        <button
                          onClick={() => {
                            if (index === sections.length - 1) return
                            const next = [...sections]
                            const [removed] = next.splice(index, 1)
                            next.splice(index + 1, 0, removed)
                            setSections(next)
                          }}
                          className="text-sm px-2 py-1 border border-border rounded hover:bg-muted"
                        >
                          ↓ Descendre
                        </button>
                        <button
                          onClick={() => {
                            const next = [...sections]
                            next.splice(index, 1)
                            setSections(next)
                          }}
                          className="text-sm px-2 py-1 border border-destructive text-destructive rounded hover:bg-destructive/10"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Disposition</label>
                        <select
                          value={section.columns || 1}
                          onChange={(e) => {
                            const next = [...sections]
                            next[index] = { ...next[index], columns: Number(e.target.value) as 1 | 2 | 3 }
                            setSections(next)
                          }}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value={1}>1 colonne</option>
                          <option value={2}>2 colonnes</option>
                          <option value={3}>3 colonnes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Titre</label>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => {
                            const next = [...sections]
                            next[index] = { ...next[index], title: e.target.value }
                            setSections(next)
                          }}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Titre de la section"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Sous-titre</label>
                        <input
                          type="text"
                          value={section.subtitle || ''}
                          onChange={(e) => {
                            const next = [...sections]
                            next[index] = { ...next[index], subtitle: e.target.value }
                            setSections(next)
                          }}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Sous-titre de la section"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">Markdown</label>
              <textarea
                        value={section.markdown || ''}
                        onChange={(e) => {
                          const next = [...sections]
                          next[index] = { ...next[index], markdown: e.target.value }
                          setSections(next)
                        }}
                        rows={10}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        placeholder="# Votre texte de section en Markdown"
                      />
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-foreground">Colonnes</label>
                        <button
                          onClick={() => {
                            const next = [...sections]
                            const cols = Array.isArray(next[index].columnsContent) ? next[index].columnsContent : []
                            next[index] = { ...next[index], columnsContent: [...cols, { title: '', description: '', markdown: '' }] }
                            setSections(next)
                          }}
                          className="text-primary text-sm hover:underline"
                        >
                          + Ajouter une colonne
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(section.columnsContent || []).map((col: any, cIdx: number) => (
                          <div key={cIdx} className="border border-border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs uppercase tracking-wide text-muted-foreground">Colonne {cIdx + 1}</div>
                              <button
                                onClick={() => {
                                  const next = [...sections]
                                  const cols = [...(next[index].columnsContent || [])]
                                  cols.splice(cIdx, 1)
                                  next[index] = { ...next[index], columnsContent: cols }
                                  setSections(next)
                                }}
                                className="text-destructive text-xs hover:underline"
                              >
                                Supprimer
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              <input
                                type="text"
                                value={col.title || ''}
                                onChange={(e) => {
                                  const next = [...sections]
                                  const cols = [...(next[index].columnsContent || [])]
                                  cols[cIdx] = { ...cols[cIdx], title: e.target.value }
                                  next[index] = { ...next[index], columnsContent: cols }
                                  setSections(next)
                                }}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                placeholder="Titre"
                              />
                              <input
                                type="text"
                                value={col.description || ''}
                                onChange={(e) => {
                                  const next = [...sections]
                                  const cols = [...(next[index].columnsContent || [])]
                                  cols[cIdx] = { ...cols[cIdx], description: e.target.value }
                                  next[index] = { ...next[index], columnsContent: cols }
                                  setSections(next)
                                }}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                                placeholder="Description"
                              />
                              <textarea
                                value={col.markdown || ''}
                                onChange={(e) => {
                                  const next = [...sections]
                                  const cols = [...(next[index].columnsContent || [])]
                                  cols[cIdx] = { ...cols[cIdx], markdown: e.target.value }
                                  next[index] = { ...next[index], columnsContent: cols }
                                  setSections(next)
                                }}
                                rows={6}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm"
                                placeholder="Markdown colonne"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prévisualisation */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Prévisualisation</h2>
            
            <div className="prose dark:prose-invert max-w-none">
              <div className="border border-border rounded-lg p-4 bg-background min-h-[500px]">
                <div className="text-sm text-muted-foreground">La prévisualisation du Markdown de section apparaît côté site une fois sauvegardée.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

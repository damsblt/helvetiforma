'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createPageContentClient } from '@/lib/content-client'

export default function NewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState(`# Nouvelle Page

## Sous-titre

Votre contenu ici...

### Section

- Point 1
- Point 2
- Point 3

**Texte en gras** et *texte en italique*.`)
  const [error, setError] = useState<string | null>(null)

  // Générer automatiquement le slug à partir du titre
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    const generatedSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(generatedSlug)
  }

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setError('Le titre et le slug sont obligatoires')
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      const ok = await createPageContentClient({
        slug,
        title,
        description,
        content,
      } as any)
      if (!ok) {
        throw new Error('Échec de la création')
      }
      router.push('/admin/content/pages')
    } catch (err) {
      setError('Erreur lors de la création de la page')
      console.error('Error creating page:', err)
    } finally {
      setSaving(false)
    }
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
                  Nouvelle Page
                </h1>
                <p className="text-sm text-muted-foreground">
                  Créer une nouvelle page de contenu
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
                disabled={saving || !title.trim() || !slug.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                )}
                {saving ? 'Création...' : 'Créer la page'}
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
              <h2 className="text-lg font-semibold text-foreground mb-4">Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Titre de la page *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Ex: À propos de nous"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Slug (URL) *
                  </label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground text-sm mr-1">/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="a-propos"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    URL finale: /{slug || 'votre-slug'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description SEO
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Description courte pour les moteurs de recherche"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {description.length}/160 caractères recommandés
                  </p>
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
              
              <div className="mt-3 text-xs text-muted-foreground">
                <p className="mb-1"><strong>Aide Markdown :</strong></p>
                <div className="grid grid-cols-2 gap-2">
                  <span># Titre principal</span>
                  <span>**Texte gras**</span>
                  <span>## Sous-titre</span>
                  <span>*Texte italique*</span>
                  <span>### Titre niveau 3</span>
                  <span>[Lien](url)</span>
                  <span>- Liste à puces</span>
                  <span>![Image](url)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prévisualisation */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Prévisualisation</h2>
            
            <div className="border border-border rounded-lg p-4 bg-background min-h-[600px]">
              {title && (
                <div className="mb-4 pb-4 border-b border-border">
                  <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                  {description && (
                    <p className="text-muted-foreground mt-2">{description}</p>
                  )}
                </div>
              )}
              
              <div className="prose dark:prose-invert max-w-none">
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

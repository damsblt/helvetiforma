// Client-side content functions (no fs usage)
import type { PageContent, FormationContent, NavigationConfig } from '@/lib/content-types'

/**
 * Récupère le contenu d'une page via API
 */
export async function getPageContentClient(slug: string): Promise<PageContent | null> {
  try {
    const response = await fetch(`/api/content/pages?slug=${slug}`)
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error)
    return null
  }
}

/**
 * Récupère toutes les pages via API
 */
export async function getAllPagesClient(): Promise<Array<{ slug: string; title: string; description: string }>> {
  try {
    const response = await fetch('/api/content/pages')
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}

/**
 * Met à jour le contenu d'une page via API
 */
export async function updatePageContentClient(slug: string, content: PageContent): Promise<boolean> {
  try {
    const response = await fetch('/api/content/pages', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...content, slug }),
    })
    
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error(`Error updating page ${slug}:`, error)
    return false
  }
}

/**
 * Récupère la configuration de navigation (statique côté client)
 */
export function getNavigationConfigClient(): NavigationConfig {
  return {
    main: [
      { name: 'Accueil', href: '/' },
      { name: 'Concept', href: '/concept' },
      { name: 'Formations', href: '/formations' },
      { name: 'Cours', href: '/courses' },
      { name: 'Calendrier', href: '/calendrier' },
      { name: 'Contact', href: '/contact' },
    ],
    footer: [
      {
        title: 'Formation',
        links: [
          { name: 'Nos formations', href: '/formations' },
          { name: 'Cours en ligne', href: '/courses' },
          { name: 'Webinaires', href: '/calendrier' },
        ],
      },
      {
        title: 'Support',
        links: [
          { name: 'Contact', href: '/contact' },
          { name: 'FAQ', href: '/faq' },
          { name: 'Documentation', href: '/docs' },
        ],
      },
      {
        title: 'Légal',
        links: [
          { name: 'Mentions légales', href: '/mentions' },
          { name: 'CGU', href: '/cgu' },
          { name: 'Politique de confidentialité', href: '/privacy' },
        ],
      },
    ],
  }
}

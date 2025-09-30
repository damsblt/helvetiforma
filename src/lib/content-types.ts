// Types partagés pour le système de contenu

export interface PageContent {
  slug: string
  title: string
  description: string
  content: string
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  hero?: {
    title?: string
    subtitle?: string
    cta_primary?: {
      text: string
      link: string
    }
    cta_secondary?: {
      text: string
      link: string
    }
    background_image?: string
    features?: string[]
  }
  sections?: Array<{
    type: string
    title?: string
    subtitle?: string
    items?: any[]
    limit?: number
    cta_primary?: {
      text: string
      link: string
    }
    cta_secondary?: {
      text: string
      link: string
    }
  }>
}

export interface FormationContent {
  slug: string
  title: string
  description: string
  content: string
  price?: number
  duration?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  instructor?: string
  image?: string
  features?: string[]
  prerequisites?: string[]
  objectives?: string[]
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

export interface NavigationConfig {
  main: Array<{
    name: string
    href: string
    external?: boolean
  }>
  footer: Array<{
    title: string
    links: Array<{
      name: string
      href: string
      external?: boolean
    }>
  }>
}

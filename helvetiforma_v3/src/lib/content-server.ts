// Server-side content functions (using fs)
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import type { PageContent, FormationContent, NavigationConfig } from '@/lib/content-types'

// Chemins des dossiers de contenu
const CONTENT_DIR = path.join(process.cwd(), 'content')
const PAGES_DIR = path.join(CONTENT_DIR, 'pages')
const FORMATIONS_DIR = path.join(CONTENT_DIR, 'formations')
const CONFIG_DIR = path.join(CONTENT_DIR, 'config')

// Processeur Markdown
const processor = remark().use(remarkGfm).use(remarkHtml)

/**
 * Lit et parse un fichier Markdown
 */
async function parseMarkdownFile(filePath: string) {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  
  // Convertir le Markdown en HTML
  const processedContent = await processor.process(content)
  const htmlContent = processedContent.toString()
  
  return {
    frontmatter: data,
    content: htmlContent,
  }
}

/**
 * Récupère le contenu d'une page
 */
export async function getPageContent(slug: string): Promise<PageContent | null> {
  try {
    const filePath = path.join(PAGES_DIR, `${slug}.md`)
    
    if (!fs.existsSync(filePath)) {
      return null
    }
    
    const { frontmatter, content } = await parseMarkdownFile(filePath)
    
    return {
      slug,
      title: frontmatter.title || '',
      description: frontmatter.description || '',
      content,
      seo: frontmatter.seo,
      hero: frontmatter.hero,
      sections: frontmatter.sections,
    }
  } catch (error) {
    console.error(`Error reading page ${slug}:`, error)
    return null
  }
}

/**
 * Récupère toutes les pages disponibles
 */
export function getAllPageSlugs(): string[] {
  try {
    if (!fs.existsSync(PAGES_DIR)) {
      return []
    }
    
    return fs
      .readdirSync(PAGES_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''))
  } catch (error) {
    console.error('Error reading pages directory:', error)
    return []
  }
}

/**
 * Récupère la configuration de navigation
 */
export async function getNavigationConfig(): Promise<NavigationConfig> {
  try {
    const filePath = path.join(CONFIG_DIR, 'navigation.md')
    
    if (!fs.existsSync(filePath)) {
      // Configuration par défaut
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
    
    const { frontmatter } = await parseMarkdownFile(filePath)
    return frontmatter as NavigationConfig
  } catch (error) {
    console.error('Error reading navigation config:', error)
    // Retourner la configuration par défaut en cas d'erreur
    return {
      main: [
        { name: 'Accueil', href: '/' },
        { name: 'Concept', href: '/concept' },
        { name: 'Formations', href: '/formations' },
        { name: 'Cours', href: '/courses' },
        { name: 'Calendrier', href: '/calendrier' },
        { name: 'Contact', href: '/contact' },
      ],
      footer: [],
    }
  }
}

/**
 * Met à jour le contenu d'une page (pour l'admin)
 */
export async function updatePageContent(slug: string, content: PageContent): Promise<void> {
  try {
    const filePath = path.join(PAGES_DIR, `${slug}.md`)
    
    // Créer le contenu du fichier avec frontmatter
    const frontmatter = {
      title: content.title,
      description: content.description,
      seo: content.seo,
      hero: content.hero,
      sections: content.sections,
    }
    
    const fileContent = matter.stringify(content.content, frontmatter)
    
    // Créer le dossier si nécessaire
    if (!fs.existsSync(PAGES_DIR)) {
      fs.mkdirSync(PAGES_DIR, { recursive: true })
    }
    
    fs.writeFileSync(filePath, fileContent, 'utf8')
  } catch (error) {
    console.error(`Error updating page ${slug}:`, error)
    throw error
  }
}

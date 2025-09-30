// Server-side content functions (using fs)
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import type { PageContent, FormationContent, NavigationConfig } from '@/lib/content-types'
import { readTextFile, writeTextFile, listFiles } from '@/lib/storage'

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
  const fileContents = await (async () => {
    // Try storage first (supports prod via Blob and dev via fs)
    const relative = path.relative(CONTENT_DIR, filePath)
    const content = await readTextFile(relative)
    if (content !== null) return content
    // Fallback none
    throw new Error(`File not found: ${filePath}`)
  })()
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
    
    const rel = path.join('pages', `${slug}.md`)
    const raw = await readTextFile(rel)
    if (raw === null) return null
    const { data, content } = matter(raw)
    const processedContent = await processor.process(content)
    const htmlContent = processedContent.toString()

    // Traiter le markdown par section si présent
    let processedSections = (data as any).sections
    if (Array.isArray(processedSections)) {
      processedSections = await Promise.all(
        processedSections.map(async (section: any) => {
          // Section-level markdown
          if (section?.markdown) {
            try {
              const md = await processor.process(section.markdown as string)
              return { ...section, markdownHtml: md.toString() }
            } catch {
              return { ...section }
            }
          }
          // Columns per-item markdown
          if (Array.isArray(section?.columnsContent)) {
            const processedCols = await Promise.all(
              section.columnsContent.map(async (col: any) => {
                if (col?.markdown) {
                  try {
                    const md = await processor.process(col.markdown as string)
                    return { ...col, markdownHtml: md.toString() }
                  } catch {
                    return { ...col }
                  }
                }
                return col
              })
            )
            return { ...section, columnsContent: processedCols }
          }
          return section
        })
      )
    }
    
    return {
      slug,
      title: (data as any).title || '',
      description: (data as any).description || '',
      content: htmlContent,
      seo: (data as any).seo,
      hero: (data as any).hero,
      sections: processedSections,
    }
  } catch (error) {
    console.error(`Error reading page ${slug}:`, error)
    return null
  }
}

/**
 * Récupère toutes les pages disponibles
 */
export async function getAllPageSlugs(): Promise<string[]> {
  try {
    const files = await listFiles('pages')
    return files
      .map(f => path.basename(f.pathname))
      .filter(name => name.endsWith('.md'))
      .map(name => name.replace(/\.md$/, ''))
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
    const rel = path.join('config', 'navigation.md')
    const raw = await readTextFile(rel)
    if (raw === null) {
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
    const { data } = matter(raw)
    return data as NavigationConfig
  } catch (error) {
    console.error('Error reading navigation config:', error)
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
    
    // Priorité: Vercel Blob / fs via storage abstraction
    await writeTextFile(path.join('pages', `${slug}.md`), fileContent)
  } catch (error) {
    console.error(`Error updating page ${slug}:`, error)
    throw error
  }
}

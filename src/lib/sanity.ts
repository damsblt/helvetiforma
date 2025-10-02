import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { PortableTextBlock } from '@portabletext/types'

// Get project ID and normalize it (trim whitespace/newlines)
const rawProjectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xzzyyelh').trim()
const projectId = rawProjectId.toLowerCase()

// Get dataset and ensure it's valid
const rawDataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || 'production').trim()
// Validate dataset name according to Sanity requirements: lowercase, numbers, underscores, dashes, max 64 chars
const dataset = rawDataset.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 64)

// Validate dataset name
if (!dataset || dataset.length === 0) {
  throw new Error('Invalid Sanity dataset name. Must contain only lowercase letters, numbers, underscores, and dashes.')
}

console.log('Sanity configuration:', { projectId, dataset })

// Sanity client configuration
export const sanityConfig = {
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false, // Disable CDN during build to avoid validation issues
}

// Create Sanity client with error handling
let sanityClient: any = null
try {
  sanityClient = createClient(sanityConfig)
} catch (error) {
  console.error('Failed to create Sanity client:', error)
  // Fallback to a minimal client configuration
  sanityClient = createClient({
    projectId: 'xzzyyelh',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
  })
}

export { sanityClient }

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

// Types for Sanity content
export interface SanityPage {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  hero?: {
    title?: string
    subtitle?: string
    backgroundImage?: any
    ctaPrimary?: {
      text?: string
      link?: string
    }
  }
  sections?: Array<{
    _key: string
    _type: 'featureCards' | 'listSection' | 'richTextSection' | 'contactInfoSection'
    title?: string
    subtitle?: string
    content?: PortableTextBlock[]
    description?: PortableTextBlock[]
    columns?: number
    backgroundColor?: string
    // Feature Cards fields
    cards?: Array<{
      title: string
      description: string
      icon?: string
      iconColor?: 'blue' | 'green' | 'purple' | 'orange'
    }>
    // List Section fields
    items?: Array<{
      title: string
      description: string
      icon?: string
      iconColor?: 'blue' | 'green' | 'purple' | 'orange'
    }>
    // Contact Info Section fields
    contactItems?: Array<{
      icon: string
      title: string
      content: string[]
      link?: string
      linkText?: string
    }>
    ctaText?: string
    ctaLink?: string
  }>
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
}

// Helper to fetch pages
export async function getPageBySlug(slug: string): Promise<SanityPage | null> {
  try {
    if (!sanityClient) {
      console.error('Sanity client not available')
      return null
    }

    const query = `*[_type == "page" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      hero {
        title,
        subtitle,
        backgroundImage,
        ctaPrimary {
          text,
          link
        }
      },
      sections[] {
        _key,
        _type,
        title,
        subtitle,
        content,
        description,
        columns,
        backgroundColor,
        cards[] {
          title,
          description,
          icon,
          iconColor
        },
        items[] {
          title,
          description,
          icon,
          iconColor
        },
        ctaText,
        ctaLink
      }
    }`
    
    // Add revalidation and cache tags for better cache invalidation
    const page = await sanityClient.fetch(query, { slug }, {
      next: { 
        revalidate: 60, // Revalidate every 60 seconds
        tags: ['pages', `page-${slug}`] // Add cache tags for targeted revalidation
      }
    })
    return page
  } catch (error) {
    console.error('Error fetching page from Sanity:', error)
    // Return null instead of throwing to prevent build failures
    return null
  }
}

// Helper to fetch all pages
export async function getAllPages() {
  try {
    if (!sanityClient) {
      console.error('Sanity client not available')
      return []
    }

    const query = `*[_type == "page"]{
      _id,
      title,
      "slug": slug.current
    }`
    
    // Add revalidation and cache tags for better cache invalidation
    const pages = await sanityClient.fetch(query, {}, {
      next: { 
        revalidate: 60, // Revalidate every 60 seconds
        tags: ['pages'] // Add cache tag for targeted revalidation
      }
    })
    return pages
  } catch (error) {
    console.error('Error fetching pages from Sanity:', error)
    return []
  }
}


import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { PortableTextBlock } from '@portabletext/types'

// Validate project ID format
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xzzyyelh'
if (!/^[a-z0-9-]+$/.test(projectId)) {
  throw new Error(`Invalid Sanity project ID: ${projectId}. Must contain only lowercase letters, numbers, and dashes.`)
}

export const sanityConfig = {
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Disable CDN during build to avoid validation issues
}

export const sanityClient = createClient(sanityConfig)

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
    _type: 'featureCards' | 'listSection' | 'richTextSection'
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
    
    const page = await sanityClient.fetch(query, { slug })
    return page
  } catch (error) {
    console.error('Error fetching page from Sanity:', error)
    return null
  }
}

// Helper to fetch all pages
export async function getAllPages() {
  try {
    const query = `*[_type == "page"]{
      _id,
      title,
      "slug": slug.current
    }`
    
    const pages = await sanityClient.fetch(query)
    return pages
  } catch (error) {
    console.error('Error fetching pages from Sanity:', error)
    return []
  }
}


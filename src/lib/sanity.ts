import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const sanityConfig = {
  projectId: 'xzzyyelh',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Set to true in production for faster response times
}

export const sanityClient = createClient(sanityConfig)

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

// Helper to fetch pages
export async function getPageBySlug(slug: string) {
  try {
    const query = `*[_type == "page" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      hero,
      sections[] {
        _type,
        title,
        subtitle,
        content,
        columns,
        items[] {
          title,
          description,
          image
        }
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


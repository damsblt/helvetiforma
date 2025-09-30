export interface PayloadPage {
  slug: string
  title: string
  description?: string
  hero?: any
  sections?: any[]
}

const API_URL = process.env.PAYLOAD_API_URL || ''
const API_KEY = process.env.PAYLOAD_API_KEY || ''

async function payloadFetch(pathname: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (API_KEY) headers.set('Authorization', `Bearer ${API_KEY}`)
  const res = await fetch(`${API_URL}${pathname}`, { ...init, headers, cache: 'no-store' })
  if (!res.ok) throw new Error(`Payload request failed: ${res.status}`)
  return res.json()
}

export async function getPageBySlug(slug: string): Promise<PayloadPage | null> {
  if (!API_URL) return null
  const data = await payloadFetch(`/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`)
  return data?.docs?.[0] || null
}



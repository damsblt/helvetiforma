import { createClient } from 'next-sanity'

// Client Sanity avec permissions d'écriture pour les API
export const sanityAdminClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!, // Token avec permissions d'écriture
  useCdn: false,
  apiVersion: '2024-01-01',
})

export default sanityAdminClient

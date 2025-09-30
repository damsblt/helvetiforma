import { CollectionConfig } from 'payload/types'

// This collection stores references to files we upload to Vercel Blob.
// We only persist the URL and basic metadata in Payload.
const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  fields: [
    { name: 'filename', type: 'text', required: true },
    { name: 'url', type: 'text', required: true },
    { name: 'contentType', type: 'text' },
    { name: 'size', type: 'number' },
  ],
}

export default Media



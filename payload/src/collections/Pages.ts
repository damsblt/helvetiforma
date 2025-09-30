import { CollectionConfig } from 'payload/types'

const Pages: CollectionConfig = {
  slug: 'pages',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'text' },
        { name: 'backgroundImage', type: 'text' }, // store Blob URL
        {
          name: 'ctaPrimary',
          type: 'group',
          fields: [
            { name: 'text', type: 'text' },
            { name: 'link', type: 'text' },
          ],
        },
        {
          name: 'ctaSecondary',
          type: 'group',
          fields: [
            { name: 'text', type: 'text' },
            { name: 'link', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      fields: [
        { name: 'type', type: 'select', options: ['columns', 'cta', 'features', 'stats'], defaultValue: 'columns' },
        { name: 'title', type: 'text' },
        { name: 'subtitle', type: 'text' },
        { name: 'markdown', type: 'textarea' },
        { name: 'columns', type: 'number', min: 1, max: 3, defaultValue: 1 },
        {
          name: 'columnsContent',
          type: 'array',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'description', type: 'text' },
            { name: 'emoji', type: 'text' },
            { name: 'image', type: 'text' }, // Blob URL
            { name: 'markdown', type: 'textarea' },
            { name: 'linkText', type: 'text' },
            { name: 'linkHref', type: 'text' },
          ],
        },
      ],
    },
  ],
}

export default Pages



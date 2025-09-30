import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'hero',
      title: 'Hero Section',
      type: 'object',
      fields: [
        {name: 'title', type: 'string', title: 'Hero Title'},
        {name: 'subtitle', type: 'string', title: 'Hero Subtitle'},
        {name: 'backgroundImage', type: 'image', title: 'Background Image'},
        {
          name: 'ctaPrimary',
          type: 'object',
          title: 'Primary CTA',
          fields: [
            {name: 'text', type: 'string', title: 'Button Text'},
            {name: 'link', type: 'string', title: 'Button Link'},
          ],
        },
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'section',
          fields: [
            {name: 'title', type: 'string', title: 'Section Title'},
            {name: 'subtitle', type: 'string', title: 'Section Subtitle'},
            {
              name: 'content',
              type: 'array',
              title: 'Content',
              of: [{type: 'block'}],
            },
            {
              name: 'columns',
              type: 'number',
              title: 'Number of Columns',
              options: {list: [1, 2, 3]},
            },
          ],
        },
      ],
    }),
  ],
})


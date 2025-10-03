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
            {
              name: 'link',
              type: 'string',
              title: 'Button Link',
              description: 'Enter just the URL path (e.g., /formations, #contact) without href= or quotes',
              validation: (Rule: any) => Rule.custom((link: string) => {
                if (!link) return true
                if (link.includes('href=')) {
                  return 'Please enter only the URL path without "href=". Example: /formations'
                }
                return true
              })
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        // Feature Cards Section (like "Pourquoi choisir HelvetiForma ?")
        {
          type: 'object',
          name: 'featureCards',
          title: 'Feature Cards Section',
          fields: [
            {name: 'title', type: 'string', title: 'Section Title'},
            {name: 'subtitle', type: 'string', title: 'Section Subtitle'},
            {
              name: 'cards',
              type: 'array',
              title: 'Feature Cards',
              of: [
                {
                  type: 'object',
                  fields: [
                    {name: 'title', type: 'string', title: 'Card Title'},
                    {
                      name: 'description',
                      type: 'text',
                      title: 'Card Description',
                      rows: 4,
                    },
                    {
                      name: 'icon',
                      type: 'string',
                      title: 'Icon',
                      description: 'Emoji or icon identifier (e.g., ✓, 🎓, ⏰)',
                    },
                    {
                      name: 'iconColor',
                      type: 'string',
                      title: 'Icon Background Color',
                      options: {
                        list: [
                          {title: 'Blue', value: 'blue'},
                          {title: 'Green', value: 'green'},
                          {title: 'Purple', value: 'purple'},
                          {title: 'Orange', value: 'orange'},
                        ],
                      },
                    },
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'description',
                      icon: 'icon',
                    },
                    prepare({title, subtitle, icon}) {
                      return {
                        title: `${icon || '•'} ${title}`,
                        subtitle: subtitle,
                      }
                    },
                  },
                },
              ],
            },
            {
              name: 'columns',
              type: 'number',
              title: 'Number of Columns',
              options: {
                list: [
                  {title: '2 columns', value: 2},
                  {title: '3 columns', value: 3},
                ],
              },
              initialValue: 3,
            },
          ],
          preview: {
            select: {
              title: 'title',
              cards: 'cards',
            },
            prepare({title, cards}) {
              return {
                title: title || 'Feature Cards Section',
                subtitle: `${cards?.length || 0} cards`,
              }
            },
          },
        },
        
        // List Section with Icons (like "Une approche moderne")
        {
          type: 'object',
          name: 'listSection',
          title: 'List Section with Icons',
          fields: [
            {name: 'title', type: 'string', title: 'Section Title'},
            {name: 'subtitle', type: 'string', title: 'Section Subtitle'},
            {
              name: 'description',
              type: 'array',
              title: 'Description',
              of: [{type: 'block'}],
            },
            {
              name: 'items',
              type: 'array',
              title: 'List Items',
              of: [
                {
                  type: 'object',
                  fields: [
                    {name: 'title', type: 'string', title: 'Item Title'},
                    {name: 'description', type: 'string', title: 'Item Description'},
                    {
                      name: 'icon',
                      type: 'string',
                      title: 'Icon',
                      description: 'Emoji or icon identifier',
                    },
                    {
                      name: 'iconColor',
                      type: 'string',
                      title: 'Icon Color',
                      options: {
                        list: [
                          {title: 'Blue', value: 'blue'},
                          {title: 'Green', value: 'green'},
                          {title: 'Purple', value: 'purple'},
                          {title: 'Orange', value: 'orange'},
                        ],
                      },
                    },
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'description',
                      icon: 'icon',
                    },
                    prepare({title, subtitle, icon}) {
                      return {
                        title: `${icon || '•'} ${title}`,
                        subtitle: subtitle,
                      }
                    },
                  },
                },
              ],
            },
            {
              name: 'ctaText',
              type: 'string',
              title: 'CTA Button Text',
            },
            {
              name: 'ctaLink',
              type: 'string',
              title: 'CTA Button Link',
            },
          ],
          preview: {
            select: {
              title: 'title',
              items: 'items',
            },
            prepare({title, items}) {
              return {
                title: title || 'List Section',
                subtitle: `${items?.length || 0} items`,
              }
            },
          },
        },
        
        // Rich Text Section (Simple content)
        {
          type: 'object',
          name: 'richTextSection',
          title: 'Rich Text Section',
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
              name: 'backgroundColor',
              type: 'string',
              title: 'Background Color',
              options: {
                list: [
                  {title: 'White', value: 'white'},
                  {title: 'Gray', value: 'gray'},
                  {title: 'Light Blue', value: 'lightblue'},
                ],
              },
              initialValue: 'white',
            },
          ],
          preview: {
            select: {
              title: 'title',
            },
            prepare({title}) {
              return {
                title: title || 'Rich Text Section',
              }
            },
          },
        },

        // Contact Info Section
        {
          type: 'object',
          name: 'contactInfoSection',
          title: 'Contact Information Section',
          fields: [
            {name: 'title', type: 'string', title: 'Section Title'},
            {name: 'subtitle', type: 'string', title: 'Section Subtitle'},
            {
              name: 'contactItems',
              type: 'array',
              title: 'Contact Items',
              of: [
                {
                  type: 'object',
                  fields: [
                    {name: 'icon', type: 'string', title: 'Icon (emoji)', description: 'e.g., 📍, 📞, ✉️, 🕒'},
                    {name: 'title', type: 'string', title: 'Item Title'},
                    {
                      name: 'content',
                      type: 'array',
                      title: 'Content Lines',
                      of: [{type: 'string'}],
                    },
                    {
                      name: 'link', 
                      type: 'string', 
                      title: 'Action Link (optional)',
                      description: 'URL ou mailto:email@example.com',
                      validation: (Rule) => Rule.custom((value) => {
                        if (!value) return true; // Optional field
                        // Accept any string for now - very permissive
                        return true;
                      })
                    },
                    {name: 'linkText', type: 'string', title: 'Link Text (optional)'},
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      icon: 'icon',
                    },
                    prepare({title, icon}) {
                      return {
                        title: `${icon || '•'} ${title}`,
                      }
                    },
                  },
                },
              ],
            },
          ],
          preview: {
            select: {
              title: 'title',
              items: 'contactItems',
            },
            prepare({title, items}) {
              return {
                title: title || 'Contact Information Section',
                subtitle: `${items?.length || 0} contact items`,
              }
            },
          },
        },
        // Three Cards Column + Horizontal Card CTA Section
        {
          type: 'object',
          name: 'threeCardsWithCta',
          title: 'Three Cards Column + Horizontal Card',
          fields: [
            {name: 'title', type: 'string', title: 'Section Title'},
            {name: 'subtitle', type: 'text', title: 'Section Subtitle', rows: 3},
            {
              name: 'cards',
              type: 'array',
              title: 'Three Cards',
              of: [
                {
                  type: 'object',
                  fields: [
                    {name: 'title', type: 'string', title: 'Card Title'},
                    {name: 'description', type: 'text', title: 'Card Description', rows: 4},
                    {
                      name: 'icon',
                      type: 'string',
                      title: 'Icon',
                      description: 'Emoji ou icône (e.g., 📅, 📍, 👥)',
                    },
                    {
                      name: 'iconColor',
                      type: 'string',
                      title: 'Icon Background Color',
                      options: {
                        list: [
                          {title: 'Blue', value: 'blue'},
                          {title: 'Green', value: 'green'},
                          {title: 'Purple', value: 'purple'},
                          {title: 'Orange', value: 'orange'},
                        ],
                      },
                    },
                    {
                      name: 'detailText',
                      type: 'string',
                      title: 'Detail Text',
                      description: 'Petit texte en bas (e.g., "Sessions de 60-90 minutes")',
                    },
                    {
                      name: 'detailIcon',
                      type: 'string',
                      title: 'Detail Icon',
                      description: 'Emoji pour le détail (e.g., ⏰, 👥)',
                    },
                    {
                      name: 'detailColor',
                      type: 'string',
                      title: 'Detail Text Color',
                      options: {
                        list: [
                          {title: 'Blue', value: 'blue'},
                          {title: 'Green', value: 'green'},
                          {title: 'Purple', value: 'purple'},
                        ],
                      },
                    },
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      icon: 'icon',
                    },
                    prepare({title, icon}) {
                      return {
                        title: `${icon || '•'} ${title}`,
                      }
                    },
                  },
                },
              ],
              validation: (Rule) => Rule.min(3).max(3),
            },
            {
              name: 'ctaCard',
              type: 'object',
              title: 'Horizontal CTA Card',
              fields: [
                {name: 'title', type: 'string', title: 'CTA Title'},
                {name: 'subtitle', type: 'text', title: 'CTA Subtitle', rows: 2},
                {
                  name: 'primaryButton',
                  type: 'object',
                  title: 'Primary Button',
                  fields: [
                    {name: 'text', type: 'string', title: 'Button Text'},
                    {name: 'link', type: 'string', title: 'Button Link'},
                    {name: 'icon', type: 'string', title: 'Button Icon (optional)', description: 'Emoji (e.g., 📅)'},
                  ],
                },
                {
                  name: 'secondaryButton',
                  type: 'object',
                  title: 'Secondary Button',
                  fields: [
                    {name: 'text', type: 'string', title: 'Button Text'},
                    {name: 'link', type: 'string', title: 'Button Link'},
                  ],
                },
                {
                  name: 'features',
                  type: 'array',
                  title: 'Feature List',
                  of: [
                    {
                      type: 'object',
                      fields: [
                        {name: 'text', type: 'string', title: 'Feature Text'},
                        {name: 'icon', type: 'string', title: 'Icon', description: 'Emoji (e.g., 📅, 👥)'},
                        {
                          name: 'color',
                          type: 'string',
                          title: 'Icon Color',
                          options: {
                            list: [
                              {title: 'Blue', value: 'blue'},
                              {title: 'Green', value: 'green'},
                              {title: 'Purple', value: 'purple'},
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          preview: {
            select: {
              title: 'title',
              cards: 'cards',
            },
            prepare({title, cards}) {
              return {
                title: title || 'Three Cards + CTA',
                subtitle: `${cards?.length || 0} cards`,
              }
            },
          },
        },
      ],
    }),
  ],
})


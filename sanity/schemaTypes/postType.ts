import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  groups: [
    {name: 'content', title: 'Contenu', default: true},
    {name: 'access', title: 'Accès & Tarification'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // Content Fields
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule) => rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'excerpt',
      title: 'Résumé',
      type: 'text',
      rows: 3,
      description: 'Court résumé de l\'article (visible par tous)',
      group: 'content',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'image',
      title: 'Image principale',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif',
        }
      ],
      group: 'content',
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          {title: 'Comptabilité', value: 'comptabilite'},
          {title: 'Salaires', value: 'salaires'},
          {title: 'Fiscalité', value: 'fiscalite'},
          {title: 'RH', value: 'rh'},
          {title: 'Gestion', value: 'gestion'},
          {title: 'Autre', value: 'autre'},
        ],
      },
      group: 'content',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
      group: 'content',
    }),
    defineField({
      name: 'pdfAttachments',
      title: 'Documents PDF',
      type: 'array',
      description: 'Téléchargez des fichiers PDF à joindre à l\'article',
      of: [
        {
          type: 'object',
          name: 'pdfFile',
          title: 'Fichier PDF',
          fields: [
            {
              name: 'file',
              type: 'file',
              title: 'Fichier PDF',
              options: {
                accept: '.pdf,application/pdf',
              },
              validation: (rule) => rule.required(),
            },
            {
              name: 'title',
              type: 'string',
              title: 'Titre du document',
              description: 'Ex: Guide complet de la comptabilité suisse',
              validation: (rule) => rule.required(),
            },
            {
              name: 'description',
              type: 'text',
              title: 'Description',
              description: 'Courte description du contenu du PDF',
              rows: 3,
            },
            {
              name: 'isPremium',
              type: 'boolean',
              title: 'Fichier premium uniquement',
              description: 'Si coché, seuls les utilisateurs premium peuvent télécharger',
              initialValue: false,
            },
            {
              name: 'fileSize',
              type: 'string',
              title: 'Taille du fichier',
              description: 'Ex: 2.5 MB (optionnel, calculé automatiquement)',
              readOnly: true,
            },
          ],
          preview: {
            select: {
              title: 'title',
              description: 'description',
              isPremium: 'isPremium',
            },
            prepare({title, description, isPremium}) {
              return {
                title: isPremium ? `🔒 ${title}` : `📄 ${title}`,
                subtitle: description || 'Document PDF',
              }
            },
          },
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      of: [
        {type: 'block'},
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texte alternatif',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Légende',
            }
          ]
        },
        // Video embed support
        {
          name: 'videoEmbed',
          type: 'object',
          title: 'Vidéo intégrée',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'URL de la vidéo',
              description: 'YouTube, Vimeo, ou lien direct vers MP4',
              validation: (rule) => rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Légende',
            },
            {
              name: 'aspectRatio',
              type: 'string',
              title: 'Ratio d\'aspect',
              options: {
                list: [
                  {title: '16:9 (Standard)', value: '16:9'},
                  {title: '4:3 (Classique)', value: '4:3'},
                  {title: '1:1 (Carré)', value: '1:1'},
                  {title: '21:9 (Cinéma)', value: '21:9'},
                ],
              },
              initialValue: '16:9',
            },
          ],
          preview: {
            select: {
              url: 'url',
              caption: 'caption',
            },
            prepare({url, caption}) {
              return {
                title: caption || 'Vidéo',
                subtitle: url,
              }
            },
          },
        },
        // File downloads
        {
          name: 'fileDownload',
          type: 'object',
          title: 'Fichier téléchargeable',
          fields: [
            {
              name: 'file',
              type: 'file',
              title: 'Fichier',
              validation: (rule) => rule.required(),
            },
            {
              name: 'title',
              type: 'string',
              title: 'Titre',
              validation: (rule) => rule.required(),
            },
            {
              name: 'description',
              type: 'text',
              title: 'Description',
              rows: 2,
            },
          ],
        },
      ],
      group: 'content',
    }),
    
    // Access Control & Payment Fields
    defineField({
      name: 'accessLevel',
      title: 'Niveau d\'accès',
      type: 'string',
      options: {
        list: [
          {title: '🌐 Public (Gratuit)', value: 'public'},
          {title: '🔒 Membres uniquement', value: 'members'},
          {title: '💎 Premium (Payant)', value: 'premium'},
        ],
        layout: 'radio',
      },
      initialValue: 'public',
      validation: (rule) => rule.required(),
      group: 'access',
    }),
    defineField({
      name: 'price',
      title: 'Prix (CHF)',
      type: 'number',
      description: 'Prix en francs suisses (laisser vide si gratuit)',
      validation: (rule) => rule.min(0),
      hidden: ({document}) => document?.accessLevel !== 'premium',
      group: 'access',
    }),
    defineField({
      name: 'previewContent',
      title: 'Aperçu gratuit',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Contenu visible avant l\'achat (pour articles premium)',
      hidden: ({document}) => document?.accessLevel !== 'premium',
      group: 'access',
    }),
    defineField({
      name: 'requiredMembership',
      title: 'Abonnement requis',
      type: 'string',
      options: {
        list: [
          {title: 'Aucun', value: 'none'},
          {title: 'Basic', value: 'basic'},
          {title: 'Pro', value: 'pro'},
          {title: 'Enterprise', value: 'enterprise'},
        ],
      },
      initialValue: 'none',
      hidden: ({document}) => document?.accessLevel !== 'members',
      group: 'access',
    }),
    
    // SEO Fields
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Titre Meta',
          description: 'Titre pour les moteurs de recherche (60 caractères max)',
          validation: (rule) => rule.max(60),
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Description Meta',
          description: 'Description pour les moteurs de recherche (160 caractères max)',
          rows: 3,
          validation: (rule) => rule.max(160),
        },
        {
          name: 'keywords',
          type: 'array',
          title: 'Mots-clés',
          of: [{type: 'string'}],
          options: {
            layout: 'tags',
          },
        },
      ],
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'image',
      accessLevel: 'accessLevel',
      price: 'price',
    },
    prepare({title, media, accessLevel, price}) {
      const accessIcon = accessLevel === 'premium' ? '💎' : accessLevel === 'members' ? '🔒' : '🌐'
      const priceText = price ? ` - ${price} CHF` : ''
      return {
        title: `${accessIcon} ${title}`,
        subtitle: `${accessLevel}${priceText}`,
        media,
      }
    },
  },
})

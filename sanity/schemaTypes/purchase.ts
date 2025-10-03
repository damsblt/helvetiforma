import { defineType, defineField } from 'sanity'

export const purchaseType = defineType({
  name: 'purchase',
  title: 'Achat',
  type: 'document',
  fields: [
    defineField({
      name: 'userId',
      title: 'ID Utilisateur',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'postId',
      title: 'ID Article',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'postTitle',
      title: 'Titre de l\'article',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'amount',
      title: 'Montant (CHF)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'stripeSessionId',
      title: 'ID Session Stripe',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'purchasedAt',
      title: 'Date d\'achat',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: 'En cours', value: 'pending' },
          { title: 'Terminé', value: 'completed' },
          { title: 'Échoué', value: 'failed' },
          { title: 'Remboursé', value: 'refunded' },
        ],
      },
      initialValue: 'completed',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'postTitle',
      subtitle: 'userId',
      amount: 'amount',
      status: 'status',
    },
    prepare({ title, subtitle, amount, status }) {
      return {
        title: title || 'Achat inconnu',
        subtitle: `${subtitle} - ${amount} CHF - ${status}`,
      }
    },
  },
})

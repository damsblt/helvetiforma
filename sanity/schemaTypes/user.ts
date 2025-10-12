import { defineType, defineField } from 'sanity'

export const userType = defineType({
  name: 'user',
  title: 'Utilisateur',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'name',
      title: 'Nom complet',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'first_name',
      title: 'Prénom',
      type: 'string',
    }),
    defineField({
      name: 'last_name',
      title: 'Nom de famille',
      type: 'string',
    }),
    defineField({
      name: 'password',
      title: 'Mot de passe',
      type: 'string',
      hidden: true, // Ne pas afficher le mot de passe dans l'interface
    }),
    defineField({
      name: 'createdAt',
      title: 'Date de création',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Utilisateur sans nom',
        subtitle: subtitle || 'Email manquant',
      }
    },
  },
})

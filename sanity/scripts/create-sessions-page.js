import { createClient } from '@sanity/client'

// Initialize Sanity client
const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skOf1cdTkc5TF7hHh07NAtcikT1gheEXy8R0Hrnim8mV5YUg6YX73bP3lK6sZajxPB3cfTyWzc6aoBhLC2hakDl4vjpY8m75a2OycTlVugOMd3z5vIgE4RRl4k3aruVaw2J7xF0jDacQO4qmZX6ZAZs253uyIn2ekRRLQWoiwxawMqSilCpo',
  useCdn: false,
})

// Sessions page content
const sessionsPageData = {
  _type: 'page',
  title: 'Sessions - HelvetiForma',
  slug: {
    _type: 'slug',
    current: 'sessions',
  },
  description: 'Participez à nos webinaires en direct via Microsoft Teams. Sessions interactives et formation professionnelle.',
  seo: {
    title: 'Sessions de Formation - HelvetiForma',
    description: 'Découvrez nos sessions de formation en direct. Formation professionnelle via Microsoft Teams.',
    keywords: 'sessions, formation, Microsoft Teams, webinaires, HelvetiForma',
  },
  hero: {
    title: 'Webinaires',
    subtitle: 'Participez à nos sessions interactives en direct via Microsoft Teams',
    backgroundImage: null,
    ctaPrimary: {
      text: 'Voir les webinaires',
      link: '#webinaires'
    }
  },
  sections: [
    {
      _type: 'richTextSection',
      _key: 'how-to-participate',
      title: 'Comment obtenir des infos sur les Sessions ?',
      subtitle: 'Suivez ces étapes simples pour rejoindre nos sessions',
      backgroundColor: 'lightblue',
      content: [
        {
          _type: 'block',
          _key: 'step1',
          style: 'normal',
          listItem: 'number',
          children: [
            {
              _type: 'span',
              _key: 'span1',
              text: 'Choisissez votre formation et cliquez sur "Obtenir plus d\'infos"',
              marks: ['strong'],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'step2',
          style: 'normal',
          listItem: 'number',
          children: [
            {
              _type: 'span',
              _key: 'span2',
              text: 'Remplissez le formulaire de contact pré-rempli avec vos informations personnelles',
              marks: ['strong'],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'step3',
          style: 'normal',
          listItem: 'number',
          children: [
            {
              _type: 'span',
              _key: 'span3',
              text: 'Cliquez sur "Envoyer le message"',
              marks: ['strong'],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'note',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span6',
              text: 'Note : Notre équipe traite chaque demande manuellement pour garantir la qualité et la sécurité des sessions. Nous vous répondrons dans les plus brefs délais.',
              marks: [],
            },
          ],
        },
      ],
    },
    {
      _type: 'featureCards',
      _key: 'webinar-benefits',
      title: 'Pourquoi participer à nos webinaires ?',
      subtitle: 'Les avantages de nos sessions en direct',
      columns: 3,
      cards: [
        {
          title: 'Formation Professionnelle',
          description: 'Sessions de qualité animées par nos experts certifiés',
          icon: '🎓',
          iconColor: 'green',
        },
        {
          title: 'Sessions en direct',
          description: 'Interactions en temps réel avec nos formateurs experts',
          icon: '🎥',
          iconColor: 'blue',
        },
        {
          title: 'Questions-Réponses',
          description: 'Posez vos questions directement aux professionnels',
          icon: '💬',
          iconColor: 'purple',
        },
        {
          title: 'Certification',
          description: 'Recevez une attestation de participation',
          icon: '📜',
          iconColor: 'orange',
        },
        {
          title: 'Ressources',
          description: 'Accès aux supports de cours et documents',
          icon: '📚',
          iconColor: 'green',
        },
        {
          title: 'Réseautage',
          description: 'Échangez avec d\'autres professionnels du secteur',
          icon: '🤝',
          iconColor: 'blue',
        },
      ],
    },
    {
      _type: 'richTextSection',
      _key: 'technical-info',
      title: 'Informations techniques',
      subtitle: 'Tout ce que vous devez savoir pour participer',
      backgroundColor: 'gray',
      content: [
        {
          _type: 'block',
          _key: 'tech1',
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: 'span1',
              text: 'Requis pour participer',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'tech2',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span2',
              text: 'Un ordinateur, tablette ou smartphone avec connexion internet',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'tech3',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span3',
              text: 'Un compte Microsoft',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'tech4',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span4',
              text: 'Application Microsoft Teams (téléchargeable)',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'tech5',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span5',
              text: 'Microphone et haut-parleurs (ou casque) pour participer activement',
              marks: [],
            },
          ],
        },
      ],
    },
  ],
}

async function createSessionsPage() {
  try {
    console.log('🔄 Checking if sessions page already exists...')
    
    // Check if page already exists
    const existingPage = await client.fetch(
      '*[_type == "page" && slug.current == $slug][0]',
      { slug: 'sessions' }
    )

    if (existingPage) {
      console.log('📝 Updating existing sessions page...')
      const result = await client
        .patch(existingPage._id)
        .set({
          ...sessionsPageData,
          _id: existingPage._id,
          _type: 'page',
        })
        .commit()
      
      console.log('✅ Sessions page updated successfully!')
      console.log('🔗 Page ID:', result._id)
    } else {
      console.log('📝 Creating new sessions page...')
      const result = await client.create(sessionsPageData)
      
      console.log('✅ Sessions page created successfully!')
      console.log('🔗 Page ID:', result._id)
    }

    console.log('\n🎉 Done! You can now edit the sessions page in Sanity Studio.')
    console.log('🌐 Visit: http://localhost:3333 (or your Sanity Studio URL)')
  } catch (error) {
    console.error('❌ Error creating sessions page:', error)
    process.exit(1)
  }
}

// Run the creation
createSessionsPage()


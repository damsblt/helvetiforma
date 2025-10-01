import { createClient } from '@sanity/client'

// Initialize Sanity client
const client = createClient({
  projectId: 'helvetiforma',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skOf1cdTkc5TF7hHh07NAtcikT1gheEXy8R0Hrnim8mV5YUg6YX73bP3lK6sZajxPB3cfTyWzc6aoBhLC2hakDl4vjpY8m75a2OycTlVugOMd3z5vIgE4RRl4k3aruVaw2J7xF0jDacQO4qmZX6ZAZs253uyIn2ekRRLQWoiwxawMqSilCpo',
  useCdn: false,
})

// Concept page content based on the reference page
const conceptPageData = {
  _type: 'page',
  title: 'Notre Concept - HelvetiForma',
  slug: {
    _type: 'slug',
    current: 'concept',
  },
  description: 'Découvrez notre approche unique de la formation professionnelle en Suisse',
  hero: {
    title: 'Notre Concept de Formation',
    subtitle: 'Une approche innovante qui combine le meilleur de l\'apprentissage en ligne et en présentiel',
  },
  sections: [
    {
      _type: 'richTextSection',
      _key: 'blended-learning',
      title: 'Le Blended Learning : L\'Équilibre Parfait',
      subtitle: '',
      backgroundColor: 'white',
      content: [
        {
          _type: 'block',
          _key: 'block1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span1',
              text: 'Notre approche combine harmonieusement l\'apprentissage à distance et les sessions en présentiel pour créer une expérience d\'apprentissage optimale et engageante.',
              marks: ['strong'],
            },
          ],
        },
      ],
    },
    {
      _type: 'listSection',
      _key: 'blended-features',
      title: '',
      subtitle: '',
      items: [
        {
          title: 'Formation à distance',
          description: 'Modules en ligne flexibles et accessibles 24h/24',
          icon: '💻',
          iconColor: 'blue',
        },
        {
          title: 'Sessions en présentiel',
          description: 'Validation des acquis et pratique avec nos formateurs experts',
          icon: '🏫',
          iconColor: 'green',
        },
      ],
    },
    {
      _type: 'richTextSection',
      _key: 'philosophy',
      title: 'Notre philosophie',
      subtitle: '',
      backgroundColor: 'lightblue',
      content: [
        {
          _type: 'block',
          _key: 'phil1',
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: 'span1',
              text: 'Apprendre avec plaisir',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'phil2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span2',
              text: 'Nous croyons que l\'apprentissage le plus efficace est celui qui procure du plaisir. Notre approche pédagogique met l\'accent sur l\'engagement, l\'interactivité et la pertinence pratique pour créer une expérience d\'apprentissage mémorable et enrichissante.',
              marks: [],
            },
          ],
        },
      ],
    },
    {
      _type: 'featureCards',
      _key: 'avantages',
      title: 'Avantages de notre approche',
      subtitle: '',
      columns: 2,
      cards: [
        {
          title: 'Flexibilité maximale',
          description: 'Apprenez à votre rythme, où et quand vous voulez',
          icon: '⏰',
          iconColor: 'blue',
        },
        {
          title: 'Suivi personnalisé',
          description: 'Accompagnement sur mesure avec nos formateurs experts',
          icon: '👥',
          iconColor: 'green',
        },
        {
          title: 'Ressources de qualité',
          description: 'Contenu pédagogique créé par des experts du domaine',
          icon: '📚',
          iconColor: 'purple',
        },
        {
          title: 'Certification reconnue',
          description: 'Diplômes et certificats valorisés par les employeurs',
          icon: '🎓',
          iconColor: 'orange',
        },
      ],
    },
    {
      _type: 'richTextSection',
      _key: 'features',
      title: 'Fonctionnalités de notre concept',
      subtitle: '',
      backgroundColor: 'white',
      content: [
        {
          _type: 'block',
          _key: 'feat1',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span1',
              text: 'Plateforme d\'apprentissage moderne et intuitive',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'feat2',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span2',
              text: 'Contenus interactifs et multimédia',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'feat3',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span3',
              text: 'Suivi de progression en temps réel',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'feat4',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span4',
              text: 'Sessions en direct avec des formateurs experts',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'feat5',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span5',
              text: 'Accès aux ressources pédagogiques 24/7',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'feat6',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span6',
              text: 'Communauté d\'apprenants active',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'feat7',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span7',
              text: 'Exercices pratiques et projets concrets',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'feat8',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span8',
              text: 'Support technique et pédagogique réactif',
              marks: [],
            },
          ],
        },
      ],
    },
  ],
}

async function importConceptPage() {
  try {
    console.log('🔄 Checking if concept page already exists...')
    
    // Check if page already exists
    const existingPage = await client.fetch(
      '*[_type == "page" && slug.current == $slug][0]',
      { slug: 'concept' }
    )

    if (existingPage) {
      console.log('📝 Updating existing concept page...')
      const result = await client
        .patch(existingPage._id)
        .set({
          ...conceptPageData,
          _id: existingPage._id,
          _type: 'page',
        })
        .commit()
      
      console.log('✅ Concept page updated successfully!')
      console.log('🔗 Page ID:', result._id)
    } else {
      console.log('📝 Creating new concept page...')
      const result = await client.create(conceptPageData)
      
      console.log('✅ Concept page created successfully!')
      console.log('🔗 Page ID:', result._id)
    }

    console.log('\n🎉 Done! You can now edit the concept page in Sanity Studio.')
    console.log('🌐 Visit: http://localhost:3333 (or your Sanity Studio URL)')
  } catch (error) {
    console.error('❌ Error importing concept page:', error)
    process.exit(1)
  }
}

// Run the import
importConceptPage()


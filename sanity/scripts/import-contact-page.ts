import { createClient } from '@sanity/client'

// Initialize Sanity client
const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skOf1cdTkc5TF7hHh07NAtcikT1gheEXy8R0Hrnim8mV5YUg6YX73bP3lK6sZajxPB3cfTyWzc6aoBhLC2hakDl4vjpY8m75a2OycTlVugOMd3z5vIgE4RRl4k3aruVaw2J7xF0jDacQO4qmZX6ZAZs253uyIn2ekRRLQWoiwxawMqSilCpo',
  useCdn: false,
})

// Contact page content based on the current page structure
const contactPageData = {
  _type: 'page',
  title: 'Contact - HelvetiForma',
  slug: {
    _type: 'slug',
    current: 'contact',
  },
  description: 'Contactez notre équipe d\'experts pour vos questions sur la formation professionnelle.',
  seo: {
    title: 'Contact - HelvetiForma',
    description: 'Contactez notre équipe d\'experts pour vos questions sur la formation professionnelle.',
    keywords: 'contact, formation, conseil, accompagnement, HelvetiForma',
  },
  hero: {
    title: 'Contactez-nous',
    subtitle: 'Notre équipe d\'experts est là pour vous accompagner dans votre parcours de formation professionnelle.',
    backgroundImage: '/images/contact-hero.jpg',
    ctaPrimary: {
      text: 'Découvrir nos formations',
      link: '/concept'
    }
  },
  sections: [
    {
      _type: 'richTextSection',
      _key: 'contact-intro',
      title: 'Nous sommes à votre écoute',
      subtitle: 'Une question ? Un projet de formation ? N\'hésitez pas à nous contacter.',
      backgroundColor: 'white',
      content: [
        {
          _type: 'block',
          _key: 'intro1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span1',
              text: 'Notre équipe d\'experts en formation professionnelle est là pour vous accompagner dans vos projets d\'apprentissage et répondre à toutes vos questions.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'intro2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span2',
              text: 'Que vous soyez un particulier souhaitant développer vos compétences ou une entreprise cherchant à former vos collaborateurs, nous vous proposons des solutions sur mesure adaptées à vos besoins.',
              marks: [],
            },
          ],
        },
      ],
    },
    {
      _type: 'richTextSection',
      _key: 'contact-methods',
      title: 'Nos moyens de contact',
      subtitle: 'Plusieurs façons de nous joindre selon vos préférences',
      backgroundColor: 'lightblue',
      content: [
        {
          _type: 'block',
          _key: 'methods1',
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: 'span1',
              text: '📞 Par téléphone',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'methods2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span2',
              text: 'Appelez-nous directement au +41 22 123 45 67 pour un conseil personnalisé. Nos conseillers sont disponibles du lundi au vendredi de 8h00 à 18h00.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'methods3',
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: 'span3',
              text: '✉️ Par email',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'methods4',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span4',
              text: 'Envoyez-nous un email à contact@helvetiforma.ch. Nous vous répondrons dans les 24 heures maximum, souvent bien plus rapidement pendant les heures ouvrables.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'methods5',
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: 'span5',
              text: '📍 En personne',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'methods6',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span6',
              text: 'Rendez-vous dans nos locaux à Genève, Rue de la Formation 15, 1200 Genève. Nous vous accueillons sur rendez-vous du lundi au vendredi.',
              marks: [],
            },
          ],
        },
      ],
    },
    {
      _type: 'featureCards',
      _key: 'contact-benefits',
      title: 'Pourquoi nous contacter ?',
      subtitle: 'Les avantages de faire appel à nos services',
      columns: 2,
      cards: [
        {
          title: 'Conseil personnalisé',
          description: 'Un accompagnement sur mesure selon vos objectifs et contraintes',
          icon: '🎯',
          iconColor: 'blue',
        },
        {
          title: 'Expertise reconnue',
          description: 'Des formateurs certifiés avec une solide expérience professionnelle',
          icon: '⭐',
          iconColor: 'green',
        },
        {
          title: 'Réponse rapide',
          description: 'Nous nous engageons à vous répondre dans les 24h maximum',
          icon: '⚡',
          iconColor: 'purple',
        },
        {
          title: 'Support gratuit',
          description: 'Premier conseil et devis sans engagement de votre part',
          icon: '💡',
          iconColor: 'orange',
        },
      ],
    },
    {
      _type: 'richTextSection',
      _key: 'emergency-contact',
      title: 'Support d\'urgence',
      subtitle: 'En cas d\'urgence technique ou pédagogique',
      backgroundColor: 'gray',
      content: [
        {
          _type: 'block',
          _key: 'emergency1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span1',
              text: 'Pour toute urgence technique ou pédagogique en dehors des heures ouvrables, notre équipe de support est disponible :',
              marks: ['strong'],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'emergency2',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span2',
              text: 'Téléphone d\'urgence : +41 22 123 45 99',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'emergency3',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: 'span3',
              text: 'Email d\'urgence : urgent@helvetiforma.ch',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'emergency4',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span4',
              text: 'Ce service est réservé aux situations critiques nécessitant une intervention immédiate.',
              marks: [],
            },
          ],
        },
      ],
    },
  ],
}

async function importContactPage() {
  try {
    console.log('🔄 Checking if contact page already exists...')
    
    // Check if page already exists
    const existingPage = await client.fetch(
      '*[_type == "page" && slug.current == $slug][0]',
      { slug: 'contact' }
    )

    if (existingPage) {
      console.log('📝 Updating existing contact page...')
      const result = await client
        .patch(existingPage._id)
        .set({
          ...contactPageData,
          _id: existingPage._id,
          _type: 'page',
        })
        .commit()
      
      console.log('✅ Contact page updated successfully!')
      console.log('🔗 Page ID:', result._id)
    } else {
      console.log('📝 Creating new contact page...')
      const result = await client.create(contactPageData)
      
      console.log('✅ Contact page created successfully!')
      console.log('🔗 Page ID:', result._id)
    }

    console.log('\n🎉 Done! You can now edit the contact page in Sanity Studio.')
    console.log('🌐 Visit: http://localhost:3333 (or your Sanity Studio URL)')
  } catch (error) {
    console.error('❌ Error importing contact page:', error)
    process.exit(1)
  }
}

// Run the import
importContactPage()


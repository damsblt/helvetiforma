const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2024-01-01',
})

async function createArticlesPage() {
  try {
    console.log('Creating Articles page in Sanity...')

    const articlesPage = {
      _type: 'page',
      _id: 'articles-page',
      title: 'Articles & Ressources',
      slug: {
        _type: 'slug',
        current: 'articles',
      },
      description: 'Découvrez notre bibliothèque d\'articles, guides et ressources sur la comptabilité, la gestion des salaires et les charges sociales en Suisse.',
      hero: {
        _type: 'hero',
        title: 'Articles & Ressources',
        subtitle: 'Explorez notre bibliothèque d\'articles et guides pratiques sur la comptabilité, la gestion des salaires et les charges sociales en Suisse.',
        ctaPrimary: {
          text: 'Parcourir les articles',
          link: '#articles',
        },
      },
      sections: [
        {
          _type: 'richTextSection',
          _key: 'intro-section',
          title: 'Nos expertises',
          content: [
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Découvrez nos articles et guides rédigés par nos experts en comptabilité et gestion des ressources humaines. Nous mettons à jour régulièrement notre contenu pour refléter les dernières réglementations suisses.',
                },
              ],
            },
          ],
        },
        {
          _type: 'featureCards',
          _key: 'features-section',
          title: 'Nos catégories d\'articles',
          subtitle: 'Explorez nos ressources par domaine',
          columns: 3,
          cards: [
            {
              _key: 'comptabilite',
              title: 'Comptabilité',
              description: 'Guides et tutoriels sur la comptabilité suisse, normes Swiss GAAP FER, et tenue des comptes.',
              icon: 'calculator',
              iconColor: 'blue',
            },
            {
              _key: 'salaires',
              title: 'Gestion des Salaires',
              description: 'Tout sur le calcul des salaires, les charges sociales, et les obligations légales en Suisse.',
              icon: 'coins',
              iconColor: 'green',
            },
            {
              _key: 'fiscalite',
              title: 'Fiscalité',
              description: 'Articles sur la fiscalité des entreprises, la TVA, et les déclarations d\'impôts en Suisse.',
              icon: 'receipt',
              iconColor: 'purple',
            },
            {
              _key: 'rh',
              title: 'Ressources Humaines',
              description: 'Gestion du personnel, contrats de travail, et droit du travail suisse.',
              icon: 'users',
              iconColor: 'orange',
            },
            {
              _key: 'gestion',
              title: 'Gestion d\'Entreprise',
              description: 'Conseils pratiques pour la gestion quotidienne et le développement de votre entreprise.',
              icon: 'briefcase',
              iconColor: 'blue',
            },
            {
              _key: 'actualites',
              title: 'Actualités',
              description: 'Restez informé des dernières nouveautés et changements réglementaires en Suisse.',
              icon: 'newspaper',
              iconColor: 'green',
            },
          ],
        },
      ],
      seo: {
        title: 'Articles & Ressources - Formation Comptabilité Suisse | HelvetiForma',
        description: 'Découvrez nos articles et guides pratiques sur la comptabilité, la gestion des salaires et les charges sociales en Suisse. Ressources gratuites et premium.',
        keywords: 'articles comptabilité, guides salaires, ressources RH, formation suisse, comptabilité suisse',
      },
    }

    // Create or update the page
    const result = await client.createOrReplace(articlesPage)
    console.log('✅ Articles page created successfully!')
    console.log('Page ID:', result._id)
    console.log('Page slug:', result.slug.current)
    console.log('\nYou can now view and edit it in Sanity Studio:')
    console.log('https://helvetiforma.sanity.studio/structure/page;' + result._id)
  } catch (error) {
    console.error('❌ Error creating Articles page:', error)
    throw error
  }
}

// Run the script
createArticlesPage()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })


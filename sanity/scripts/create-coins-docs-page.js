import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function createCoinsDesDocsPage() {
  try {
    console.log('Creating "Coin des docs" page in Sanity...')
    
    const pageData = {
      _type: 'page',
      title: 'Coin des docs',
      slug: {
        current: 'coins-des-docs'
      },
      description: 'Découvrez notre bibliothèque de ressources et documents sur la comptabilité, la gestion des salaires et les charges sociales en Suisse.',
      hero: {
        title: 'Coin des docs',
        subtitle: 'Explorez notre bibliothèque de ressources et guides pratiques sur la comptabilité, la gestion des salaires et les charges sociales en Suisse.',
        backgroundImage: null,
        ctaPrimary: {
          text: 'Voir les prochaines sessions',
          link: '/sessions#webinaires'
        }
      },
      sections: [
        {
          _type: 'featureCards',
          _key: 'features-section',
          title: 'Nos ressources et guides',
          subtitle: 'Accédez à nos documents pratiques, guides et ressources pour maîtriser la comptabilité et la gestion RH en Suisse.',
          cards: [
            {
              title: 'Guides pratiques',
              description: 'Des guides détaillés sur la comptabilité, les salaires et les charges sociales en Suisse.',
              icon: '📚',
              iconColor: 'blue'
            },
            {
              title: 'Ressources gratuites',
              description: 'Accédez gratuitement à notre bibliothèque de documents et ressources professionnelles.',
              icon: '🆓',
              iconColor: 'green'
            },
            {
              title: 'Mis à jour régulièrement',
              description: 'Nos contenus sont régulièrement mis à jour pour refléter les dernières réglementations.',
              icon: '🔄',
              iconColor: 'purple'
            }
          ],
          columns: 3
        },
        {
          _type: 'richTextSection',
          _key: 'content-section',
          title: 'Documents disponibles',
          subtitle: 'Nos guides et ressources sont créés par nos experts certifiés et mis à jour selon les dernières réglementations suisses.',
          content: [
            {
              _type: 'block',
              _key: 'intro',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: 'intro-text',
                  text: 'Découvrez nos documents pratiques qui vous aideront à maîtriser la comptabilité et la gestion RH en Suisse. Tous nos guides sont créés par des experts certifiés et mis à jour régulièrement.',
                  marks: []
                }
              ]
            },
            {
              _type: 'block',
              _key: 'features',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: 'features-text',
                  text: 'Nos documents couvrent :',
                  marks: ['strong']
                }
              ]
            },
            {
              _type: 'block',
              _key: 'list',
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: 'list-item-1',
                  text: 'Gestion des salaires et charges sociales',
                  marks: []
                }
              ]
            },
            {
              _type: 'block',
              _key: 'list2',
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: 'list-item-2',
                  text: 'Comptabilité selon les normes suisses',
                  marks: []
                }
              ]
            },
            {
              _type: 'block',
              _key: 'list3',
              style: 'normal',
              listItem: 'bullet',
              children: [
                {
                  _type: 'span',
                  _key: 'list-item-3',
                  text: 'Réglementations et obligations légales',
                  marks: []
                }
              ]
            }
          ],
          columns: 1
        }
      ]
    }

    // Check if page already exists
    const existingPage = await client.fetch('*[_type == "page" && slug.current == "coins-des-docs"][0]')
    
    if (existingPage) {
      console.log('Page already exists, updating...')
      const result = await client
        .patch(existingPage._id)
        .set(pageData)
        .commit()
      console.log('✅ Page updated successfully:', result._id)
    } else {
      const result = await client.create(pageData)
      console.log('✅ Page created successfully:', result._id)
    }

    console.log('🎉 "Coin des docs" page is ready in Sanity Studio!')
    console.log('You can now edit it at: http://localhost:3333')
    
  } catch (error) {
    console.error('❌ Error creating page:', error)
  }
}

createCoinsDesDocsPage()

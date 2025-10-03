import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function fixSessionsSection() {
  try {
    console.log('Fixing Sessions section in homepage...')
    
    // First, get the existing homepage
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Homepage not found')
      return
    }

    console.log('Found homepage:', homepage._id)

    // Filter out any invalid sessionsSection items
    const validSections = (homepage.sections || []).filter(section => {
      // Remove any sections with _type "sessionsSection" that might be invalid
      return section._type !== 'sessionsSection'
    })

    // Create the new valid sessions section
    const newSessionsSection = {
      _type: 'sessionsSection',
      _key: 'sessions-section-fixed',
      title: 'Sessions en ligne et en présentiel',
      subtitle: 'Participez à nos sessions interactives en direct via Microsoft Teams ou dans nos locaux',
      cards: [
        {
          _type: 'sessionCard',
          _key: 'card-1',
          title: 'Webinaires en ligne',
          description: 'Participez à nos sessions interactives depuis chez vous via Microsoft Teams. Questions en direct et échanges avec nos experts.',
          iconType: 'calendar',
          iconColor: 'blue',
          detailText: 'Sessions de 60-90 minutes',
          detailIcon: 'clock',
          detailColor: 'blue',
        },
        {
          _type: 'sessionCard',
          _key: 'card-2',
          title: 'Formation en présentiel',
          description: 'Rejoignez-nous dans nos locaux pour des sessions pratiques avec du matériel et des échanges privilégiés avec nos formateurs.',
          iconType: 'map-pin',
          iconColor: 'green',
          detailText: 'Groupes limités (8-12 personnes)',
          detailIcon: 'users',
          detailColor: 'green',
        },
        {
          _type: 'sessionCard',
          _key: 'card-3',
          title: 'Sessions interactives',
          description: 'Que ce soit en ligne ou en présentiel, nos sessions sont conçues pour être interactives avec des cas pratiques et des échanges.',
          iconType: 'users',
          iconColor: 'purple',
          detailText: 'Programmation flexible',
          detailIcon: 'calendar',
          detailColor: 'purple',
        },
      ],
      cta: {
        _type: 'object',
        title: 'Prêt à participer à nos prochaines sessions ?',
        subtitle: 'Découvrez notre calendrier et inscrivez-vous aux sessions qui vous intéressent.',
        buttons: [
          {
            _type: 'ctaButton',
            _key: 'button-1',
            text: 'Voir les prochaines sessions',
            link: '/sessions#webinaires',
            style: 'primary',
          },
          {
            _type: 'ctaButton',
            _key: 'button-2',
            text: 'Nous contacter',
            link: '/contact',
            style: 'secondary',
          },
        ],
        features: [
          {
            _type: 'featureItem',
            _key: 'feature-1',
            text: 'Sessions mensuelles',
            icon: 'calendar',
            color: 'blue',
          },
          {
            _type: 'featureItem',
            _key: 'feature-2',
            text: 'Experts certifiés',
            icon: 'users',
            color: 'green',
          },
          {
            _type: 'featureItem',
            _key: 'feature-3',
            text: 'Suisse romande',
            icon: 'map-pin',
            color: 'purple',
          },
        ],
      },
    }

    // Add the new sessions section to the homepage
    const result = await client
      .patch(homepage._id)
      .set({
        sections: [...validSections, newSessionsSection]
      })
      .commit()

    console.log('✅ Sessions section fixed successfully!')
    console.log('You can now edit it at: http://localhost:3333')
    
  } catch (error) {
    console.error('❌ Error fixing sessions section:', error)
  }
}

fixSessionsSection()

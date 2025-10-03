import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function addSessionsToHomepage() {
  try {
    console.log('Adding Sessions section to homepage...')
    
    // First, get the existing homepage
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Homepage not found')
      return
    }

    console.log('Found homepage:', homepage._id)

    // Create the sessions section
    const sessionsSection = {
      _type: 'sessionsSection',
      _key: 'sessions-section',
      title: 'Sessions en ligne et en présentiel',
      subtitle: 'Participez à nos sessions interactives en direct via Microsoft Teams ou dans nos locaux',
      cards: [
        {
          title: 'Webinaires en ligne',
          description: 'Participez à nos sessions interactives depuis chez vous via Microsoft Teams. Questions en direct et échanges avec nos experts.',
          iconType: 'calendar',
          iconColor: 'blue',
          detailText: 'Sessions de 60-90 minutes',
          detailIcon: 'clock',
          detailColor: 'blue',
        },
        {
          title: 'Formation en présentiel',
          description: 'Rejoignez-nous dans nos locaux pour des sessions pratiques avec du matériel et des échanges privilégiés avec nos formateurs.',
          iconType: 'map-pin',
          iconColor: 'green',
          detailText: 'Groupes limités (8-12 personnes)',
          detailIcon: 'users',
          detailColor: 'green',
        },
        {
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
        title: 'Prêt à participer à nos prochaines sessions ?',
        subtitle: 'Découvrez notre calendrier et inscrivez-vous aux sessions qui vous intéressent.',
        buttons: [
          {
            text: 'Voir les prochaines sessions',
            link: '/sessions#webinaires',
            style: 'primary',
          },
          {
            text: 'Nous contacter',
            link: '/contact',
            style: 'secondary',
          },
        ],
        features: [
          {
            text: 'Sessions mensuelles',
            icon: 'calendar',
            color: 'blue',
          },
          {
            text: 'Experts certifiés',
            icon: 'users',
            color: 'green',
          },
          {
            text: 'Suisse romande',
            icon: 'map-pin',
            color: 'purple',
          },
        ],
      },
    }

    // Add the sessions section to the homepage
    const result = await client
      .patch(homepage._id)
      .set({
        sections: [...(homepage.sections || []), sessionsSection]
      })
      .commit()

    console.log('✅ Sessions section added to homepage successfully!')
    console.log('You can now edit it at: http://localhost:3333')
    
  } catch (error) {
    console.error('❌ Error adding sessions section:', error)
  }
}

addSessionsToHomepage()

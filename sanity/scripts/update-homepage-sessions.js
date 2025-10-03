import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function updateHomepageSessions() {
  try {
    console.log('Updating homepage with sessions section...')
    
    // First, get the existing homepage
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Homepage not found')
      return
    }

    console.log('Found homepage:', homepage._id)

    // Remove any existing sessions sections to avoid duplicates
    const sectionsWithoutSessions = (homepage.sections || []).filter(section => {
      return section._type !== 'sessionsSection'
    })

    // Create the sessions section with the original content
    const sessionsSection = {
      _type: 'sessionsSection',
      _key: 'sessions-section-original',
      title: 'Sessions en ligne et en présentiel',
      subtitle: 'Participez à nos sessions interactives en direct via Microsoft Teams ou dans nos locaux',
      cards: [
        {
          _type: 'sessionCard',
          _key: 'webinaires-online',
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
          _key: 'formation-presentiel',
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
          _key: 'sessions-interactives',
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
            _key: 'btn-sessions',
            text: 'Voir les prochaines sessions',
            link: '/sessions#webinaires',
            style: 'primary',
          },
          {
            _type: 'ctaButton',
            _key: 'btn-contact',
            text: 'Nous contacter',
            link: '/contact',
            style: 'secondary',
          },
        ],
        features: [
          {
            _type: 'featureItem',
            _key: 'feature-monthly',
            text: 'Sessions mensuelles',
            icon: 'calendar',
            color: 'blue',
          },
          {
            _type: 'featureItem',
            _key: 'feature-experts',
            text: 'Experts certifiés',
            icon: 'users',
            color: 'green',
          },
          {
            _type: 'featureItem',
            _key: 'feature-switzerland',
            text: 'Suisse romande',
            icon: 'map-pin',
            color: 'purple',
          },
        ],
      },
    }

    // Update the homepage with the new sections array
    const result = await client
      .patch(homepage._id)
      .set({
        sections: [...sectionsWithoutSessions, sessionsSection]
      })
      .commit()

    console.log('✅ Homepage updated with sessions section successfully!')
    console.log('📋 Sessions section added with:')
    console.log('   - 3 session type cards (Webinaires, Présentiel, Interactives)')
    console.log('   - CTA section with 2 buttons')
    console.log('   - Feature list with 3 items')
    console.log('')
    console.log('🎨 You can now edit it at: http://localhost:3333')
    console.log('   Go to: Pages → Home → Sessions Section')
    
  } catch (error) {
    console.error('❌ Error updating homepage:', error)
  }
}

updateHomepageSessions()

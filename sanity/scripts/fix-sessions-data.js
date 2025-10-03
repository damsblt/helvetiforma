import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function fixSessionsData() {
  try {
    console.log('Fixing sessions section data...')
    
    // Get the homepage
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Homepage not found')
      return
    }

    console.log('Found homepage:', homepage._id)

    // Remove existing sessions sections
    const sectionsWithoutSessions = (homepage.sections || []).filter(section => {
      return section._type !== 'sessionsSection'
    })

    // Create the corrected sessions section
    const sessionsSection = {
      _type: 'sessionsSection',
      _key: 'sessions-section-fixed',
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

    // Update the homepage
    const result = await client
      .patch(homepage._id)
      .set({
        sections: [...sectionsWithoutSessions, sessionsSection]
      })
      .commit()

    console.log('✅ Sessions section data fixed successfully!')
    console.log('📋 Fixed issues:')
    console.log('   - Added proper iconType for all cards')
    console.log('   - Fixed CTA section structure')
    console.log('   - Added proper button links')
    console.log('   - Added feature list with icons')
    console.log('')
    console.log('🎨 The sessions section should now display correctly with:')
    console.log('   - 3 session cards with proper icons')
    console.log('   - CTA section with 2 buttons')
    console.log('   - Feature list at the bottom')
    
  } catch (error) {
    console.error('❌ Error fixing sessions data:', error)
  }
}

fixSessionsData()

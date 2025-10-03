import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function addSessionsToHome() {
  try {
    console.log('🔍 Récupération de la page d\'accueil...')
    
    // Get the homepage
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Page d\'accueil non trouvée')
      return
    }

    console.log('✅ Page d\'accueil trouvée:', homepage._id)
    console.log('📊 Sections actuelles:', homepage.sections?.length || 0)

    // Remove any existing threeCardsWithCta sections with sessions content to avoid duplicates
    const sectionsWithoutSessions = (homepage.sections || []).filter(section => {
      return !(section._type === 'threeCardsWithCta' && section._key === 'sessions-section')
    })

    // Create the Sessions section using threeCardsWithCta schema type
    const sessionsSection = {
      _type: 'threeCardsWithCta',
      _key: 'sessions-section',
      title: 'Sessions en ligne et en présentiel',
      subtitle: 'Participez à nos sessions interactives en direct via Microsoft Teams ou dans nos locaux',
      cards: [
        {
          _key: 'webinaires-online',
          title: 'Webinaires en ligne',
          description: 'Participez à nos sessions interactives depuis chez vous via Microsoft Teams. Questions en direct et échanges avec nos experts.',
          icon: '📅',
          iconColor: 'blue',
          detailText: 'Sessions de 60-90 minutes',
          detailIcon: '⏰',
          detailColor: 'blue',
        },
        {
          _key: 'formation-presentiel',
          title: 'Formation en présentiel',
          description: 'Rejoignez-nous dans nos locaux pour des sessions pratiques avec du matériel et des échanges privilégiés avec nos formateurs.',
          icon: '📍',
          iconColor: 'green',
          detailText: 'Groupes limités (8-12 personnes)',
          detailIcon: '👥',
          detailColor: 'green',
        },
        {
          _key: 'sessions-interactives',
          title: 'Sessions interactives',
          description: 'Que ce soit en ligne ou en présentiel, nos sessions sont conçues pour être interactives avec des cas pratiques et des échanges.',
          icon: '👥',
          iconColor: 'purple',
          detailText: 'Programmation flexible',
          detailIcon: '📅',
          detailColor: 'purple',
        },
      ],
      ctaCard: {
        title: 'Prêt à participer à nos prochaines sessions ?',
        subtitle: 'Découvrez notre calendrier et inscrivez-vous aux sessions qui vous intéressent.',
        primaryButton: {
          text: '📅 Voir les prochaines sessions',
          link: '/calendrier',
          icon: '📅',
        },
        secondaryButton: {
          text: 'Nous contacter',
          link: '/contact',
        },
        features: [
          {
            _key: 'feature-monthly',
            text: 'Sessions mensuelles',
            icon: '📅',
            color: 'blue',
          },
          {
            _key: 'feature-experts',
            text: 'Experts certifiés',
            icon: '👥',
            color: 'green',
          },
          {
            _key: 'feature-switzerland',
            text: 'Suisse romande',
            icon: '📍',
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

    console.log('')
    console.log('✅ Section Sessions ajoutée avec succès !')
    console.log('')
    console.log('📋 Contenu ajouté :')
    console.log('   📌 Type: threeCardsWithCta')
    console.log('   📌 Key: sessions-section')
    console.log('   📌 Titre: "Sessions en ligne et en présentiel"')
    console.log('   📌 3 cartes:')
    console.log('      - Webinaires en ligne (📅 bleu)')
    console.log('      - Formation en présentiel (📍 vert)')
    console.log('      - Sessions interactives (👥 violet)')
    console.log('   📌 Carte CTA horizontale avec:')
    console.log('      - 2 boutons (Voir les sessions + Contact)')
    console.log('      - 3 fonctionnalités (Sessions mensuelles, Experts, Suisse romande)')
    console.log('')
    console.log('🎨 Vous pouvez maintenant l\'éditer dans Sanity Studio :')
    console.log('   http://localhost:3333')
    console.log('   → Pages → Home → Three Cards Column + Horizontal Card')
    console.log('')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la section:', error)
  }
}

addSessionsToHome()


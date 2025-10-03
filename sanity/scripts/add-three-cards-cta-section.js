import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function addThreeCardsCtaSection() {
  try {
    console.log('Ajout de la section "Three Cards + CTA" à la page d\'accueil...')
    
    // Récupérer la page d'accueil
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Page d\'accueil non trouvée')
      return
    }

    console.log('Page d\'accueil trouvée:', homepage._id)

    // Supprimer l'ancienne section sessions (featureCards ou sessionsSection)
    const sectionsWithoutSessions = (homepage.sections || []).filter(section => {
      const isSessionsFeatureCards = section._type === 'featureCards' && section.title?.includes('Sessions')
      const isSessionsSection = section._type === 'sessionsSection'
      return !isSessionsFeatureCards && !isSessionsSection
    })

    console.log('Sections après suppression:', sectionsWithoutSessions.length)

    // Créer la nouvelle section avec le layout "Three Cards + CTA"
    const threeCardsCtaSection = {
      _type: 'threeCardsWithCta',
      _key: 'sessions-three-cards-cta',
      title: 'Sessions en ligne et en présentiel',
      subtitle: 'Participez à nos sessions interactives en direct via Microsoft Teams ou dans nos locaux',
      cards: [
        {
          _type: 'cardWithDetail',
          _key: 'webinaires-card',
          title: 'Webinaires en ligne',
          description: 'Participez à nos sessions interactives depuis chez vous via Microsoft Teams. Questions en direct et échanges avec nos experts.',
          icon: '📅',
          iconColor: 'blue',
          detailText: 'Sessions de 60-90 minutes',
          detailIcon: '⏰',
          detailColor: 'blue',
        },
        {
          _type: 'cardWithDetail',
          _key: 'presentiel-card',
          title: 'Formation en présentiel',
          description: 'Rejoignez-nous dans nos locaux pour des sessions pratiques avec du matériel et des échanges privilégiés avec nos formateurs.',
          icon: '📍',
          iconColor: 'green',
          detailText: 'Groupes limités (8-12 personnes)',
          detailIcon: '👥',
          detailColor: 'green',
        },
        {
          _type: 'cardWithDetail',
          _key: 'interactives-card',
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
          text: 'Voir les prochaines sessions',
          link: '/sessions#webinaires',
          icon: '📅',
        },
        secondaryButton: {
          text: 'Nous contacter',
          link: '/contact',
        },
        features: [
          {
            text: 'Sessions mensuelles',
            icon: '📅',
            color: 'blue',
          },
          {
            text: 'Experts certifiés',
            icon: '👥',
            color: 'green',
          },
          {
            text: 'Suisse romande',
            icon: '📍',
            color: 'purple',
          },
        ],
      },
    }

    // Ajouter la nouvelle section
    const result = await client
      .patch(homepage._id)
      .set({
        sections: [...sectionsWithoutSessions, threeCardsCtaSection]
      })
      .commit()

    console.log('✅ Section "Three Cards + CTA" ajoutée avec succès !')
    console.log('📋 Contenu ajouté :')
    console.log('   - Layout : 3 cartes en colonnes + Carte CTA horizontale')
    console.log('   - 3 cartes de types de sessions')
    console.log('   - Carte CTA avec 2 boutons')
    console.log('   - Liste de 3 fonctionnalités')
    console.log('')
    console.log('🎨 Vous pouvez maintenant l\'éditer dans Sanity Studio :')
    console.log('   http://localhost:3333')
    console.log('   Pages → Home → "Sessions en ligne et en présentiel"')
    console.log('')
    console.log('✅ Ce nouveau schéma évite les problèmes de validation !')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la section:', error)
  }
}

addThreeCardsCtaSection()

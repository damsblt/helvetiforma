import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function addSessionsSectionFinal() {
  try {
    console.log('Ajout de la section Sessions à la page d\'accueil...')
    
    // Récupérer la page d'accueil
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Page d\'accueil non trouvée')
      return
    }

    console.log('Page d\'accueil trouvée:', homepage._id)
    console.log('Sections actuelles:', homepage.sections?.length || 0)

    // Créer la section sessions avec le contenu exact de la page d'accueil
    const sessionsSection = {
      _type: 'sessionsSection',
      _key: 'sessions-section-final',
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

    // Ajouter la section sessions à la page d'accueil
    const result = await client
      .patch(homepage._id)
      .set({
        sections: [...(homepage.sections || []), sessionsSection]
      })
      .commit()

    console.log('✅ Section Sessions ajoutée avec succès !')
    console.log('📋 Contenu ajouté :')
    console.log('   - Titre : "Sessions en ligne et en présentiel"')
    console.log('   - 3 cartes de types de sessions')
    console.log('   - Section CTA avec boutons')
    console.log('   - Liste de fonctionnalités')
    console.log('')
    console.log('🎨 Vous pouvez maintenant l\'éditer dans Sanity Studio :')
    console.log('   http://localhost:3333')
    console.log('   Pages → Home → Section Sessions')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la section Sessions:', error)
  }
}

addSessionsSectionFinal()

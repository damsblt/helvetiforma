import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function fixSessionsSchema() {
  try {
    console.log('Correction du schéma Sessions...')
    
    // Récupérer la page d'accueil
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Page d\'accueil non trouvée')
      return
    }

    console.log('Page d\'accueil trouvée:', homepage._id)

    // Supprimer toutes les sections sessionsSection problématiques
    const sectionsWithoutSessions = (homepage.sections || []).filter(section => {
      return section._type !== 'sessionsSection'
    })

    console.log('Sections après suppression:', sectionsWithoutSessions.length)

    // Créer une section featureCards avec le contenu des sessions
    // (utilisant un schéma existant qui fonctionne)
    const sessionsAsFeatureCards = {
      _type: 'featureCards',
      _key: 'sessions-as-feature-cards',
      title: 'Sessions en ligne et en présentiel',
      subtitle: 'Participez à nos sessions interactives en direct via Microsoft Teams ou dans nos locaux',
      cards: [
        {
          _type: 'object',
          _key: 'webinaires-card',
          title: 'Webinaires en ligne',
          description: 'Participez à nos sessions interactives depuis chez vous via Microsoft Teams. Questions en direct et échanges avec nos experts.',
          icon: '📅',
          iconColor: 'blue',
        },
        {
          _type: 'object',
          _key: 'presentiel-card',
          title: 'Formation en présentiel',
          description: 'Rejoignez-nous dans nos locaux pour des sessions pratiques avec du matériel et des échanges privilégiés avec nos formateurs.',
          icon: '📍',
          iconColor: 'green',
        },
        {
          _type: 'object',
          _key: 'interactives-card',
          title: 'Sessions interactives',
          description: 'Que ce soit en ligne ou en présentiel, nos sessions sont conçues pour être interactives avec des cas pratiques et des échanges.',
          icon: '👥',
          iconColor: 'purple',
        },
      ],
      columns: 3,
    }

    // Ajouter la section comme featureCards (qui fonctionne)
    const result = await client
      .patch(homepage._id)
      .set({
        sections: [...sectionsWithoutSessions, sessionsAsFeatureCards]
      })
      .commit()

    console.log('✅ Section Sessions ajoutée comme Feature Cards !')
    console.log('📋 Utilisation du schéma featureCards existant')
    console.log('')
    console.log('🎨 Vous pouvez maintenant l\'éditer dans Sanity Studio :')
    console.log('   http://localhost:3333')
    console.log('   Pages → Home → Section "Sessions en ligne et en présentiel"')
    console.log('')
    console.log('💡 Note: J\'utilise le schéma featureCards qui fonctionne déjà')
    console.log('   pour éviter les problèmes de validation du schéma sessionsSection')
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
  }
}

fixSessionsSchema()

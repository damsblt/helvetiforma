import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function addSessionsSectionToHome() {
  try {
    console.log('🔍 Vérification de la page home...')
    
    // Get the homepage data
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Page home non trouvée')
      return
    }

    console.log('✅ Page home trouvée:', homepage.title)
    console.log('📊 Nombre de sections actuelles:', homepage.sections?.length || 0)
    
    // Check if sessions section already exists
    const existingSessionsSection = homepage.sections?.find(section => section._type === 'threeCardsWithCta' && section.title?.includes('Sessions'))
    
    if (existingSessionsSection) {
      console.log('⚠️ Section sessions déjà présente:', existingSessionsSection.title)
      console.log('🔄 Mise à jour de la section existante...')
      
      // Update existing section
      const updatedSections = homepage.sections.map(section => {
        if (section._key === existingSessionsSection._key) {
          return {
            ...section,
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
                text: 'Voir les prochaines sessions',
                link: '/calendrier',
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
        }
        return section
      })
      
      await client.patch(homepage._id).set({sections: updatedSections}).commit()
      console.log('✅ Section sessions mise à jour avec succès!')
      
    } else {
      console.log('➕ Ajout de la nouvelle section sessions...')
      
      // Create the sessions section
      const sessionsSection = {
        _type: 'threeCardsWithCta',
        _key: 'sessions-section-' + Date.now(),
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
            text: 'Voir les prochaines sessions',
            link: '/calendrier',
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
      
      // Add the section to the homepage
      const currentSections = homepage.sections || []
      const updatedSections = [...currentSections, sessionsSection]
      
      await client.patch(homepage._id).set({sections: updatedSections}).commit()
      console.log('✅ Section sessions ajoutée avec succès!')
    }
    
    // Verify the update
    console.log('\n🔍 Vérification de la mise à jour...')
    const updatedHomepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    console.log('📊 Nombre de sections après mise à jour:', updatedHomepage.sections?.length || 0)
    
    const sessionsSection = updatedHomepage.sections?.find(section => section._type === 'threeCardsWithCta' && section.title?.includes('Sessions'))
    if (sessionsSection) {
      console.log('✅ Section sessions confirmée:', sessionsSection.title)
      console.log('📋 Nombre de cartes:', sessionsSection.cards?.length || 0)
      console.log('🎯 CTA présent:', !!sessionsSection.ctaCard)
    }
    
    console.log('\n🎉 Opération terminée avec succès!')
    console.log('💡 Vous pouvez maintenant éditer cette section via Sanity Studio')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la section sessions:', error)
  }
}

addSessionsSectionToHome()

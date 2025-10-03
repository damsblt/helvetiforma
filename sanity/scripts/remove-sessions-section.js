import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function removeSessionsSection() {
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

    // Remove the sessions section (threeCardsWithCta with key 'sessions-section')
    const sectionsWithoutSessions = (homepage.sections || []).filter(section => {
      return !(section._type === 'threeCardsWithCta' && section._key === 'sessions-section')
    })

    console.log('📊 Sections après suppression:', sectionsWithoutSessions.length)

    // Update the homepage
    const result = await client
      .patch(homepage._id)
      .set({
        sections: sectionsWithoutSessions
      })
      .commit()

    console.log('')
    console.log('✅ Section Sessions supprimée avec succès !')
    console.log('📋 Sections restantes:', sectionsWithoutSessions.length)
    console.log('')
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
  }
}

removeSessionsSection()


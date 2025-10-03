import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function removeTestSection() {
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

    // Remove the test section (featureCards with key '4d72f25633a2')
    const sectionsWithoutTest = (homepage.sections || []).filter(section => {
      // Remove the section with the test cards (key: 4d72f25633a2)
      return section._key !== '4d72f25633a2'
    })

    console.log('📊 Sections après suppression:', sectionsWithoutTest.length)

    // Update the homepage
    const result = await client
      .patch(homepage._id)
      .set({
        sections: sectionsWithoutTest
      })
      .commit()

    console.log('')
    console.log('✅ Section test supprimée avec succès !')
    console.log('📋 Sections restantes:', sectionsWithoutTest.length)
    console.log('')
    console.log('🎉 La section "Sessions en ligne et en présentiel" est maintenant visible !')
    console.log('')
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
  }
}

removeTestSection()


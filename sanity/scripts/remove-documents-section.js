import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function removeDocumentsSection() {
  try {
    console.log('🔍 Recherche de la section "Documents disponibles"...')
    
    // Get the coins-des-docs page
    const page = await client.fetch('*[_type == "page" && slug.current == "coins-des-docs"][0]')
    
    if (!page) {
      console.log('❌ Page "coins-des-docs" non trouvée')
      return
    }

    console.log('✅ Page trouvée:', page.title)
    console.log('📊 Nombre de sections actuelles:', page.sections?.length || 0)
    
    // Find the documents section
    const documentsSectionIndex = page.sections?.findIndex(section => 
      section.title === 'Documents disponibles' || 
      section.subtitle?.includes('Nos guides et ressources sont créés')
    )
    
    if (documentsSectionIndex === -1 || documentsSectionIndex === undefined) {
      console.log('❌ Section "Documents disponibles" non trouvée')
      return
    }
    
    console.log('✅ Section trouvée à l\'index:', documentsSectionIndex)
    console.log('📋 Section à supprimer:', page.sections[documentsSectionIndex].title)
    
    // Remove the section
    const updatedSections = page.sections.filter((_, index) => index !== documentsSectionIndex)
    
    console.log('🔄 Suppression de la section...')
    
    // Update the page
    await client.patch(page._id).set({sections: updatedSections}).commit()
    
    console.log('✅ Section supprimée avec succès!')
    console.log('📊 Nombre de sections après suppression:', updatedSections.length)
    
    // Verify the update
    console.log('\n🔍 Vérification de la mise à jour...')
    const updatedPage = await client.fetch('*[_type == "page" && slug.current == "coins-des-docs"][0]')
    console.log('📊 Nombre de sections après vérification:', updatedPage.sections?.length || 0)
    
    // List remaining sections
    if (updatedPage.sections) {
      console.log('\n📋 Sections restantes:')
      updatedPage.sections.forEach((section, index) => {
        console.log(`${index + 1}. ${section._type} - ${section.title || 'Sans titre'}`)
      })
    }
    
    console.log('\n🎉 Suppression terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la section:', error)
  }
}

removeDocumentsSection()
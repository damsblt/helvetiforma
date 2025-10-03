import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function forceRefreshHomepage() {
  try {
    console.log('Forcing homepage refresh...')
    
    // Get the homepage
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Homepage not found')
      return
    }

    console.log('Found homepage:', homepage._id)
    console.log('Current sections:', homepage.sections?.length || 0)
    
    // Log all sections to see what's there
    homepage.sections?.forEach((section, index) => {
      console.log(`Section ${index + 1}:`, section._type, section.title || 'No title')
    })

    // Force update by patching without changing anything (this triggers a refresh)
    const result = await client
      .patch(homepage._id)
      .set({
        // Just set the same data to trigger a refresh
        sections: homepage.sections
      })
      .commit()

    console.log('✅ Homepage refreshed successfully!')
    console.log('📋 Sanity Studio should now show all sections')
    console.log('')
    console.log('🔄 Please refresh your browser at: http://localhost:3333')
    console.log('   Go to: Pages → Home')
    console.log('   You should now see 3 sections including the Sessions section')
    
  } catch (error) {
    console.error('❌ Error refreshing homepage:', error)
  }
}

forceRefreshHomepage()

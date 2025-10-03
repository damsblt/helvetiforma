import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function checkHomepageData() {
  try {
    console.log('Checking homepage data...')
    
    // Get the homepage data
    const homepage = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!homepage) {
      console.log('❌ Homepage not found')
      return
    }

    console.log('Homepage found:', homepage.title)
    console.log('Number of sections:', homepage.sections?.length || 0)
    
    // Check for sessions section
    const sessionsSection = homepage.sections?.find(section => section._type === 'threeCardsWithCta' && section.title?.includes('Sessions'))
    
    if (!sessionsSection) {
      console.log('❌ No sessions section found')
      return
    }
    
    console.log('✅ Sessions section found')
    console.log('Title:', sessionsSection.title)
    console.log('Subtitle:', sessionsSection.subtitle)
    console.log('Number of cards:', sessionsSection.cards?.length || 0)
    console.log('Has CTA:', !!sessionsSection.ctaCard)
    
    if (sessionsSection.ctaCard) {
      console.log('CTA Title:', sessionsSection.ctaCard.title)
      console.log('CTA Subtitle:', sessionsSection.ctaCard.subtitle)
      console.log('Primary Button:', sessionsSection.ctaCard.primaryButton?.text)
      console.log('Secondary Button:', sessionsSection.ctaCard.secondaryButton?.text)
      console.log('Number of features:', sessionsSection.ctaCard.features?.length || 0)
    }
    
    // Pretty print the full sessions section
    console.log('\n=== FULL SESSIONS SECTION DATA ===')
    console.log(JSON.stringify(sessionsSection, null, 2))
    
  } catch (error) {
    console.error('❌ Error checking homepage data:', error)
  }
}

checkHomepageData()

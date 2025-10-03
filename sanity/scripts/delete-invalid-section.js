// Script to delete the invalid threeCardsWithCta section from the home page
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xzzyyelh',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function deleteInvalidSection() {
  try {
    console.log('🔍 Fetching home page...')
    
    // Fetch the home page
    const homePage = await client.fetch(`*[_type == "page" && slug.current == "home"][0]{
      _id,
      _rev,
      sections
    }`)
    
    if (!homePage) {
      console.log('❌ Home page not found')
      return
    }
    
    console.log('📄 Home page found:', homePage._id)
    console.log('📦 Current sections:', homePage.sections?.length || 0)
    
    // Filter out sections with _type === 'threeCardsWithCta' or _type === 'sessions-three-cards-cta'
    const validSections = homePage.sections?.filter(section => {
      if (section._type === 'threeCardsWithCta') {
        console.log('🗑️  Removing invalid section:', section._key)
        return false
      }
      if (section._type === 'sessions-three-cards-cta') {
        console.log('🗑️  Removing invalid section:', section._key)
        return false
      }
      return true
    })
    
    if (validSections?.length === homePage.sections?.length) {
      console.log('✅ No invalid sections found')
      return
    }
    
    console.log('🔧 Updating page...')
    
    // Update the page with valid sections only
    const result = await client
      .patch(homePage._id)
      .set({ sections: validSections })
      .commit()
    
    console.log('✅ Page updated successfully!')
    console.log('📦 New sections count:', validSections?.length || 0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

deleteInvalidSection()


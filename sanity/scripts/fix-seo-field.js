import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function fixSeoField() {
  try {
    console.log('Checking for pages with SEO field...')
    
    // Find all pages that might have the seo field
    const pages = await client.fetch('*[_type == "page" && defined(seo)]')
    
    if (pages.length === 0) {
      console.log('✅ No pages found with SEO field')
      return
    }

    console.log(`Found ${pages.length} page(s) with SEO field:`)
    
    for (const page of pages) {
      console.log(`- Page: ${page.title} (${page.slug?.current || 'no slug'})`)
      console.log(`  SEO data:`, page.seo)
      
      // Option 1: Remove the seo field
      await client
        .patch(page._id)
        .unset(['seo'])
        .commit()
      
      console.log(`  ✅ Removed SEO field from page: ${page.title}`)
    }
    
    console.log('')
    console.log('🎉 All SEO fields have been removed from pages!')
    console.log('The "Unknown field found" error should now be resolved.')
    
  } catch (error) {
    console.error('❌ Error fixing SEO field:', error)
  }
}

fixSeoField()

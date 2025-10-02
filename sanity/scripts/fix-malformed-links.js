const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN || ''
})

async function fixMalformedLinks() {
  try {
    console.log('🔍 Checking for malformed links in Sanity...\n')

    // Get all pages
    const query = '*[_type == "page"]'
    const pages = await client.fetch(query)

    for (const page of pages) {
      let needsUpdate = false
      const patches = {}

      // Check hero CTA primary link
      if (page.hero?.ctaPrimary?.link) {
        const link = page.hero.ctaPrimary.link
        if (link.includes('href=')) {
          // Extract the actual link from href="..."
          const match = link.match(/href="([^"]+)"/) || link.match(/href='([^']+)'/)
          if (match) {
            const cleanLink = match[1]
            patches['hero.ctaPrimary.link'] = cleanLink
            needsUpdate = true
            console.log(`📝 Page: ${page.slug.current}`)
            console.log(`   ❌ Malformed: ${link}`)
            console.log(`   ✅ Will fix to: ${cleanLink}\n`)
          }
        }
      }

      // Check hero CTA secondary link
      if (page.hero?.ctaSecondary?.link) {
        const link = page.hero.ctaSecondary.link
        if (link.includes('href=')) {
          const match = link.match(/href="([^"]+)"/) || link.match(/href='([^']+)'/)
          if (match) {
            const cleanLink = match[1]
            patches['hero.ctaSecondary.link'] = cleanLink
            needsUpdate = true
            console.log(`📝 Page: ${page.slug.current} (secondary CTA)`)
            console.log(`   ❌ Malformed: ${link}`)
            console.log(`   ✅ Will fix to: ${cleanLink}\n`)
          }
        }
      }

      // Apply patches if needed
      if (needsUpdate) {
        await client.patch(page._id).set(patches).commit()
        console.log(`✅ Fixed links for page: ${page.slug.current}\n`)
      }
    }

    console.log('✅ All malformed links have been fixed!')
  } catch (error) {
    console.error('❌ Error fixing links:', error.message)
    process.exit(1)
  }
}

fixMalformedLinks()


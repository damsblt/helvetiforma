import { createClient } from '@sanity/client'

// Initialize Sanity client
const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skOf1cdTkc5TF7hHh07NAtcikT1gheEXy8R0Hrnim8mV5YUg6YX73bP3lK6sZajxPB3cfTyWzc6aoBhLC2hakDl4vjpY8m75a2OycTlVugOMd3z5vIgE4RRl4k3aruVaw2J7xF0jDacQO4qmZX6ZAZs253uyIn2ekRRLQWoiwxawMqSilCpo',
  useCdn: false,
})

async function updateContactHeroScroll() {
  try {
    console.log('🔄 Updating contact page hero CTA to scroll to second section...')
    
    // Get the contact page
    const contactPage = await client.fetch(
      '*[_type == "page" && slug.current == "contact"][0]'
    )

    if (!contactPage) {
      console.error('❌ Contact page not found')
      return
    }

    // Update the hero CTA to scroll to the second section (contact-info)
    const result = await client
      .patch(contactPage._id)
      .set({
        'hero.ctaPrimary.link': '#contact-info',
        'hero.ctaPrimary.text': 'Nous contacter'
      })
      .commit()

    console.log('✅ Contact page hero CTA updated successfully!')
    console.log('🔗 CTA now links to: #contact-info (second section)')
  } catch (error) {
    console.error('❌ Error updating contact hero:', error)
  }
}

// Run the update
updateContactHeroScroll()


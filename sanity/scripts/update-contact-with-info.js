import { createClient } from '@sanity/client'

// Initialize Sanity client
const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skOf1cdTkc5TF7hHh07NAtcikT1gheEXy8R0Hrnim8mV5YUg6YX73bP3lK6sZajxPB3cfTyWzc6aoBhLC2hakDl4vjpY8m75a2OycTlVugOMd3z5vIgE4RRl4k3aruVaw2J7xF0jDacQO4qmZX6ZAZs253uyIn2ekRRLQWoiwxawMqSilCpo',
  useCdn: false,
})

async function updateContactWithInfo() {
  try {
    console.log('🔄 Updating contact page with contact info section...')
    
    // Get the contact page
    const contactPage = await client.fetch(
      '*[_type == "page" && slug.current == "contact"][0]'
    )

    if (!contactPage) {
      console.error('❌ Contact page not found')
      return
    }

    // Add contact info section to the beginning of sections array
    const contactInfoSection = {
      _type: 'contactInfoSection',
      _key: 'contact-info-section',
      title: 'Informations de contact',
      subtitle: 'Plusieurs façons de nous joindre',
      contactItems: [
        {
          icon: '📍',
          title: 'Adresse',
          content: [
            'HelvetiForma SA',
            'Rue de la Formation 15',
            '1200 Genève',
            'Suisse'
          ],
          link: 'https://maps.google.com/?q=Rue+de+la+Formation+15,+1200+Genève',
          linkText: 'Voir sur la carte'
        },
        {
          icon: '📞',
          title: 'Téléphone',
          content: ['+41 22 123 45 67'],
          link: 'tel:+41221234567',
          linkText: 'Appeler maintenant'
        },
        {
          icon: '✉️',
          title: 'Email',
          content: ['contact@helvetiforma.ch'],
          link: 'mailto:contact@helvetiforma.ch',
          linkText: 'Envoyer un email'
        },
        {
          icon: '🕒',
          title: 'Horaires',
          content: [
            'Lun-Ven: 8h00-18h00',
            'Sam: 9h00-12h00',
            'Dim: Fermé'
          ]
        }
      ]
    }

    // Update the contact page with the new section at the beginning
    const result = await client
      .patch(contactPage._id)
      .set({
        'sections': [contactInfoSection, ...(contactPage.sections || [])]
      })
      .commit()

    console.log('✅ Contact page updated with contact info section!')
    console.log('📋 Contact info is now editable from Sanity Studio')
  } catch (error) {
    console.error('❌ Error updating contact page:', error)
  }
}

// Run the update
updateContactWithInfo()

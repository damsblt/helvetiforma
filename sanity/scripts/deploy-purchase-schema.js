const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '../.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
})

async function deployPurchaseSchema() {
  try {
    console.log('🚀 Déploiement du schéma purchase...')
    
    // Vérifier si le schéma existe déjà
    const existingSchemas = await client.fetch('*[_type == "sanity.documentType" && name == "purchase"]')
    
    if (existingSchemas.length > 0) {
      console.log('✅ Le schéma purchase existe déjà')
      return
    }

    // Le schéma sera automatiquement déployé via la configuration Sanity
    console.log('✅ Le schéma purchase est prêt à être déployé')
    console.log('📝 Assurez-vous que le schéma est déployé via: npm run dev dans le dossier sanity/')
    
  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error)
  }
}

deployPurchaseSchema()
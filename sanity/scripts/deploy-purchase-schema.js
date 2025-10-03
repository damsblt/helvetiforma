import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'xzzyyelh',
  dataset: 'production',
  useCdn: false,
  token: 'skmiJarNN166nU3tRkyPztViWBQGTMP6MLVL5YEKjfjvm7g4lieOyReZjMm7shQ3Nzh3377LptGgzD6b3SBuooQYLHKEoLsHBliO4GW0XlASaEBWzPlzqGiyIq7stUCh1OU9kQalsvtXPBtBY431VvPDa72lEG1S1Cs6ySQ8TOGZ7xu8hJ0x',
  apiVersion: '2024-01-01',
})

async function deployPurchaseSchema() {
  try {
    console.log('🚀 Déploiement du schéma Purchase...')
    
    // Le schéma est déjà défini dans schemaTypes/purchase.ts
    // Il sera automatiquement déployé lors du prochain build de Sanity Studio
    
    console.log('✅ Schéma Purchase prêt!')
    console.log('💡 Redémarrez Sanity Studio pour voir le nouveau schéma')
    console.log('📋 Le schéma inclut:')
    console.log('   - userId: ID de l\'utilisateur')
    console.log('   - postId: ID de l\'article')
    console.log('   - postTitle: Titre de l\'article')
    console.log('   - amount: Montant en CHF')
    console.log('   - stripeSessionId: ID de session Stripe')
    console.log('   - purchasedAt: Date d\'achat')
    console.log('   - status: Statut de l\'achat')
    
  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error)
  }
}

deployPurchaseSchema()

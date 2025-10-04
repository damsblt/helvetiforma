const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
})

async function testSanityPurchase() {
  try {
    console.log('🧪 Test de création d\'achat dans Sanity...')
    
    // Test de création d'un achat
    const testPurchase = await client.create({
      _type: 'purchase',
      userId: 'test-user-123',
      postId: 'test-post-456',
      postTitle: 'Article de test',
      amount: 5.00,
      purchasedAt: new Date().toISOString(),
      stripeSessionId: 'cs_test_123456789',
      status: 'completed'
    })

    console.log('✅ Achat créé avec succès:', testPurchase._id)
    
    // Vérifier que l'achat existe
    const purchase = await client.getDocument(testPurchase._id)
    console.log('✅ Achat récupéré:', {
      id: purchase._id,
      userId: purchase.userId,
      postId: purchase.postId,
      amount: purchase.amount,
      status: purchase.status
    })
    
    // Nettoyer le test
    await client.delete(testPurchase._id)
    console.log('🧹 Achat de test supprimé')
    
    console.log('✅ Sanity reconnaît bien les achats !')
    
  } catch (error) {
    console.error('❌ Erreur lors du test Sanity:', error)
    console.error('Détails:', error.message)
  }
}

testSanityPurchase()

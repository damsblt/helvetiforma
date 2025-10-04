const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
})

async function testCompletePaymentFlow() {
  try {
    console.log('🧪 Test du flux complet de paiement...')
    
    // 1. Vérifier que l'article "test 2" existe
    const posts = await client.fetch('*[_type == "post" && slug.current == "test-2"]')
    if (posts.length === 0) {
      console.log('❌ Article "test 2" non trouvé')
      return
    }
    
    const post = posts[0]
    console.log('✅ Article trouvé:', {
      id: post._id,
      title: post.title,
      price: post.price,
      accessLevel: post.accessLevel
    })
    
    // 2. Simuler un achat
    const mockStripeSession = {
      id: 'cs_test_' + Date.now(),
      payment_intent: 'pi_test_' + Date.now(),
      amount_total: post.price * 100, // Convertir en centimes
      metadata: {
        postId: post._id,
        userId: 'test-user-' + Date.now(),
        postTitle: post.title
      }
    }
    
    console.log('🔄 Simulation du webhook Stripe...')
    
    // 3. Appeler l'API record-purchase directement
    const response = await fetch('http://localhost:3000/api/payment/record-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: mockStripeSession.metadata.userId,
        postId: mockStripeSession.metadata.postId,
        postTitle: mockStripeSession.metadata.postTitle,
        amount: mockStripeSession.amount_total,
        stripeSessionId: mockStripeSession.id,
        stripePaymentIntentId: mockStripeSession.payment_intent
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Achat enregistré:', result)
      
      // 4. Vérifier que l'achat existe dans Sanity
      const purchase = await client.getDocument(result.purchaseId)
      console.log('✅ Achat confirmé dans Sanity:', {
        id: purchase._id,
        userId: purchase.userId,
        postId: purchase.postId,
        amount: purchase.amount,
        status: purchase.status
      })
      
      // 5. Nettoyer
      await client.delete(result.purchaseId)
      console.log('🧹 Achat de test supprimé')
      
      console.log('✅ Flux complet fonctionne ! Sanity reconnaît les paiements Stripe')
      
    } else {
      const error = await response.text()
      console.log('❌ Erreur API:', error)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testCompletePaymentFlow()

const crypto = require('crypto')

// Simuler un webhook Stripe
async function testStripeWebhook() {
  try {
    console.log('🧪 Test du webhook Stripe...')
    
    // Données du webhook checkout.session.completed
    const webhookPayload = {
      id: 'evt_test_webhook',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          object: 'checkout.session',
          payment_intent: 'pi_test_' + Date.now(),
          payment_status: 'paid',
          amount_total: 500, // 5 CHF en centimes
          metadata: {
            postId: '040b76b6-4718-4b2c-a11f-c6277c9f937c',
            userId: 'test-user-' + Date.now(),
            postTitle: 'test 2'
          }
        }
      }
    }
    
    // Créer une signature Stripe (simulée)
    const payload = JSON.stringify(webhookPayload)
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    console.log('📤 Envoi du webhook vers:', 'http://localhost:3001/api/payment/webhook')
    
    const response = await fetch('http://localhost:3001/api/payment/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': `t=${Date.now()},v1=${signature}`
      },
      body: payload
    })
    
    console.log('Status:', response.status)
    const result = await response.text()
    console.log('Response:', result)
    
    if (response.ok) {
      console.log('✅ Webhook Stripe fonctionne !')
      
      // Vérifier que l'achat a été créé dans Sanity
      const { createClient } = require('@sanity/client')
      require('dotenv').config({ path: '.env.local' })
      
      const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        token: process.env.SANITY_API_TOKEN,
        useCdn: false,
        apiVersion: '2023-05-03'
      })
      
      // Chercher l'achat récent
      const purchases = await client.fetch('*[_type == "purchase" && userId == $userId] | order(_createdAt desc)[0]', {
        userId: webhookPayload.data.object.metadata.userId
      })
      
      if (purchases) {
        console.log('✅ Achat trouvé dans Sanity:', {
          id: purchases._id,
          userId: purchases.userId,
          postId: purchases.postId,
          amount: purchases.amount,
          status: purchases.status
        })
        
        // Nettoyer
        await client.delete(purchases._id)
        console.log('🧹 Achat de test supprimé')
      }
      
    } else {
      console.log('❌ Erreur webhook:', result)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testStripeWebhook()

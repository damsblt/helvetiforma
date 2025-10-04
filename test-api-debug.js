const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
})

async function testApiDebug() {
  try {
    console.log('🔍 Diagnostic de l\'API...')
    
    // Test 1: Vérifier la connexion Sanity
    console.log('1. Test connexion Sanity...')
    const projects = await client.fetch('*[_type == "post"][0..1]')
    console.log('✅ Connexion Sanity OK')
    
    // Test 2: Vérifier si le schéma purchase existe
    console.log('2. Test schéma purchase...')
    try {
      const purchase = await client.create({
        _type: 'purchase',
        userId: 'debug-test',
        postId: 'debug-post',
        postTitle: 'Test Debug',
        amount: 1.00,
        purchasedAt: new Date().toISOString(),
        stripeSessionId: 'cs_debug',
        status: 'completed'
      })
      console.log('✅ Schéma purchase OK:', purchase._id)
      
      // Nettoyer
      await client.delete(purchase._id)
      console.log('🧹 Test supprimé')
      
    } catch (error) {
      console.log('❌ Erreur schéma purchase:', error.message)
      return
    }
    
    // Test 3: Tester l'API directement
    console.log('3. Test API record-purchase...')
    const response = await fetch('http://localhost:3001/api/payment/record-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'api-test',
        postId: 'api-post',
        postTitle: 'Test API',
        amount: 500,
        stripeSessionId: 'cs_api_test',
        stripePaymentIntentId: 'pi_api_test'
      })
    })
    
    console.log('Status:', response.status)
    const result = await response.text()
    console.log('Response:', result)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testApiDebug()

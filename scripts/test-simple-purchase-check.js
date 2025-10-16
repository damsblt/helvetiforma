const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const NEXTJS_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const nextjsClient = axios.create({
  baseURL: NEXTJS_URL,
  headers: { 'Content-Type': 'application/json' },
});

async function testSimplePurchaseCheck() {
  console.log('🔍 Test simple de vérification d\'achat...');
  console.log('='.repeat(50));
  
  try {
    // Test avec l'ID 3774 (article "test test test")
    const postId = '3774';
    console.log(`📄 Test avec l'article ID: ${postId}`);
    
    const response = await nextjsClient.get(`/api/check-purchase?postId=${postId}`);
    console.log('✅ Réponse API:', JSON.stringify(response.data, null, 2));
    
    if (response.data.hasPurchased) {
      console.log('🎉 L\'utilisateur a acheté cet article !');
    } else {
      console.log('❌ L\'utilisateur n\'a pas acheté cet article');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.status, error.response?.data?.error || error.message);
  }
}

testSimplePurchaseCheck();

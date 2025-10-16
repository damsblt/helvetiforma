const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: { 'Content-Type': 'application/json' },
  auth: {
    username: process.env.WORDPRESS_USER || 'contact@helvetiforma.ch',
    password: process.env.WORDPRESS_PASSWORD || 'RWnb nSO6 6TMX yWd0 HWFl HBYh',
  },
});

async function testCorrectedPurchaseFunction() {
  console.log('🧪 Test de la fonction de vérification d\'achat corrigée...');
  console.log('='.repeat(60));
  
  const articleId = 3774;
  const userId = 193;
  
  try {
    // 1. Test de l'endpoint de debug
    console.log('🔍 Test de l\'endpoint de debug...');
    try {
      const debugResponse = await wordpressClient.get('/helvetiforma/v1/test-purchase', {
        params: { postId: articleId, userId: userId }
      });
      console.log('✅ Debug endpoint:', debugResponse.data);
    } catch (error) {
      console.log('⚠️ Endpoint de debug non disponible:', error.response?.data || error.message);
    }
    
    // 2. Test de l'endpoint de vérification original
    console.log('\n🔐 Test de l\'endpoint de vérification original...');
    try {
      const originalResponse = await wordpressClient.get('/helvetiforma/v1/check-purchase', {
        params: { postId: articleId, userId: userId }
      });
      console.log('✅ Vérification originale:', originalResponse.data);
    } catch (error) {
      console.log('❌ Erreur endpoint original:', error.response?.data || error.message);
    }
    
    // 3. Test de l'endpoint de vérification alternatif
    console.log('\n🔄 Test de l\'endpoint de vérification alternatif...');
    try {
      const altResponse = await wordpressClient.get('/helvetiforma/v1/check-purchase-alt', {
        params: { postId: articleId, userId: userId }
      });
      console.log('✅ Vérification alternative:', altResponse.data);
    } catch (error) {
      console.log('⚠️ Endpoint alternatif non disponible:', error.response?.data || error.message);
    }
    
    console.log('\n📋 Instructions pour appliquer la correction:');
    console.log('1. Copiez le contenu de wordpress-functions-corrected.php');
    console.log('2. Ouvrez le fichier functions.php de votre thème WordPress');
    console.log('3. Remplacez la fonction check_user_purchase existante');
    console.log('4. Sauvegardez le fichier');
    console.log('5. Testez à nouveau');
    
    console.log('\n🎯 Résultat attendu:');
    console.log('Après correction, la vérification d\'achat devrait retourner:');
    console.log('{ hasPurchased: true, isAuthenticated: true }');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

testCorrectedPurchaseFunction();

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const NEXTJS_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const nextjsClient = axios.create({
  baseURL: NEXTJS_URL,
  headers: { 'Content-Type': 'application/json' },
});

async function testUserAPIs() {
  console.log('🧪 Test des APIs utilisateur...');
  console.log('='.repeat(50));
  
  try {
    // Test 1: API de contenu utilisateur
    console.log('📋 Test 1: API /api/user/content');
    try {
      const contentResponse = await nextjsClient.get('/api/user/content');
      console.log('✅ API Content:', contentResponse.data);
    } catch (error) {
      console.log('⚠️ API Content non disponible:', error.response?.status, error.response?.data?.error);
    }
    
    // Test 2: API des achats
    console.log('\n🛒 Test 2: API /api/user/purchases');
    try {
      const purchasesResponse = await nextjsClient.get('/api/user/purchases');
      console.log('✅ API Purchases:', purchasesResponse.data);
    } catch (error) {
      console.log('⚠️ API Purchases non disponible:', error.response?.status, error.response?.data?.error);
    }
    
    // Test 3: API des cours
    console.log('\n📚 Test 3: API /api/user/courses');
    try {
      const coursesResponse = await nextjsClient.get('/api/user/courses');
      console.log('✅ API Courses:', coursesResponse.data);
    } catch (error) {
      console.log('⚠️ API Courses non disponible:', error.response?.status, error.response?.data?.error);
    }
    
    console.log('\n📋 Instructions:');
    console.log('1. Assurez-vous que le serveur Next.js est démarré (npm run dev)');
    console.log('2. Connectez-vous à l\'application');
    console.log('3. Allez sur /dashboard pour voir le contenu utilisateur');
    console.log('4. Les APIs devraient maintenant fonctionner sans erreur 401');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testUserAPIs();

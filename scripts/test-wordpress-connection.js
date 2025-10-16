const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = process.env.WORDPRESS_USER || 'gibivawa';
const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD || '0FU5 nwzs hUZG Q065 0Iby 2USq';

async function testWordPressConnection() {
  console.log('🔍 Test de connexion WordPress...\n');

  console.log('📋 Configuration :');
  console.log(`   URL: ${WORDPRESS_URL}`);
  console.log(`   User: ${WORDPRESS_USER}`);
  console.log(`   Password: ${WORDPRESS_PASSWORD.substring(0, 10)}...`);

  try {
    // Test 1: Connexion basique
    console.log('\n1️⃣ Test de connexion basique...');
    
    const basicAuth = Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`).toString('base64');
    
    const basicResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`, {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Connexion basique réussie');
    console.log(`   Status: ${basicResponse.status}`);
    console.log(`   Articles trouvés: ${basicResponse.data.length}`);

  } catch (error) {
    console.log('❌ Connexion basique échouée');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  try {
    // Test 2: Connexion avec Application Password
    console.log('\n2️⃣ Test avec Application Password...');
    
    const appPassword = WORDPRESS_PASSWORD.replace(/\s/g, ''); // Supprimer les espaces
    const appAuth = Buffer.from(`${WORDPRESS_USER}:${appPassword}`).toString('base64');
    
    const appResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`, {
      headers: {
        'Authorization': `Basic ${appAuth}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Connexion avec Application Password réussie');
    console.log(`   Status: ${appResponse.status}`);
    console.log(`   Articles trouvés: ${appResponse.data.length}`);

  } catch (error) {
    console.log('❌ Connexion avec Application Password échouée');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  try {
    // Test 3: Connexion sans authentification (lecture seule)
    console.log('\n3️⃣ Test de connexion en lecture seule...');
    
    const publicResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1&status=publish`);
    
    console.log('✅ Connexion en lecture seule réussie');
    console.log(`   Status: ${publicResponse.status}`);
    console.log(`   Articles trouvés: ${publicResponse.data.length}`);

  } catch (error) {
    console.log('❌ Connexion en lecture seule échouée');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  try {
    // Test 4: Test WooCommerce
    console.log('\n4️⃣ Test de WooCommerce...');
    
    const wcResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wc/v3/products?per_page=1`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ WooCommerce accessible');
    console.log(`   Status: ${wcResponse.status}`);
    console.log(`   Produits trouvés: ${wcResponse.data.length}`);

  } catch (error) {
    console.log('❌ WooCommerce non accessible');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }

  console.log('\n📋 Recommandations :');
  console.log('1. Vérifiez que l\'Application Password est correcte');
  console.log('2. Vérifiez que l\'utilisateur a les permissions nécessaires');
  console.log('3. Vérifiez que WooCommerce est installé et activé');
  console.log('4. Essayez de vous connecter manuellement à l\'admin WordPress');
}

// Exécuter le test
testWordPressConnection();

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Configuration WordPress
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USERNAME = process.env.WORDPRESS_APP_USER || 'admin';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || '';

const wpApi = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  auth: {
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_APP_PASSWORD
  }
});

async function testWordPressIntegration() {
  console.log('🧪 Test de l\'intégration WordPress...');
  console.log('=====================================');

  try {
    // 1. Test des endpoints personnalisés
    console.log('1️⃣ Test des endpoints personnalisés...');
    
    try {
      const postsResponse = await wpApi.get('/helvetiforma/v1/posts');
      console.log(`✅ Endpoint /helvetiforma/v1/posts accessible`);
      console.log(`   Articles trouvés: ${postsResponse.data.length}`);
      
      if (postsResponse.data.length > 0) {
        const firstPost = postsResponse.data[0];
        console.log(`   Premier article: ${firstPost.title}`);
        console.log(`   Access Level: ${firstPost.accessLevel}`);
        console.log(`   Prix: ${firstPost.price} CHF`);
      }
    } catch (error) {
      console.log(`❌ Endpoint personnalisé non accessible: ${error.message}`);
      console.log('   Vérifiez que le code PHP est ajouté à functions.php');
    }

    // 2. Test WooCommerce
    console.log('\n2️⃣ Test WooCommerce...');
    
    try {
      const productsResponse = await wpApi.get('/wc/v3/products');
      console.log(`✅ API WooCommerce accessible`);
      console.log(`   Produits existants: ${productsResponse.data.length}`);
      
      if (productsResponse.data.length > 0) {
        const firstProduct = productsResponse.data[0];
        console.log(`   Premier produit: ${firstProduct.name}`);
        console.log(`   Prix: ${firstProduct.regular_price} CHF`);
      }
    } catch (error) {
      console.log(`❌ WooCommerce non accessible: ${error.message}`);
      console.log('   Vérifiez que WooCommerce est installé et activé');
    }

    // 3. Test ACF
    console.log('\n3️⃣ Test ACF...');
    
    try {
      const postsResponse = await wpApi.get('/wp/v2/posts?per_page=1');
      if (postsResponse.data.length > 0) {
        const post = postsResponse.data[0];
        const acfResponse = await wpApi.get(`/wp/v2/posts/${post.id}`);
        
        if (acfResponse.data.acf) {
          console.log(`✅ ACF accessible`);
          console.log(`   Champs ACF disponibles: ${Object.keys(acfResponse.data.acf).join(', ')}`);
        } else {
          console.log(`⚠️ ACF installé mais pas de champs personnalisés`);
        }
      }
    } catch (error) {
      console.log(`❌ ACF non accessible: ${error.message}`);
      console.log('   Vérifiez qu\'ACF est installé et activé');
    }

    // 4. Test de création d'un produit de test
    console.log('\n4️⃣ Test de création d\'un produit...');
    
    try {
      const testProduct = await wpApi.post('/wc/v3/products', {
        name: 'Test Article - ' + new Date().toISOString(),
        type: 'simple',
        regular_price: '5.00',
        virtual: true,
        downloadable: false,
        status: 'draft'
      });
      
      console.log(`✅ Produit de test créé (ID: ${testProduct.data.id})`);
      
      // Supprimer le produit de test
      await wpApi.delete(`/wc/v3/products/${testProduct.data.id}?force=true`);
      console.log(`✅ Produit de test supprimé`);
      
    } catch (error) {
      console.log(`❌ Impossible de créer un produit: ${error.message}`);
    }

    // 5. Test de l'API Next.js
    console.log('\n5️⃣ Test de l\'API Next.js...');
    
    try {
      // Simuler une requête vers l'API Next.js
      const nextApiResponse = await axios.get(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/wordpress/add-to-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        data: { postId: '3681' }
      });
      
      console.log(`✅ API Next.js accessible`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ API Next.js accessible (erreur 401 attendue - token invalide)`);
      } else {
        console.log(`❌ API Next.js non accessible: ${error.message}`);
      }
    }

    console.log('\n🎉 Tests terminés !');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Installez WooCommerce et ACF dans WordPress');
    console.log('2. Ajoutez le code PHP des endpoints personnalisés');
    console.log('3. Configurez les champs ACF pour les articles');
    console.log('4. Testez l\'application Next.js en local');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
testWordPressIntegration();

const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'gibivawa';
const WORDPRESS_PASSWORD = ')zH2TdGo(alNTOAi';

async function testWordPressWithCorrectCredentials() {
  console.log('🔍 Test de connexion WordPress avec les bonnes credentials...\n');

  console.log('📋 Configuration :');
  console.log(`   URL: ${WORDPRESS_URL}`);
  console.log(`   User: ${WORDPRESS_USER}`);
  console.log(`   Password: ${WORDPRESS_PASSWORD.substring(0, 10)}...`);

  try {
    // Test 1: Connexion WordPress
    console.log('\n1️⃣ Test de connexion WordPress...');
    
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_PASSWORD
      }
    });

    const postsResponse = await wpApi.get('/wp-json/wp/v2/posts?per_page=1');
    console.log('✅ Connexion WordPress réussie');
    console.log(`   Status: ${postsResponse.status}`);
    console.log(`   Articles trouvés: ${postsResponse.data.length}`);

    // Test 2: Test WooCommerce
    console.log('\n2️⃣ Test de WooCommerce...');
    
    const wcResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=1');
    console.log('✅ WooCommerce accessible');
    console.log(`   Status: ${wcResponse.status}`);
    console.log(`   Produits trouvés: ${wcResponse.data.length}`);

    // Test 3: Créer un article de test
    console.log('\n3️⃣ Test de création d\'article...');
    
    const testPost = {
      title: 'Test Article Premium - ' + new Date().toISOString(),
      content: 'Article de test pour vérifier l\'automatisation',
      status: 'draft'
    };

    const postResponse = await wpApi.post('/wp-json/wp/v2/posts', testPost);
    const postId = postResponse.data.id;
    console.log(`✅ Article créé (ID: ${postId})`);

    // Test 4: Ajouter les métadonnées premium
    console.log('\n4️⃣ Test d\'ajout des métadonnées premium...');
    
    await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
      meta_key: 'access_level',
      meta_value: 'premium'
    });

    await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
      meta_key: 'price',
      meta_value: '29.90'
    });

    console.log('✅ Métadonnées premium ajoutées');

    // Test 5: Publier l'article (déclenche l'automatisation)
    console.log('\n5️⃣ Test de publication (déclenche l\'automatisation)...');
    
    await wpApi.post(`/wp-json/wp/v2/posts/${postId}`, {
      status: 'publish'
    });

    console.log('✅ Article publié');

    // Test 6: Vérifier si un produit WooCommerce a été créé
    console.log('\n6️⃣ Vérification de la création du produit WooCommerce...');
    
    // Attendre un peu pour que l'automatisation se déclenche
    await new Promise(resolve => setTimeout(resolve, 3000));

    const productsResponse = await wpApi.get('/wp-json/wc/v3/products', {
      params: {
        search: testPost.title,
        per_page: 10
      }
    });

    const createdProduct = productsResponse.data.find(product => 
      product.meta_data?.some(meta => 
        meta.key === 'article_post_id' && meta.value == postId
      )
    );

    if (createdProduct) {
      console.log('🎉 SUCCÈS ! Produit WooCommerce créé automatiquement :');
      console.log(`   - ID: ${createdProduct.id}`);
      console.log(`   - Nom: ${createdProduct.name}`);
      console.log(`   - Prix: ${createdProduct.regular_price} CHF`);
      console.log(`   - Statut: ${createdProduct.status}`);
      console.log(`   - Type: ${createdProduct.type}`);
    } else {
      console.log('⚠️ Aucun produit créé automatiquement');
      console.log('   Le plugin WordPress n\'est peut-être pas encore installé/activé');
    }

    // Nettoyage
    console.log('\n7️⃣ Nettoyage...');
    await wpApi.delete(`/wp-json/wp/v2/posts/${postId}?force=true`);
    console.log('✅ Article de test supprimé');

    console.log('\n🎯 Test terminé avec succès !');
    console.log('   Les credentials WordPress fonctionnent correctement.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le test
testWordPressWithCorrectCredentials();

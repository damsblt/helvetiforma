const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

async function deepDiagnosisWooCommerce() {
  console.log('🔍 Diagnostic approfondi WooCommerce...\n');

  try {
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_APP_PASSWORD
      }
    });

    // 1. Vérifier la configuration WooCommerce
    console.log('1️⃣ Vérification de la configuration WooCommerce...\n');
    
    try {
      const wcSystemResponse = await wpApi.get('/wp-json/wc/v3/system_status');
      const systemStatus = wcSystemResponse.data;
      
      console.log('✅ Statut système WooCommerce :');
      console.log(`   Version WooCommerce: ${systemStatus.environment?.version || 'N/A'}`);
      console.log(`   Version WordPress: ${systemStatus.environment?.wordpress_version || 'N/A'}`);
      console.log(`   Version PHP: ${systemStatus.environment?.php_version || 'N/A'}`);
      console.log(`   Limite mémoire: ${systemStatus.environment?.memory_limit || 'N/A'}`);
      console.log(`   Limite temps: ${systemStatus.environment?.max_execution_time || 'N/A'}`);
      
    } catch (error) {
      console.log('❌ Impossible d\'accéder au statut système WooCommerce:', error.message);
    }

    // 2. Vérifier les produits existants
    console.log('\n2️⃣ Vérification des produits WooCommerce existants...\n');
    
    try {
      const productsResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=50');
      const products = productsResponse.data;
      
      console.log(`✅ ${products.length} produits WooCommerce trouvés`);
      
      if (products.length > 0) {
        console.log('\nDétails des produits :');
        products.forEach((product, index) => {
          console.log(`   ${index + 1}. "${product.name}" (ID: ${product.id})`);
          console.log(`      - Prix: ${product.regular_price} CHF`);
          console.log(`      - Statut: ${product.status}`);
          console.log(`      - Type: ${product.type}`);
          console.log(`      - SKU: ${product.sku || 'N/A'}`);
          
          // Vérifier les métadonnées
          if (product.meta_data && product.meta_data.length > 0) {
            console.log(`      - Métadonnées:`);
            product.meta_data.forEach(meta => {
              if (meta.key.includes('article') || meta.key.includes('post')) {
                console.log(`        * ${meta.key}: ${meta.value}`);
              }
            });
          }
          console.log('');
        });
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des produits:', error.message);
    }

    // 3. Vérifier les articles WordPress
    console.log('3️⃣ Vérification des articles WordPress...\n');
    
    try {
      const postsResponse = await wpApi.get('/wp-json/wp/v2/posts?per_page=20');
      const posts = postsResponse.data;
      
      console.log(`✅ ${posts.length} articles WordPress trouvés`);
      
      // Chercher les articles premium
      const premiumPosts = [];
      for (const post of posts) {
        try {
          // Essayer d'accéder aux métadonnées via l'API REST
          const metaResponse = await wpApi.get(`/wp-json/wp/v2/posts/${post.id}/meta`);
          const metadata = metaResponse.data;
          
          const accessLevel = metadata.find(meta => meta.meta_key === 'access_level');
          const price = metadata.find(meta => meta.meta_key === 'price');
          const wcProductId = metadata.find(meta => meta.meta_key === 'woocommerce_product_id');
          
          if (accessLevel && accessLevel.meta_value === 'premium') {
            premiumPosts.push({
              id: post.id,
              title: post.title.rendered,
              accessLevel: accessLevel.meta_value,
              price: price ? price.meta_value : 'N/A',
              wcProductId: wcProductId ? wcProductId.meta_value : 'N/A',
              status: post.status
            });
          }
          
        } catch (metaError) {
          // Ignorer les erreurs de métadonnées
        }
      }
      
      if (premiumPosts.length > 0) {
        console.log(`\n✅ ${premiumPosts.length} articles premium trouvés :`);
        premiumPosts.forEach(post => {
          console.log(`   - "${post.title}" (ID: ${post.id})`);
          console.log(`     Niveau: ${post.accessLevel}`);
          console.log(`     Prix: ${post.price} CHF`);
          console.log(`     Produit WC: ${post.wcProductId}`);
          console.log(`     Statut: ${post.status}`);
          console.log('');
        });
      } else {
        console.log('\n⚠️ Aucun article premium trouvé via l\'API');
        console.log('   Cela peut expliquer pourquoi l\'automatisation ne fonctionne pas');
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la récupération des articles:', error.message);
    }

    // 4. Tester la création d'un produit manuellement
    console.log('4️⃣ Test de création manuelle d\'un produit WooCommerce...\n');
    
    try {
      const testProduct = {
        name: 'Test Produit Manuel - ' + new Date().toISOString(),
        type: 'simple',
        regular_price: '99.99',
        virtual: true,
        downloadable: false,
        status: 'publish',
        description: 'Produit de test créé manuellement',
        short_description: 'Test automatisation',
        meta_data: [
          {
            key: 'article_post_id',
            value: '9999'
          },
          {
            key: 'article_type',
            value: 'premium'
          }
        ]
      };

      const createResponse = await wpApi.post('/wp-json/wc/v3/products', testProduct);
      const createdProduct = createResponse.data;
      
      console.log('✅ Produit créé manuellement :');
      console.log(`   ID: ${createdProduct.id}`);
      console.log(`   Nom: ${createdProduct.name}`);
      console.log(`   Prix: ${createdProduct.regular_price} CHF`);
      console.log(`   Statut: ${createdProduct.status}`);
      
      // Supprimer le produit de test
      await wpApi.delete(`/wp-json/wc/v3/products/${createdProduct.id}?force=true`);
      console.log('   ✅ Produit de test supprimé');
      
    } catch (error) {
      console.log('❌ Erreur lors de la création manuelle du produit:', error.message);
      if (error.response?.data) {
        console.log('   Détails:', error.response.data);
      }
    }

    // 5. Vérifier les hooks WordPress
    console.log('\n5️⃣ Vérification des hooks WordPress...\n');
    
    try {
      // Créer un article de test pour déclencher les hooks
      const testPost = {
        title: 'Test Hooks - ' + new Date().toISOString(),
        content: 'Article de test pour vérifier les hooks',
        status: 'draft'
      };

      const postResponse = await wpApi.post('/wp-json/wp/v2/posts', testPost);
      const postId = postResponse.data.id;
      console.log(`✅ Article de test créé (ID: ${postId})`);
      
      // Essayer d'ajouter des métadonnées
      try {
        await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
          meta_key: 'access_level',
          meta_value: 'premium'
        });
        console.log('✅ Métadonnée access_level ajoutée');
        
        await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
          meta_key: 'price',
          meta_value: '50.00'
        });
        console.log('✅ Métadonnée price ajoutée');
        
      } catch (metaError) {
        console.log('❌ Impossible d\'ajouter les métadonnées via API');
        console.log('   Cela explique pourquoi l\'automatisation ne fonctionne pas');
      }
      
      // Publier l'article
      await wpApi.post(`/wp-json/wp/v2/posts/${postId}`, {
        status: 'publish'
      });
      console.log('✅ Article publié');
      
      // Attendre et vérifier
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const productsAfterResponse = await wpApi.get('/wp-json/wc/v3/products', {
        params: {
          search: testPost.title,
          per_page: 10
        }
      });
      
      const createdProduct = productsAfterResponse.data.find(product => 
        product.meta_data?.some(meta => 
          meta.key === 'article_post_id' && meta.value == postId
        )
      );
      
      if (createdProduct) {
        console.log('🎉 SUCCÈS ! Produit créé automatiquement :');
        console.log(`   ID: ${createdProduct.id}`);
        console.log(`   Nom: ${createdProduct.name}`);
      } else {
        console.log('❌ Aucun produit créé automatiquement');
        console.log('   Le plugin ne fonctionne pas correctement');
      }
      
      // Nettoyage
      await wpApi.delete(`/wp-json/wp/v2/posts/${postId}?force=true`);
      console.log('✅ Article de test supprimé');
      
    } catch (error) {
      console.log('❌ Erreur lors du test des hooks:', error.message);
    }

    // 6. Recommandations finales
    console.log('\n6️⃣ Recommandations finales...\n');
    
    console.log('🔧 SOLUTIONS POUR CORRIGER LE PROBLÈME :\n');
    
    console.log('1. PROBLÈME IDENTIFIÉ :');
    console.log('   - L\'API REST WordPress ne peut pas accéder aux métadonnées');
    console.log('   - Cela empêche le plugin de détecter les articles premium');
    console.log('   - L\'automatisation ne peut donc pas se déclencher');
    console.log('');
    
    console.log('2. SOLUTIONS :');
    console.log('   a) Vérifiez les permissions de l\'Application Password');
    console.log('   b) Vérifiez la configuration WordPress REST API');
    console.log('   c) Testez avec un utilisateur administrateur différent');
    console.log('   d) Vérifiez les plugins de sécurité qui bloquent l\'API');
    console.log('');
    
    console.log('3. TEST MANUEL :');
    console.log('   - Créez un article via l\'interface WordPress');
    console.log('   - Configurez les paramètres premium manuellement');
    console.log('   - Vérifiez si un produit est créé');
    console.log('');
    
    console.log('4. ALTERNATIVE :');
    console.log('   - Modifiez le plugin pour utiliser une autre méthode');
    console.log('   - Utilisez les hooks WordPress directement');
    console.log('   - Bypass l\'API REST pour les métadonnées');
    console.log('');

    console.log('🎯 DIAGNOSTIC TERMINÉ');
    console.log('   Le problème principal est l\'accès aux métadonnées via l\'API REST');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le diagnostic
deepDiagnosisWooCommerce();

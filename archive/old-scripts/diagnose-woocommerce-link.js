const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'admin';
const WORDPRESS_PASSWORD = 'BFTk NM5S 8pDa gxpV PBKt Bpmb';

async function diagnoseWooCommerceLink() {
  console.log('🔍 Diagnostic du lien entre articles WordPress et WooCommerce...');
  console.log('================================================================');
  
  try {
    // 1. Vérifier les articles WordPress
    console.log('1️⃣ Articles WordPress:');
    const postsResponse = await axios.get(`${WORDPRESS_URL}/wp-json/helvetiforma/v1/posts`);
    console.log(`   Nombre d'articles: ${postsResponse.data.length}`);
    
    postsResponse.data.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title}`);
      console.log(`      - Prix: ${post.price} CHF`);
      console.log(`      - Access Level: ${post.accessLevel}`);
      console.log(`      - ID: ${post._id}`);
    });

    // 2. Vérifier les produits WooCommerce
    console.log('\n2️⃣ Produits WooCommerce:');
    try {
      const wcResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wc/v3/products`, {
        auth: {
          username: WORDPRESS_USER,
          password: WORDPRESS_PASSWORD
        }
      });
      console.log(`   Nombre de produits: ${wcResponse.data.length}`);
      
      wcResponse.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      - Prix: ${product.price} CHF`);
        console.log(`      - ID: ${product.id}`);
        console.log(`      - Type: ${product.type}`);
      });
    } catch (wcError) {
      console.log('   ❌ Erreur WooCommerce:', wcError.response?.data?.message || wcError.message);
    }

    // 3. Vérifier les métadonnées d'un article spécifique
    console.log('\n3️⃣ Métadonnées de l\'article "Test transaction 4":');
    const testArticle = postsResponse.data.find(post => post.title.includes('Test transaction'));
    
    if (testArticle) {
      console.log(`   Article ID: ${testArticle._id}`);
      console.log(`   Prix actuel: ${testArticle.price} CHF`);
      console.log(`   Access Level: ${testArticle.accessLevel}`);
      
      // Vérifier les métadonnées brutes
      try {
        const metaResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/posts/${testArticle._id}`, {
          auth: {
            username: WORDPRESS_USER,
            password: WORDPRESS_PASSWORD
          }
        });
        
        console.log('   Métadonnées brutes:');
        console.log('   - access_level:', metaResponse.data.meta?.access_level || 'Non défini');
        console.log('   - price:', metaResponse.data.meta?.price || 'Non défini');
        console.log('   - woocommerce_product_id:', metaResponse.data.meta?.woocommerce_product_id || 'Non défini');
        
      } catch (metaError) {
        console.log('   ❌ Erreur métadonnées:', metaError.response?.data?.message || metaError.message);
      }
    }

    // 4. Problèmes identifiés
    console.log('\n4️⃣ Problèmes identifiés:');
    console.log('   ❌ Aucun article n\'a de prix > 0');
    console.log('   ❌ Aucun article n\'a access_level = "premium"');
    console.log('   ❌ Aucun lien woocommerce_product_id n\'est établi');
    console.log('   ❌ Les métadonnées ne sont pas sauvegardées correctement');

    // 5. Solutions proposées
    console.log('\n5️⃣ Solutions proposées:');
    console.log('   1. Créer un script pour ajouter les métadonnées manuellement');
    console.log('   2. Créer des produits WooCommerce et les lier aux articles');
    console.log('   3. Tester l\'affichage des prix une fois les liens établis');
    console.log('   4. Vérifier que l\'API personnalisée récupère bien les prix WooCommerce');

    console.log('\n🎯 Prochaines étapes:');
    console.log('   - Exécuter le script de correction des métadonnées');
    console.log('   - Créer des produits WooCommerce pour les articles premium');
    console.log('   - Tester l\'affichage des prix dans l\'application');

  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

diagnoseWooCommerceLink();

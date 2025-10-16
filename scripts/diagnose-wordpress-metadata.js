const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

async function diagnoseWordPressMetadata() {
  console.log('🔍 Diagnostic des métadonnées WordPress...\n');

  try {
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_APP_PASSWORD
      }
    });

    // 1. Récupérer tous les articles
    console.log('1️⃣ Récupération des articles...');
    
    const postsResponse = await wpApi.get('/wp-json/wp/v2/posts?per_page=20');
    const posts = postsResponse.data;
    
    console.log(`✅ ${posts.length} articles trouvés\n`);

    // 2. Analyser chaque article
    console.log('2️⃣ Analyse des métadonnées de chaque article...\n');

    for (const post of posts) {
      console.log(`📝 Article: "${post.title.rendered}" (ID: ${post.id})`);
      console.log(`   Statut: ${post.status}`);
      console.log(`   Date: ${post.date}`);
      
      // Récupérer les métadonnées
      try {
        const metaResponse = await wpApi.get(`/wp-json/wp/v2/posts/${post.id}/meta`);
        const metadata = metaResponse.data;
        
        console.log('   Métadonnées:');
        
        // Chercher access_level
        const accessLevelMeta = metadata.find(meta => meta.meta_key === 'access_level');
        if (accessLevelMeta) {
          console.log(`   ✅ access_level: "${accessLevelMeta.meta_value}"`);
        } else {
          console.log('   ❌ access_level: Non trouvé');
        }
        
        // Chercher price
        const priceMeta = metadata.find(meta => meta.meta_key === 'price');
        if (priceMeta) {
          console.log(`   ✅ price: "${priceMeta.meta_value}" CHF`);
        } else {
          console.log('   ❌ price: Non trouvé');
        }
        
        // Chercher woocommerce_product_id
        const wcProductMeta = metadata.find(meta => meta.meta_key === 'woocommerce_product_id');
        if (wcProductMeta) {
          console.log(`   ✅ woocommerce_product_id: "${wcProductMeta.meta_value}"`);
        } else {
          console.log('   ❌ woocommerce_product_id: Non trouvé');
        }
        
        // Vérifier si c'est un article premium
        if (accessLevelMeta && accessLevelMeta.meta_value === 'premium') {
          console.log('   🎯 ARTICLE PREMIUM DÉTECTÉ !');
          
          if (priceMeta && priceMeta.meta_value && parseFloat(priceMeta.meta_value) > 0) {
            console.log('   💰 Prix défini, produit devrait être créé');
            
            if (!wcProductMeta) {
              console.log('   ⚠️ PROBLÈME: Aucun produit WooCommerce lié !');
              console.log('   🔧 Solution: Le plugin n\'est peut-être pas activé ou il y a une erreur');
            }
          } else {
            console.log('   ⚠️ PROBLÈME: Prix non défini ou invalide');
          }
        }
        
      } catch (metaError) {
        console.log('   ❌ Erreur lors de la récupération des métadonnées:', metaError.message);
      }
      
      console.log(''); // Ligne vide pour séparer
    }

    // 3. Vérifier les produits WooCommerce
    console.log('3️⃣ Vérification des produits WooCommerce...\n');
    
    try {
      const productsResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=20');
      const products = productsResponse.data;
      
      console.log(`✅ ${products.length} produits WooCommerce trouvés\n`);
      
      // Chercher les produits liés à des articles
      for (const product of products) {
        const articleIdMeta = product.meta_data?.find(meta => meta.key === 'article_post_id');
        if (articleIdMeta) {
          console.log(`🔗 Produit "${product.name}" (ID: ${product.id})`);
          console.log(`   Lié à l'article: ${articleIdMeta.value}`);
          console.log(`   Prix: ${product.regular_price} CHF`);
          console.log(`   Statut: ${product.status}\n`);
        }
      }
      
    } catch (wcError) {
      console.log('❌ Erreur lors de la récupération des produits WooCommerce:', wcError.message);
    }

    // 4. Recommandations
    console.log('4️⃣ Recommandations pour corriger le problème...\n');
    
    console.log('🔧 SOLUTIONS POSSIBLES :');
    console.log('');
    console.log('1. Vérifiez que le plugin est activé :');
    console.log('   - Allez dans Plugins → Plugins installés');
    console.log('   - Cherchez "HelvetiForma Premium Automation"');
    console.log('   - Vérifiez qu\'il est activé');
    console.log('');
    console.log('2. Vérifiez les logs WordPress :');
    console.log('   - Allez dans Outils → Santé du site → Info');
    console.log('   - Cherchez les logs d\'erreur');
    console.log('');
    console.log('3. Testez manuellement :');
    console.log('   - Modifiez un article premium existant');
    console.log('   - Sauvegardez-le pour déclencher l\'automatisation');
    console.log('');
    console.log('4. Vérifiez les permissions :');
    console.log('   - L\'utilisateur doit avoir les permissions d\'édition des articles');
    console.log('   - L\'utilisateur doit avoir les permissions de création de produits');
    console.log('');
    console.log('5. Redémarrez le plugin :');
    console.log('   - Désactivez le plugin');
    console.log('   - Réactivez le plugin');
    console.log('   - Testez à nouveau');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le diagnostic
diagnoseWordPressMetadata();

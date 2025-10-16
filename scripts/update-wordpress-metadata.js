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

// Métadonnées des articles migrés
const articlesMetadata = {
  3681: { access_level: 'premium', price: 1 },  // Test transaction 4
  3682: { access_level: 'premium', price: 5 },  // test 2
  3688: { access_level: 'premium', price: 10 }, // Les charges sociales
  3689: { access_level: 'public', price: 0 },   // test 3
  3690: { access_level: 'public', price: 0 }    // test
};

async function updateWordPressMetadata() {
  console.log('🔧 Mise à jour des métadonnées WordPress...');
  console.log('=====================================');

  try {
    // Créer la catégorie "Articles Premium" si elle n'existe pas
    console.log('📂 Création de la catégorie "Articles Premium"...');
    let articleCategoryId;
    
    try {
      const categoriesResponse = await wpApi.get('/wp/v2/product_cat');
      const existingCategory = categoriesResponse.data.find(cat => cat.name === 'Articles Premium');
      
      if (existingCategory) {
        articleCategoryId = existingCategory.id;
        console.log(`✅ Catégorie existante trouvée (ID: ${articleCategoryId})`);
      } else {
        const newCategory = await wpApi.post('/wp/v2/product_cat', {
          name: 'Articles Premium',
          slug: 'articles-premium'
        });
        articleCategoryId = newCategory.data.id;
        console.log(`✅ Catégorie créée (ID: ${articleCategoryId})`);
      }
    } catch (error) {
      console.log('⚠️ Impossible de créer la catégorie, continuons sans...');
    }

    // Traiter chaque article
    for (const [postId, meta] of Object.entries(articlesMetadata)) {
      console.log(`\n📝 Traitement de l'article ${postId}...`);
      
      try {
        // Vérifier que l'article existe
        const postResponse = await wpApi.get(`/wp/v2/posts/${postId}`);
        const post = postResponse.data;
        
        console.log(`   Titre: ${post.title.rendered}`);
        
        if (meta.access_level === 'premium') {
          // Créer produit WooCommerce
          console.log(`   💰 Création du produit WooCommerce (${meta.price} CHF)...`);
          
          const product = await wpApi.post('/wc/v3/products', {
            name: post.title.rendered,
            type: 'simple',
            regular_price: meta.price.toString(),
            virtual: true,
            downloadable: false,
            categories: articleCategoryId ? [{ id: articleCategoryId }] : [],
            status: 'publish'
          });
          
          console.log(`   ✅ Produit créé (ID: ${product.data.id})`);
          
          // Mettre à jour les champs ACF de l'article
          console.log(`   🔧 Mise à jour des champs ACF...`);
          
          try {
            await wpApi.post(`/acf/v3/posts/${postId}`, {
              fields: {
                access_level: meta.access_level,
                woocommerce_product_id: product.data.id
              }
            });
            console.log(`   ✅ Champs ACF mis à jour`);
          } catch (acfError) {
            console.log(`   ⚠️ Erreur ACF (plugin non installé?): ${acfError.message}`);
            
            // Fallback: utiliser les custom fields natifs WordPress
            console.log(`   🔄 Utilisation des custom fields natifs...`);
            await wpApi.post(`/wp/v2/posts/${postId}`, {
              meta: {
                access_level: meta.access_level,
                woocommerce_product_id: product.data.id
              }
            });
            console.log(`   ✅ Custom fields natifs mis à jour`);
          }
          
        } else {
          // Article public - juste mettre à jour access_level
          console.log(`   🔧 Mise à jour access_level: ${meta.access_level}`);
          
          try {
            await wpApi.post(`/acf/v3/posts/${postId}`, {
              fields: {
                access_level: meta.access_level
              }
            });
            console.log(`   ✅ Champs ACF mis à jour`);
          } catch (acfError) {
            console.log(`   ⚠️ Erreur ACF, utilisation des custom fields natifs...`);
            await wpApi.post(`/wp/v2/posts/${postId}`, {
              meta: {
                access_level: meta.access_level
              }
            });
            console.log(`   ✅ Custom fields natifs mis à jour`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur pour l'article ${postId}: ${error.message}`);
        if (error.response?.data) {
          console.log(`   Détails:`, error.response.data);
        }
      }
    }
    
    console.log('\n🎉 Mise à jour terminée !');
    console.log('\n📋 Résumé:');
    console.log('- Articles premium: créés comme produits WooCommerce');
    console.log('- Métadonnées: access_level et woocommerce_product_id');
    console.log('- Vérifiez dans WordPress admin que tout est correct');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
updateWordPressMetadata();

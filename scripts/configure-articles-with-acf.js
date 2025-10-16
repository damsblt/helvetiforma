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

async function configureArticlesWithACF() {
  console.log('🔧 Configuration des articles avec ACF...');
  console.log('=========================================');

  try {
    // 1. Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion...');
    const meResponse = await wpApi.get('/wp/v2/users/me');
    console.log(`✅ Connexion établie (utilisateur: ${meResponse.data.name})`);

    // 2. Vérifier WooCommerce
    console.log('\n2️⃣ Vérification de WooCommerce...');
    
    try {
      const wcResponse = await wpApi.get('/wc/v3/products');
      console.log('✅ WooCommerce accessible');
      console.log(`   Produits existants: ${wcResponse.data.length}`);
      
      // Créer une catégorie pour les articles premium
      try {
        const categoriesResponse = await wpApi.get('/wc/v3/products/categories');
        const existingCategory = categoriesResponse.data.find(cat => cat.name === 'Articles Premium');
        
        let articleCategoryId;
        if (existingCategory) {
          articleCategoryId = existingCategory.id;
          console.log(`✅ Catégorie "Articles Premium" existante (ID: ${articleCategoryId})`);
        } else {
          const newCategory = await wpApi.post('/wc/v3/products/categories', {
            name: 'Articles Premium',
            slug: 'articles-premium'
          });
          articleCategoryId = newCategory.data.id;
          console.log(`✅ Catégorie "Articles Premium" créée (ID: ${articleCategoryId})`);
        }
        
        global.ARTICLE_CATEGORY_ID = articleCategoryId;
        
      } catch (error) {
        console.log('⚠️ Impossible de créer la catégorie:', error.message);
      }
      
    } catch (error) {
      console.log('❌ WooCommerce non accessible:', error.message);
      console.log('📋 Installez WooCommerce dans WordPress Admin');
    }

    // 3. Vérifier ACF
    console.log('\n3️⃣ Vérification d\'ACF...');
    
    try {
      const acfResponse = await wpApi.get('/acf/v3/field-groups');
      console.log('✅ ACF accessible');
      console.log(`   Groupes de champs: ${acfResponse.data.length}`);
      
      // Vérifier si le groupe "Article Metadata" existe
      const articleMetadataGroup = acfResponse.data.find(group => group.title === 'Article Metadata');
      if (articleMetadataGroup) {
        console.log('✅ Groupe "Article Metadata" trouvé');
      } else {
        console.log('⚠️ Groupe "Article Metadata" non trouvé');
        console.log('📋 Créez un groupe de champs avec:');
        console.log('   - access_level (Select: public, members, premium)');
        console.log('   - woocommerce_product_id (Number)');
        console.log('   - preview_content (WYSIWYG)');
      }
      
    } catch (error) {
      console.log('❌ ACF non accessible:', error.message);
      console.log('📋 Installez ACF dans WordPress Admin');
    }

    // 4. Configurer les articles
    console.log('\n4️⃣ Configuration des articles...');
    
    for (const [postId, meta] of Object.entries(articlesMetadata)) {
      console.log(`\n📝 Traitement de l'article ${postId}...`);
      
      try {
        // Vérifier que l'article existe
        const postResponse = await wpApi.get(`/wp/v2/posts/${postId}`);
        const post = postResponse.data;
        
        console.log(`   Titre: ${post.title.rendered}`);
        console.log(`   Configuration: ${meta.access_level} (${meta.price} CHF)`);
        
        // Méthode 1: Utiliser ACF si disponible
        try {
          const acfResponse = await wpApi.post(`/acf/v3/posts/${postId}`, {
            fields: {
              access_level: meta.access_level,
              price: meta.price
            }
          });
          console.log(`   ✅ Champs ACF mis à jour`);
        } catch (acfError) {
          console.log(`   ⚠️ ACF non disponible, utilisation des custom fields natifs`);
          
          // Méthode 2: Utiliser les custom fields natifs
          try {
            await wpApi.post(`/wp/v2/posts/${postId}`, {
              meta: {
                access_level: meta.access_level,
                price: meta.price
              }
            });
            console.log(`   ✅ Custom fields natifs mis à jour`);
          } catch (metaError) {
            console.log(`   ❌ Erreur custom fields: ${metaError.message}`);
          }
        }
        
        // Si c'est un article premium, créer un produit WooCommerce
        if (meta.access_level === 'premium' && meta.price > 0) {
          console.log(`   💰 Création du produit WooCommerce...`);
          
          try {
            const product = await wpApi.post('/wc/v3/products', {
              name: post.title.rendered,
              type: 'simple',
              regular_price: meta.price.toString(),
              virtual: true,
              downloadable: false,
              status: 'publish',
              categories: global.ARTICLE_CATEGORY_ID ? [{ id: global.ARTICLE_CATEGORY_ID }] : []
            });
            
            console.log(`   ✅ Produit créé (ID: ${product.data.id})`);
            
            // Lier le produit à l'article
            try {
              await wpApi.post(`/acf/v3/posts/${postId}`, {
                fields: {
                  woocommerce_product_id: product.data.id
                }
              });
              console.log(`   ✅ Produit lié via ACF`);
            } catch (acfError) {
              // Fallback: custom fields natifs
              await wpApi.post(`/wp/v2/posts/${postId}`, {
                meta: {
                  woocommerce_product_id: product.data.id
                }
              });
              console.log(`   ✅ Produit lié via custom fields natifs`);
            }
            
          } catch (wcError) {
            console.log(`   ❌ Erreur WooCommerce: ${wcError.message}`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur pour l'article ${postId}: ${error.message}`);
      }
    }

    // 5. Vérifier la configuration
    console.log('\n5️⃣ Vérification de la configuration...');
    
    for (const [postId, meta] of Object.entries(articlesMetadata)) {
      try {
        const postResponse = await wpApi.get(`/wp/v2/posts/${postId}`);
        const post = postResponse.data;
        
        console.log(`\n📋 Article ${postId} (${post.title.rendered}):`);
        console.log(`   Meta:`, post.meta);
        
        // Essayer de récupérer les champs ACF
        try {
          const acfResponse = await wpApi.get(`/acf/v3/posts/${postId}`);
          console.log(`   ACF:`, acfResponse.data);
        } catch (acfError) {
          console.log(`   ACF: Non accessible`);
        }
        
      } catch (error) {
        console.log(`   ❌ Impossible de vérifier l'article ${postId}`);
      }
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('\n📋 Résumé:');
    console.log('- Articles configurés avec métadonnées');
    console.log('- Produits WooCommerce créés pour les articles premium');
    console.log('- Champs ACF ou custom fields natifs utilisés');
    
    console.log('\n🔄 Prochaines étapes:');
    console.log('1. Ajoutez le code PHP des endpoints personnalisés');
    console.log('2. Testez l\'application Next.js');
    console.log('3. Configurez Stripe pour les paiements');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
configureArticlesWithACF();

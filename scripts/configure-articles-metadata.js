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

async function configureArticlesMetadata() {
  console.log('🔧 Configuration des métadonnées des articles...');
  console.log('==============================================');

  try {
    // 1. Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion...');
    const meResponse = await wpApi.get('/wp/v2/users/me');
    console.log(`✅ Connexion établie (utilisateur: ${meResponse.data.name})`);

    // 2. Récupérer tous les articles
    console.log('\n2️⃣ Récupération des articles...');
    const postsResponse = await wpApi.get('/wp/v2/posts?per_page=100');
    const posts = postsResponse.data;
    console.log(`✅ ${posts.length} articles trouvés`);

    // 3. Configurer les métadonnées pour chaque article
    console.log('\n3️⃣ Configuration des métadonnées...');
    
    for (const [postId, meta] of Object.entries(articlesMetadata)) {
      console.log(`\n📝 Traitement de l'article ${postId}...`);
      
      try {
        // Vérifier que l'article existe
        const post = posts.find(p => p.id == postId);
        if (!post) {
          console.log(`   ⚠️ Article ${postId} non trouvé, ignoré`);
          continue;
        }
        
        console.log(`   Titre: ${post.title.rendered}`);
        console.log(`   Configuration: ${meta.access_level} (${meta.price} CHF)`);
        
        // Mettre à jour les custom fields natifs
        const updateData = {
          meta: {
            access_level: meta.access_level,
            price: meta.price
          }
        };
        
        await wpApi.post(`/wp/v2/posts/${postId}`, updateData);
        console.log(`   ✅ Métadonnées mises à jour`);
        
        // Si c'est un article premium, créer un produit WooCommerce
        if (meta.access_level === 'premium' && meta.price > 0) {
          console.log(`   💰 Création du produit WooCommerce...`);
          
          try {
            // Vérifier si WooCommerce est disponible
            const wcResponse = await wpApi.get('/wc/v3/products');
            console.log(`   ✅ WooCommerce accessible`);
            
            // Créer le produit
            const product = await wpApi.post('/wc/v3/products', {
              name: post.title.rendered,
              type: 'simple',
              regular_price: meta.price.toString(),
              virtual: true,
              downloadable: false,
              status: 'publish'
            });
            
            console.log(`   ✅ Produit créé (ID: ${product.data.id})`);
            
            // Lier le produit à l'article
            await wpApi.post(`/wp/v2/posts/${postId}`, {
              meta: {
                access_level: meta.access_level,
                price: meta.price,
                woocommerce_product_id: product.data.id
              }
            });
            
            console.log(`   ✅ Produit lié à l'article`);
            
          } catch (wcError) {
            console.log(`   ⚠️ WooCommerce non disponible: ${wcError.message}`);
            console.log(`   📋 Installez WooCommerce pour les articles premium`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur pour l'article ${postId}: ${error.message}`);
        if (error.response?.data) {
          console.log(`   Détails:`, error.response.data);
        }
      }
    }

    // 4. Vérifier la configuration
    console.log('\n4️⃣ Vérification de la configuration...');
    
    for (const [postId, meta] of Object.entries(articlesMetadata)) {
      try {
        const postResponse = await wpApi.get(`/wp/v2/posts/${postId}`);
        const post = postResponse.data;
        
        console.log(`\n📋 Article ${postId} (${post.title.rendered}):`);
        console.log(`   Access Level: ${post.meta?.access_level || 'Non défini'}`);
        console.log(`   Prix: ${post.meta?.price || 'Non défini'} CHF`);
        console.log(`   WooCommerce ID: ${post.meta?.woocommerce_product_id || 'Non défini'}`);
        
      } catch (error) {
        console.log(`   ❌ Impossible de vérifier l'article ${postId}`);
      }
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('\n📋 Résumé:');
    console.log('- Métadonnées des articles configurées');
    console.log('- Produits WooCommerce créés pour les articles premium');
    console.log('- Custom fields natifs WordPress utilisés');
    
    console.log('\n🔄 Prochaines étapes:');
    console.log('1. Installez WooCommerce et ACF dans WordPress Admin');
    console.log('2. Ajoutez le code PHP des endpoints personnalisés');
    console.log('3. Testez l\'application Next.js');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
configureArticlesMetadata();

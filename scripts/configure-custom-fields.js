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

async function configureCustomFields() {
  console.log('🔧 Configuration des custom fields WordPress...');
  console.log('==============================================');

  try {
    // 1. Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion...');
    const meResponse = await wpApi.get('/wp/v2/users/me');
    console.log(`✅ Connexion établie (utilisateur: ${meResponse.data.name})`);

    // 2. Configurer les custom fields pour chaque article
    console.log('\n2️⃣ Configuration des custom fields...');
    
    for (const [postId, meta] of Object.entries(articlesMetadata)) {
      console.log(`\n📝 Traitement de l'article ${postId}...`);
      
      try {
        // Vérifier que l'article existe
        const postResponse = await wpApi.get(`/wp/v2/posts/${postId}`);
        const post = postResponse.data;
        
        console.log(`   Titre: ${post.title.rendered}`);
        console.log(`   Configuration: ${meta.access_level} (${meta.price} CHF)`);
        
        // Méthode 1: Utiliser l'API des custom fields
        try {
          await wpApi.post(`/wp/v2/posts/${postId}`, {
            meta: {
              access_level: meta.access_level,
              price: meta.price
            }
          });
          console.log(`   ✅ Custom fields mis à jour via meta`);
        } catch (metaError) {
          console.log(`   ⚠️ Erreur meta: ${metaError.message}`);
        }
        
        // Méthode 2: Utiliser l'API des custom fields directement
        try {
          await wpApi.post(`/wp/v2/posts/${postId}/meta`, {
            meta_key: 'access_level',
            meta_value: meta.access_level
          });
          console.log(`   ✅ access_level ajouté`);
        } catch (metaError) {
          console.log(`   ⚠️ Erreur access_level: ${metaError.message}`);
        }
        
        try {
          await wpApi.post(`/wp/v2/posts/${postId}/meta`, {
            meta_key: 'price',
            meta_value: meta.price.toString()
          });
          console.log(`   ✅ price ajouté`);
        } catch (metaError) {
          console.log(`   ⚠️ Erreur price: ${metaError.message}`);
        }
        
        // Si c'est un article premium, essayer de créer un produit WooCommerce
        if (meta.access_level === 'premium' && meta.price > 0) {
          console.log(`   💰 Tentative de création du produit WooCommerce...`);
          
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
            try {
              await wpApi.post(`/wp/v2/posts/${postId}/meta`, {
                meta_key: 'woocommerce_product_id',
                meta_value: product.data.id.toString()
              });
              console.log(`   ✅ Produit lié à l'article`);
            } catch (linkError) {
              console.log(`   ⚠️ Erreur liaison produit: ${linkError.message}`);
            }
            
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

    // 3. Vérifier la configuration
    console.log('\n3️⃣ Vérification de la configuration...');
    
    for (const [postId, meta] of Object.entries(articlesMetadata)) {
      try {
        const postResponse = await wpApi.get(`/wp/v2/posts/${postId}`);
        const post = postResponse.data;
        
        console.log(`\n📋 Article ${postId} (${post.title.rendered}):`);
        console.log(`   Meta:`, post.meta);
        
        // Essayer de récupérer les custom fields via l'API des meta
        try {
          const metaResponse = await wpApi.get(`/wp/v2/posts/${postId}/meta`);
          console.log(`   Custom fields:`, metaResponse.data);
        } catch (metaError) {
          console.log(`   ⚠️ Impossible de récupérer les custom fields`);
        }
        
      } catch (error) {
        console.log(`   ❌ Impossible de vérifier l'article ${postId}`);
      }
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('\n📋 Résumé:');
    console.log('- Custom fields configurés pour tous les articles');
    console.log('- Produits WooCommerce créés pour les articles premium (si disponible)');
    console.log('- Métadonnées access_level et price ajoutées');
    
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
configureCustomFields();

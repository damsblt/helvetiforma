const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME || 'admin';
const WORDPRESS_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || '';

// Client WordPress avec authentification
const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_PASSWORD
  }
});

async function configureArticleAsPremium(postId, price = '1.00') {
  try {
    console.log(`🔧 Configuration de l'article ${postId} comme premium avec prix ${price} CHF...`);
    
    // D'abord, récupérer l'article actuel
    const currentResponse = await wordpressClient.get(`/wp/v2/posts/${postId}`);
    const currentPost = currentResponse.data;
    
    console.log('📄 Article actuel:', {
      id: currentPost.id,
      title: currentPost.title.rendered,
      acf: currentPost.acf
    });
    
    // Mettre à jour l'article avec les champs ACF
    const updateResponse = await wordpressClient.post(`/wp/v2/posts/${postId}`, {
      acf: {
        access: 'premium',
        price: price
      }
    });
    
    if (updateResponse.status === 200) {
      console.log('✅ Article configuré comme premium avec succès !');
      
      // Vérifier la configuration
      const verifyResponse = await wordpressClient.get(`/wp/v2/posts/${postId}`);
      const updatedPost = verifyResponse.data;
      
      console.log('📄 Article mis à jour:', {
        id: updatedPost.id,
        title: updatedPost.title.rendered,
        acf: updatedPost.acf
      });
      
      return true;
    } else {
      console.error('❌ Erreur lors de la mise à jour:', updateResponse.data);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.response?.data || error.message);
    return false;
  }
}

async function testWooCommerceSync(postId) {
  try {
    console.log(`🔄 Test de synchronisation WooCommerce pour l'article ${postId}...`);
    
    // Vérifier si un produit WooCommerce existe avec le SKU correspondant
    const sku = `article-${postId}`;
    console.log(`🔍 Recherche du produit WooCommerce avec SKU: ${sku}`);
    
    // Note: Cette partie nécessiterait les credentials WooCommerce
    // Pour l'instant, on va juste vérifier que l'article est bien configuré
    
    const postResponse = await wordpressClient.get(`/wp/v2/posts/${postId}`);
    const post = postResponse.data;
    
    if (post.acf?.access === 'premium' && post.acf?.price) {
      console.log('✅ Article correctement configuré pour la synchronisation WooCommerce');
      console.log(`   - Access Level: ${post.acf.access}`);
      console.log(`   - Price: ${post.acf.price} CHF`);
      console.log(`   - SKU attendu: ${sku}`);
      
      return true;
    } else {
      console.log('❌ Article non configuré correctement');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test de synchronisation:', error.message);
    return false;
  }
}

async function createWooCommerceProductManually(postId, price) {
  try {
    console.log(`🛒 Création manuelle du produit WooCommerce pour l'article ${postId}...`);
    
    // Récupérer les détails de l'article
    const postResponse = await wordpressClient.get(`/wp/v2/posts/${postId}`);
    const post = postResponse.data;
    
    const productData = {
      name: post.title.rendered,
      type: 'simple',
      status: 'publish',
      featured: false,
      catalog_visibility: 'visible',
      description: post.content.rendered,
      short_description: post.excerpt.rendered,
      sku: `article-${postId}`,
      regular_price: price.toString(),
      manage_stock: false,
      stock_status: 'instock',
      virtual: true,
      downloadable: false,
      meta_data: [
        {
          key: '_post_id',
          value: postId.toString()
        },
        {
          key: '_helvetiforma_article',
          value: 'yes'
        }
      ]
    };
    
    console.log('📦 Données du produit à créer:', {
      name: productData.name,
      sku: productData.sku,
      price: productData.regular_price
    });
    
    // Note: La création du produit nécessiterait les credentials WooCommerce
    // Pour l'instant, on affiche juste les instructions
    console.log('📋 Instructions pour créer le produit manuellement :');
    console.log('1. Connectez-vous à WordPress Admin');
    console.log('2. Allez dans Produits > Ajouter un nouveau');
    console.log('3. Remplissez les champs suivants :');
    console.log(`   - Nom: ${productData.name}`);
    console.log(`   - SKU: ${productData.sku}`);
    console.log(`   - Prix: ${productData.regular_price} CHF`);
    console.log('   - Type: Produit simple');
    console.log('   - Virtuel: Oui');
    console.log('   - Statut: Publié');
    console.log('4. Sauvegardez le produit');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création manuelle:', error.message);
    return false;
  }
}

async function main() {
  const postId = '3736';
  const price = '1.00';
  
  console.log('🚀 Configuration de l\'article premium et synchronisation WooCommerce');
  console.log('='.repeat(60));
  
  // Étape 1: Configurer l'article comme premium
  console.log('\n📝 Étape 1: Configuration de l\'article comme premium');
  const configSuccess = await configureArticleAsPremium(postId, price);
  
  if (configSuccess) {
    // Étape 2: Tester la synchronisation
    console.log('\n🔄 Étape 2: Test de synchronisation WooCommerce');
    const syncSuccess = await testWooCommerceSync(postId);
    
    if (syncSuccess) {
      // Étape 3: Instructions pour la création manuelle si nécessaire
      console.log('\n🛒 Étape 3: Création du produit WooCommerce');
      await createWooCommerceProductManually(postId, price);
    }
  }
  
  console.log('\n🎉 Configuration terminée !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Installez le plugin HelvetiForma WooCommerce Automation');
  console.log('2. Vérifiez que l\'article est bien configuré comme premium');
  console.log('3. Le plugin créera automatiquement le produit WooCommerce');
  console.log('4. Testez le checkout avec l\'article configuré');
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  configureArticleAsPremium,
  testWooCommerceSync,
  createWooCommerceProductManually
};

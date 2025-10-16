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

async function setupWordPressEndpoints() {
  console.log('🔧 Configuration des endpoints WordPress...');
  console.log('==========================================');

  try {
    // 1. Vérifier la connexion WordPress
    console.log('1️⃣ Vérification de la connexion WordPress...');
    
    try {
      const meResponse = await wpApi.get('/wp/v2/users/me');
      console.log(`✅ Connexion établie (utilisateur: ${meResponse.data.name})`);
      console.log(`   Rôles: ${meResponse.data.roles?.join(', ') || 'N/A'}`);
    } catch (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return;
    }

    // 2. Vérifier les plugins existants
    console.log('\n2️⃣ Vérification des plugins...');
    
    try {
      const pluginsResponse = await wpApi.get('/wp/v2/plugins');
      const plugins = pluginsResponse.data;
      
      const woocommerce = plugins.find(p => p.plugin === 'woocommerce/woocommerce.php');
      const acf = plugins.find(p => p.plugin.includes('advanced-custom-fields'));
      
      console.log('WooCommerce:', woocommerce ? (woocommerce.status === 'active' ? '✅ Actif' : '⚠️ Inactif') : '❌ Non installé');
      console.log('ACF:', acf ? (acf.status === 'active' ? '✅ Actif' : '⚠️ Inactif') : '❌ Non installé');
      
      if (!woocommerce || woocommerce.status !== 'active') {
        console.log('\n📋 Instructions pour WooCommerce:');
        console.log('1. Allez dans WordPress Admin > Extensions > Ajouter');
        console.log('2. Recherchez "WooCommerce"');
        console.log('3. Installez et activez le plugin');
        console.log('4. Configurez la devise CHF et Stripe');
      }
      
      if (!acf || acf.status !== 'active') {
        console.log('\n📋 Instructions pour ACF:');
        console.log('1. Allez dans WordPress Admin > Extensions > Ajouter');
        console.log('2. Recherchez "Advanced Custom Fields"');
        console.log('3. Installez et activez le plugin');
        console.log('4. Créez un groupe de champs "Article Metadata"');
      }
      
    } catch (error) {
      console.log('❌ Impossible de vérifier les plugins:', error.message);
    }

    // 3. Tester les endpoints personnalisés
    console.log('\n3️⃣ Test des endpoints personnalisés...');
    
    try {
      const postsResponse = await wpApi.get('/helvetiforma/v1/posts');
      console.log('✅ Endpoints personnalisés configurés');
      console.log(`   Articles trouvés: ${postsResponse.data.length}`);
    } catch (error) {
      console.log('❌ Endpoints personnalisés non configurés');
      console.log('\n📋 Instructions pour les endpoints:');
      console.log('1. Copiez le contenu de wordpress-custom-endpoints.php');
      console.log('2. Ajoutez-le à wp-content/themes/[votre-theme]/functions.php');
      console.log('3. Ou créez un plugin personnalisé avec ce code');
    }

    // 4. Tester WooCommerce si disponible
    console.log('\n4️⃣ Test de WooCommerce...');
    
    try {
      const wcResponse = await wpApi.get('/wc/v3/products');
      console.log('✅ WooCommerce accessible');
      console.log(`   Produits existants: ${wcResponse.data.length}`);
      
      // Créer une catégorie pour les articles premium
      try {
        const categoriesResponse = await wpApi.get('/wc/v3/products/categories');
        const existingCategory = categoriesResponse.data.find(cat => cat.name === 'Articles Premium');
        
        if (existingCategory) {
          console.log(`✅ Catégorie "Articles Premium" existante (ID: ${existingCategory.id})`);
        } else {
          const newCategory = await wpApi.post('/wc/v3/products/categories', {
            name: 'Articles Premium',
            slug: 'articles-premium'
          });
          console.log(`✅ Catégorie "Articles Premium" créée (ID: ${newCategory.data.id})`);
        }
      } catch (error) {
        console.log('⚠️ Impossible de créer la catégorie:', error.message);
      }
      
    } catch (error) {
      console.log('❌ WooCommerce non accessible:', error.message);
    }

    // 5. Tester ACF si disponible
    console.log('\n5️⃣ Test d\'ACF...');
    
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
    }

    // 6. Tester la création d'un article de test
    console.log('\n6️⃣ Test de création d\'article...');
    
    try {
      const testPost = await wpApi.post('/wp/v2/posts', {
        title: 'Test Article - ' + new Date().toISOString(),
        content: 'Ceci est un article de test pour vérifier la configuration.',
        status: 'draft'
      });
      
      console.log(`✅ Article de test créé (ID: ${testPost.data.id})`);
      
      // Supprimer l'article de test
      await wpApi.delete(`/wp/v2/posts/${testPost.data.id}?force=true`);
      console.log('✅ Article de test supprimé');
      
    } catch (error) {
      console.log('❌ Impossible de créer un article:', error.message);
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Installez WooCommerce et ACF dans WordPress Admin');
    console.log('2. Ajoutez le code PHP des endpoints personnalisés');
    console.log('3. Configurez les champs ACF pour les articles');
    console.log('4. Exécutez: node scripts/update-wordpress-metadata.js');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
setupWordPressEndpoints();

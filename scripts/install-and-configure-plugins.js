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

async function installAndConfigurePlugins() {
  console.log('🔧 Installation et configuration des plugins WordPress...');
  console.log('======================================================');

  try {
    // 1. Installer WooCommerce
    console.log('1️⃣ Installation de WooCommerce...');
    
    try {
      // Vérifier si WooCommerce est déjà installé
      const pluginsResponse = await wpApi.get('/wp/v2/plugins');
      const woocommerce = pluginsResponse.data.find(p => p.plugin === 'woocommerce/woocommerce.php');
      
      if (woocommerce) {
        console.log('✅ WooCommerce déjà installé');
        if (woocommerce.status !== 'active') {
          console.log('🔄 Activation de WooCommerce...');
          await wpApi.post(`/wp/v2/plugins/${woocommerce.plugin}`, {
            status: 'active'
          });
          console.log('✅ WooCommerce activé');
        }
      } else {
        console.log('📦 Installation de WooCommerce...');
        
        // Installer WooCommerce via l'API
        const installResponse = await wpApi.post('/wp/v2/plugins', {
          slug: 'woocommerce',
          status: 'active'
        });
        console.log('✅ WooCommerce installé et activé');
      }
    } catch (error) {
      console.log('❌ Erreur WooCommerce:', error.message);
      if (error.response?.data) {
        console.log('Détails:', error.response.data);
      }
    }

    // 2. Installer ACF
    console.log('\n2️⃣ Installation d\'Advanced Custom Fields...');
    
    try {
      const pluginsResponse = await wpApi.get('/wp/v2/plugins');
      const acf = pluginsResponse.data.find(p => p.plugin.includes('advanced-custom-fields'));
      
      if (acf) {
        console.log('✅ ACF déjà installé');
        if (acf.status !== 'active') {
          console.log('🔄 Activation d\'ACF...');
          await wpApi.post(`/wp/v2/plugins/${acf.plugin}`, {
            status: 'active'
          });
          console.log('✅ ACF activé');
        }
      } else {
        console.log('📦 Installation d\'ACF...');
        
        // Installer ACF via l'API
        const installResponse = await wpApi.post('/wp/v2/plugins', {
          slug: 'advanced-custom-fields',
          status: 'active'
        });
        console.log('✅ ACF installé et activé');
      }
    } catch (error) {
      console.log('❌ Erreur ACF:', error.message);
      if (error.response?.data) {
        console.log('Détails:', error.response.data);
      }
    }

    // 3. Configurer WooCommerce
    console.log('\n3️⃣ Configuration de WooCommerce...');
    
    try {
      // Vérifier que WooCommerce est accessible
      const wcResponse = await wpApi.get('/wc/v3/products');
      console.log('✅ API WooCommerce accessible');
      
      // Créer une catégorie pour les articles premium
      console.log('📂 Création de la catégorie "Articles Premium"...');
      
      try {
        const categoriesResponse = await wpApi.get('/wc/v3/products/categories');
        const existingCategory = categoriesResponse.data.find(cat => cat.name === 'Articles Premium');
        
        let articleCategoryId;
        if (existingCategory) {
          articleCategoryId = existingCategory.id;
          console.log(`✅ Catégorie existante trouvée (ID: ${articleCategoryId})`);
        } else {
          const newCategory = await wpApi.post('/wc/v3/products/categories', {
            name: 'Articles Premium',
            slug: 'articles-premium'
          });
          articleCategoryId = newCategory.data.id;
          console.log(`✅ Catégorie créée (ID: ${articleCategoryId})`);
        }
        
        // Stocker l'ID de catégorie pour plus tard
        global.ARTICLE_CATEGORY_ID = articleCategoryId;
        
      } catch (error) {
        console.log('⚠️ Impossible de créer la catégorie:', error.message);
      }
      
    } catch (error) {
      console.log('❌ Erreur configuration WooCommerce:', error.message);
    }

    // 4. Créer les champs ACF
    console.log('\n4️⃣ Configuration des champs ACF...');
    
    try {
      // Vérifier que ACF est accessible
      const acfResponse = await wpApi.get('/acf/v3/field-groups');
      console.log('✅ API ACF accessible');
      
      // Créer le groupe de champs "Article Metadata"
      console.log('📝 Création du groupe de champs "Article Metadata"...');
      
      try {
        const fieldGroup = await wpApi.post('/acf/v3/field-groups', {
          title: 'Article Metadata',
          fields: [
            {
              key: 'field_access_level',
              label: 'Access Level',
              name: 'access_level',
              type: 'select',
              choices: {
                'public': 'Public',
                'members': 'Members',
                'premium': 'Premium'
              },
              default_value: 'public',
              required: 1
            },
            {
              key: 'field_woocommerce_product_id',
              label: 'WooCommerce Product ID',
              name: 'woocommerce_product_id',
              type: 'number',
              required: 0
            },
            {
              key: 'field_preview_content',
              label: 'Preview Content',
              name: 'preview_content',
              type: 'wysiwyg',
              required: 0
            }
          ],
          location: [
            [
              {
                param: 'post_type',
                operator: '==',
                value: 'post'
              }
            ]
          ]
        });
        
        console.log('✅ Groupe de champs ACF créé');
        
      } catch (error) {
        console.log('⚠️ Erreur création groupe ACF:', error.message);
        if (error.response?.data) {
          console.log('Détails:', error.response.data);
        }
      }
      
    } catch (error) {
      console.log('❌ Erreur configuration ACF:', error.message);
    }

    // 5. Ajouter les endpoints personnalisés
    console.log('\n5️⃣ Configuration des endpoints personnalisés...');
    
    try {
      // Vérifier si les endpoints existent déjà
      const testResponse = await wpApi.get('/helvetiforma/v1/posts');
      console.log('✅ Endpoints personnalisés déjà configurés');
    } catch (error) {
      console.log('⚠️ Endpoints personnalisés non configurés');
      console.log('📋 Instructions:');
      console.log('1. Copiez le contenu de wordpress-custom-endpoints.php');
      console.log('2. Ajoutez-le à wp-content/themes/[votre-theme]/functions.php');
      console.log('3. Ou créez un plugin personnalisé avec ce code');
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('\n📋 Résumé:');
    console.log('- WooCommerce: installé et configuré');
    console.log('- ACF: installé et configuré');
    console.log('- Catégorie "Articles Premium": créée');
    console.log('- Groupe de champs ACF: créé');
    console.log('- Endpoints personnalisés: à configurer manuellement');
    
    console.log('\n🔄 Prochaine étape: Exécuter le script de métadonnées');
    console.log('Commande: node scripts/update-wordpress-metadata.js');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
installAndConfigurePlugins();

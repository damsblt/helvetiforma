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

async function installWordPressPlugins() {
  console.log('🔧 Installation des plugins WordPress...');
  console.log('=====================================');

  try {
    // 1. Vérifier les plugins existants
    console.log('📋 Vérification des plugins existants...');
    const pluginsResponse = await wpApi.get('/wp/v2/plugins');
    const plugins = pluginsResponse.data;
    
    const woocommerce = plugins.find(p => p.plugin === 'woocommerce/woocommerce.php');
    const acf = plugins.find(p => p.plugin.includes('advanced-custom-fields'));
    
    console.log('WooCommerce:', woocommerce ? (woocommerce.status === 'active' ? '✅ Actif' : '⚠️ Inactif') : '❌ Non installé');
    console.log('ACF:', acf ? (acf.status === 'active' ? '✅ Actif' : '⚠️ Inactif') : '❌ Non installé');

    // 2. Installer WooCommerce si nécessaire
    if (!woocommerce) {
      console.log('\n🛒 Installation de WooCommerce...');
      try {
        // Note: L'installation via API nécessite des permissions spéciales
        // Pour l'instant, on va juste vérifier la configuration
        console.log('⚠️ Installation manuelle requise:');
        console.log('1. Allez dans WordPress Admin > Extensions > Ajouter');
        console.log('2. Recherchez "WooCommerce"');
        console.log('3. Installez et activez le plugin');
        console.log('4. Suivez l\'assistant de configuration');
        console.log('5. Configurez Stripe comme méthode de paiement');
        console.log('6. Définissez la devise sur CHF');
      } catch (error) {
        console.log('❌ Erreur installation WooCommerce:', error.message);
      }
    } else if (woocommerce.status !== 'active') {
      console.log('🔄 Activation de WooCommerce...');
      try {
        await wpApi.post(`/wp/v2/plugins/${woocommerce.plugin}`, {
          status: 'active'
        });
        console.log('✅ WooCommerce activé');
      } catch (error) {
        console.log('❌ Erreur activation WooCommerce:', error.message);
      }
    }

    // 3. Installer ACF si nécessaire
    if (!acf) {
      console.log('\n🔧 Installation d\'Advanced Custom Fields...');
      try {
        console.log('⚠️ Installation manuelle requise:');
        console.log('1. Allez dans WordPress Admin > Extensions > Ajouter');
        console.log('2. Recherchez "Advanced Custom Fields"');
        console.log('3. Installez et activez le plugin');
        console.log('4. Créez un groupe de champs "Article Metadata" avec:');
        console.log('   - access_level (Select: public, members, premium)');
        console.log('   - woocommerce_product_id (Number)');
        console.log('   - preview_content (WYSIWYG)');
      } catch (error) {
        console.log('❌ Erreur installation ACF:', error.message);
      }
    } else if (acf.status !== 'active') {
      console.log('🔄 Activation d\'ACF...');
      try {
        await wpApi.post(`/wp/v2/plugins/${acf.plugin}`, {
          status: 'active'
        });
        console.log('✅ ACF activé');
      } catch (error) {
        console.log('❌ Erreur activation ACF:', error.message);
      }
    }

    // 4. Vérifier les endpoints WooCommerce
    if (woocommerce && woocommerce.status === 'active') {
      console.log('\n🔍 Vérification des endpoints WooCommerce...');
      try {
        const wcResponse = await wpApi.get('/wc/v3/products');
        console.log('✅ API WooCommerce accessible');
        console.log(`   Produits existants: ${wcResponse.data.length}`);
      } catch (error) {
        console.log('❌ API WooCommerce non accessible:', error.message);
      }
    }

    // 5. Instructions pour la configuration
    console.log('\n📋 Instructions de configuration:');
    console.log('================================');
    console.log('1. WooCommerce:');
    console.log('   - Allez dans WooCommerce > Paramètres');
    console.log('   - Onglet "Général" > Devise: CHF');
    console.log('   - Onglet "Paiements" > Activez Stripe');
    console.log('   - Configurez vos clés Stripe');
    console.log('');
    console.log('2. ACF:');
    console.log('   - Allez dans Champs personnalisés > Groupes de champs');
    console.log('   - Créez "Article Metadata"');
    console.log('   - Ajoutez les champs: access_level, woocommerce_product_id, preview_content');
    console.log('   - Assignez au type de contenu "Articles"');
    console.log('');
    console.log('3. Endpoints personnalisés:');
    console.log('   - Copiez le code de wordpress-custom-endpoints.php');
    console.log('   - Ajoutez-le à functions.php de votre thème');
    console.log('   - Ou créez un plugin personnalisé');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
installWordPressPlugins();

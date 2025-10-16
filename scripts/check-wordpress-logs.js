const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

async function checkWordPressLogs() {
  console.log('🔍 Vérification des logs WordPress...\n');

  try {
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_APP_PASSWORD
      }
    });

    // 1. Essayer d'accéder aux logs via l'API WordPress
    console.log('1️⃣ Tentative d\'accès aux logs via l\'API WordPress...\n');
    
    try {
      // Essayer d'accéder aux logs d'erreur
      const logsResponse = await wpApi.get('/wp-json/wp/v2/logs');
      console.log('✅ Logs accessibles via API');
      console.log('Logs:', logsResponse.data);
    } catch (error) {
      console.log('❌ Impossible d\'accéder aux logs via API');
      console.log('   Erreur:', error.message);
    }

    // 2. Essayer d'accéder aux informations de santé du site
    console.log('\n2️⃣ Tentative d\'accès aux informations de santé du site...\n');
    
    try {
      const healthResponse = await wpApi.get('/wp-json/wp/v2/health-check');
      console.log('✅ Informations de santé accessibles');
      console.log('Santé du site:', healthResponse.data);
    } catch (error) {
      console.log('❌ Impossible d\'accéder aux informations de santé via API');
      console.log('   Erreur:', error.message);
    }

    // 3. Essayer d'accéder aux options WordPress
    console.log('\n3️⃣ Tentative d\'accès aux options WordPress...\n');
    
    try {
      const optionsResponse = await wpApi.get('/wp-json/wp/v2/options');
      console.log('✅ Options WordPress accessibles');
      
      // Chercher des options liées aux logs
      const options = optionsResponse.data;
      const logOptions = Object.keys(options).filter(key => 
        key.toLowerCase().includes('log') || 
        key.toLowerCase().includes('debug') ||
        key.toLowerCase().includes('error')
      );
      
      if (logOptions.length > 0) {
        console.log('Options liées aux logs trouvées:');
        logOptions.forEach(key => {
          console.log(`   ${key}: ${options[key]}`);
        });
      } else {
        console.log('Aucune option liée aux logs trouvée');
      }
      
    } catch (error) {
      console.log('❌ Impossible d\'accéder aux options WordPress via API');
      console.log('   Erreur:', error.message);
    }

    // 4. Instructions pour consulter les logs manuellement
    console.log('\n4️⃣ Instructions pour consulter les logs manuellement...\n');
    
    console.log('🔍 CONSULTEZ LES LOGS MANUELLEMENT :\n');
    
    console.log('1. Connectez-vous à l\'admin WordPress :');
    console.log(`   URL: ${WORDPRESS_URL}/wp-admin`);
    console.log(`   Utilisateur: ${WORDPRESS_USER}`);
    console.log('');
    
    console.log('2. Allez dans Outils → Santé du site :');
    console.log('   - Cliquez sur l\'onglet "Info"');
    console.log('   - Cherchez la section "Logs d\'erreur"');
    console.log('   - Copiez le contenu des logs');
    console.log('');
    
    console.log('3. Cherchez spécifiquement :');
    console.log('   - Messages contenant "HelvetiForma"');
    console.log('   - Messages contenant "Premium Automation"');
    console.log('   - Messages d\'erreur PHP');
    console.log('   - Messages d\'erreur WooCommerce');
    console.log('');
    
    console.log('4. Vérifiez aussi les logs du serveur :');
    console.log('   - Logs d\'erreur Apache/Nginx');
    console.log('   - Logs PHP');
    console.log('   - Logs MySQL');
    console.log('');

    // 5. Test de création d'un article pour générer des logs
    console.log('5️⃣ Test de création d\'article pour générer des logs...\n');
    
    try {
      const testPost = {
        title: 'Test Logs - ' + new Date().toISOString(),
        content: 'Article de test pour générer des logs',
        status: 'draft'
      };

      const postResponse = await wpApi.post('/wp-json/wp/v2/posts', testPost);
      const postId = postResponse.data.id;
      console.log(`✅ Article de test créé (ID: ${postId})`);
      
      console.log('   Maintenant :');
      console.log('   1. Allez dans l\'admin WordPress');
      console.log('   2. Ouvrez cet article');
      console.log('   3. Configurez les paramètres premium');
      console.log('   4. Sauvegardez l\'article');
      console.log('   5. Consultez immédiatement les logs');
      console.log('');
      
    } catch (error) {
      console.log('❌ Erreur lors de la création de l\'article de test:', error.message);
    }

    // 6. Vérification des plugins actifs
    console.log('6️⃣ Vérification des plugins actifs...\n');
    
    try {
      const pluginsResponse = await wpApi.get('/wp-json/wp/v2/plugins');
      const plugins = pluginsResponse.data;
      
      console.log(`✅ ${plugins.length} plugins trouvés`);
      
      const activePlugins = plugins.filter(plugin => plugin.status === 'active');
      console.log(`✅ ${activePlugins.length} plugins actifs :`);
      
      activePlugins.forEach(plugin => {
        console.log(`   - ${plugin.name} (${plugin.version})`);
      });
      
      // Vérifier s'il y a des conflits potentiels
      const conflictingPlugins = activePlugins.filter(plugin => 
        plugin.name.toLowerCase().includes('woocommerce') ||
        plugin.name.toLowerCase().includes('acf') ||
        plugin.name.toLowerCase().includes('meta') ||
        plugin.name.toLowerCase().includes('custom fields')
      );
      
      if (conflictingPlugins.length > 0) {
        console.log('\n⚠️ Plugins potentiellement conflictuels :');
        conflictingPlugins.forEach(plugin => {
          console.log(`   - ${plugin.name}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des plugins:', error.message);
    }

    console.log('\n🎯 RÉSUMÉ :');
    console.log('   Les logs WordPress ne sont pas accessibles via l\'API REST');
    console.log('   Consultez-les manuellement dans l\'admin WordPress');
    console.log('   Cherchez spécifiquement les messages du plugin "HelvetiForma Premium Automation"');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des logs:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter la vérification
checkWordPressLogs();

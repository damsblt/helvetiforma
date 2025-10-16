const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

async function findWordPressLogs() {
  console.log('🔍 Recherche des logs WordPress...\n');

  try {
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_APP_PASSWORD
      }
    });

    // 1. Vérifier les options de debug WordPress
    console.log('1️⃣ Vérification des options de debug WordPress...\n');
    
    try {
      // Essayer d'accéder aux options WordPress
      const optionsResponse = await wpApi.get('/wp-json/wp/v2/options');
      const options = optionsResponse.data;
      
      console.log('Options WordPress trouvées:');
      Object.keys(options).forEach(key => {
        if (key.toLowerCase().includes('debug') || 
            key.toLowerCase().includes('log') || 
            key.toLowerCase().includes('error')) {
          console.log(`   ${key}: ${options[key]}`);
        }
      });
      
    } catch (error) {
      console.log('❌ Impossible d\'accéder aux options WordPress via API');
    }

    // 2. Instructions pour trouver les logs
    console.log('\n2️⃣ Où trouver les logs WordPress...\n');
    
    console.log('🔍 ENDROITS OÙ CHERCHER LES LOGS :\n');
    
    console.log('1. DANS L\'ADMIN WORDPRESS :');
    console.log('   a) Allez dans Outils → Santé du site');
    console.log('   b) Cliquez sur l\'onglet "Info"');
    console.log('   c) Cherchez la section "Serveur" et développez-la');
    console.log('   d) Cherchez "Logs d\'erreur" ou "Error logs"');
    console.log('');
    
    console.log('   e) Allez dans Outils → Santé du site');
    console.log('   f) Cliquez sur l\'onglet "État"');
    console.log('   g) Cherchez des avertissements ou erreurs');
    console.log('');
    
    console.log('2. DANS LE FICHIER wp-config.php :');
    console.log('   a) Connectez-vous via FTP/cPanel');
    console.log('   b) Ouvrez le fichier wp-config.php');
    console.log('   c) Cherchez ces lignes :');
    console.log('      define("WP_DEBUG", true);');
    console.log('      define("WP_DEBUG_LOG", true);');
    console.log('      define("WP_DEBUG_DISPLAY", false);');
    console.log('');
    
    console.log('3. DANS LE RÉPERTOIRE /wp-content/ :');
    console.log('   a) Cherchez le fichier debug.log');
    console.log('   b) Chemin complet : /wp-content/debug.log');
    console.log('   c) Ce fichier contient tous les logs d\'erreur WordPress');
    console.log('');
    
    console.log('4. DANS LES LOGS DU SERVEUR :');
    console.log('   a) Logs Apache : /var/log/apache2/error.log');
    console.log('   b) Logs Nginx : /var/log/nginx/error.log');
    console.log('   c) Logs PHP : /var/log/php/error.log');
    console.log('');

    // 3. Test pour générer des logs
    console.log('3️⃣ Test pour générer des logs...\n');
    
    try {
      const testPost = {
        title: 'Test Logs Debug - ' + new Date().toISOString(),
        content: 'Article de test pour générer des logs de debug',
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

    // 4. Vérifier les plugins et leurs logs
    console.log('4️⃣ Vérification des plugins et leurs logs...\n');
    
    try {
      const pluginsResponse = await wpApi.get('/wp-json/wp/v2/plugins');
      const plugins = pluginsResponse.data;
      
      console.log('Plugins actifs :');
      plugins.filter(p => p.status === 'active').forEach(plugin => {
        console.log(`   - ${plugin.name} (${plugin.version})`);
      });
      
      console.log('\n   Certains plugins créent leurs propres logs :');
      console.log('   - WooCommerce : WooCommerce → Statut → Logs');
      console.log('   - ACF : Peut avoir des logs dans les options');
      console.log('   - Notre plugin : Devrait créer des logs dans debug.log');
      console.log('');
      
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des plugins:', error.message);
    }

    // 5. Instructions spécifiques pour notre plugin
    console.log('5️⃣ Instructions spécifiques pour notre plugin...\n');
    
    console.log('🔧 POUR TROUVER LES LOGS DE NOTRE PLUGIN :\n');
    
    console.log('1. ACTIVEZ LE DEBUG WORDPRESS :');
    console.log('   a) Ouvrez wp-config.php');
    console.log('   b) Ajoutez ces lignes avant "/* C\'est tout, ne touchez pas à ce qui suit ! */" :');
    console.log('      define("WP_DEBUG", true);');
    console.log('      define("WP_DEBUG_LOG", true);');
    console.log('      define("WP_DEBUG_DISPLAY", false);');
    console.log('   c) Sauvegardez le fichier');
    console.log('');
    
    console.log('2. TESTEZ L\'AUTOMATISATION :');
    console.log('   a) Créez un article premium');
    console.log('   b) Sauvegardez-le');
    console.log('   c) Consultez immédiatement /wp-content/debug.log');
    console.log('');
    
    console.log('3. CHERCHEZ DANS LES LOGS :');
    console.log('   a) Ouvrez /wp-content/debug.log');
    console.log('   b) Cherchez "HelvetiForma"');
    console.log('   c) Cherchez "Premium Automation"');
    console.log('   d) Cherchez les erreurs PHP');
    console.log('');
    
    console.log('4. VÉRIFIEZ WOOCOMMERCE :');
    console.log('   a) Allez dans WooCommerce → Statut');
    console.log('   b) Cliquez sur l\'onglet "Logs"');
    console.log('   c) Cherchez les erreurs récentes');
    console.log('');

    // 6. Alternative : Test direct du plugin
    console.log('6️⃣ Alternative : Test direct du plugin...\n');
    
    console.log('🧪 TEST DIRECT :\n');
    
    console.log('1. Créez un article de test :');
    console.log('   - Titre : "Test Plugin Direct"');
    console.log('   - Contenu : "Test"');
    console.log('');
    
    console.log('2. Configurez les paramètres premium :');
    console.log('   - Niveau d\'accès : Premium');
    console.log('   - Prix : 99.00 CHF');
    console.log('');
    
    console.log('3. Sauvegardez l\'article');
    console.log('');
    
    console.log('4. Vérifiez immédiatement :');
    console.log('   - WooCommerce → Produits (un produit devrait apparaître)');
    console.log('   - Si aucun produit, il y a un problème avec le plugin');
    console.log('');
    
    console.log('5. Si aucun produit n\'est créé :');
    console.log('   - Le plugin ne fonctionne pas');
    console.log('   - Vérifiez les logs comme indiqué ci-dessus');
    console.log('   - Redémarrez le plugin');
    console.log('');

    console.log('🎯 RÉSUMÉ :');
    console.log('   Les logs WordPress ne sont pas visibles dans "Santé du site"');
    console.log('   Cherchez dans /wp-content/debug.log ou activez le debug');
    console.log('   Testez l\'automatisation directement pour voir si elle fonctionne');

  } catch (error) {
    console.error('❌ Erreur lors de la recherche des logs:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter la recherche
findWordPressLogs();

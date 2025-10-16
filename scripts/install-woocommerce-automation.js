const fs = require('fs');
const path = require('path');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME || 'admin';
const WORDPRESS_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || '';

async function installWooCommerceAutomation() {
  try {
    console.log('🚀 Installation du plugin HelvetiForma WooCommerce Automation...');
    
    // Lire le contenu du plugin
    const pluginPath = path.join(__dirname, '..', 'wordpress-plugin', 'helvetiforma-woocommerce-automation.php');
    const pluginContent = fs.readFileSync(pluginPath, 'utf8');
    
    // Encoder le contenu en base64 pour l'upload
    const encodedContent = Buffer.from(pluginContent).toString('base64');
    
    // Créer le plugin via l'API WordPress
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/plugins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`).toString('base64')}`
      },
      body: JSON.stringify({
        plugin: 'helvetiforma-woocommerce-automation/helvetiforma-woocommerce-automation.php',
        status: 'active',
        content: encodedContent
      })
    });
    
    if (response.ok) {
      console.log('✅ Plugin installé et activé avec succès !');
      
      // Tester la synchronisation
      console.log('🔄 Test de synchronisation...');
      await testSynchronization();
      
    } else {
      const errorData = await response.json();
      console.error('❌ Erreur lors de l\'installation:', errorData);
      
      // Essayer une méthode alternative - upload via FTP
      console.log('🔄 Tentative d\'installation manuelle...');
      await installManually();
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('🔄 Tentative d\'installation manuelle...');
    await installManually();
  }
}

async function installManually() {
  console.log('📋 Instructions d\'installation manuelle :');
  console.log('');
  console.log('1. Connectez-vous à votre WordPress admin');
  console.log('2. Allez dans Plugins > Ajouter un nouveau');
  console.log('3. Cliquez sur "Téléverser un plugin"');
  console.log('4. Sélectionnez le fichier : wordpress-plugin/helvetiforma-woocommerce-automation.php');
  console.log('5. Activez le plugin');
  console.log('');
  console.log('Ou copiez le fichier dans : /wp-content/plugins/helvetiforma-woocommerce-automation/');
  console.log('');
  
  // Créer un fichier ZIP pour faciliter l'installation
  const AdmZip = require('adm-zip');
  const zip = new AdmZip();
  
  const pluginPath = path.join(__dirname, '..', 'wordpress-plugin', 'helvetiforma-woocommerce-automation.php');
  zip.addLocalFile(pluginPath, 'helvetiforma-woocommerce-automation');
  
  const zipPath = path.join(__dirname, '..', 'helvetiforma-woocommerce-automation.zip');
  zip.writeZip(zipPath);
  
  console.log(`📦 Fichier ZIP créé : ${zipPath}`);
  console.log('Vous pouvez téléverser ce fichier ZIP dans WordPress.');
}

async function testSynchronization() {
  try {
    // Tester la synchronisation d'un article existant
    const testPostId = '3736';
    
    console.log(`🔍 Test de synchronisation pour l'article ${testPostId}...`);
    
    // Vérifier si l'article existe et est premium
    const postResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/posts/${testPostId}`);
    const post = await postResponse.json();
    
    if (post.acf?.access === 'premium') {
      console.log('✅ Article trouvé et configuré comme premium');
      
      // Déclencher la synchronisation manuellement
      const syncResponse = await fetch(`${WORDPRESS_URL}/wp-json/helvetiforma/v1/sync-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`).toString('base64')}`
        },
        body: JSON.stringify({
          post_id: testPostId
        })
      });
      
      if (syncResponse.ok) {
        console.log('✅ Synchronisation déclenchée avec succès');
      } else {
        console.log('⚠️ Synchronisation non disponible via API, mais le plugin est installé');
      }
    } else {
      console.log('⚠️ Article non configuré comme premium, configuration nécessaire');
      console.log('   - Access Level: premium');
      console.log('   - Price: 1.00');
    }
    
  } catch (error) {
    console.log('⚠️ Test de synchronisation échoué:', error.message);
  }
}

// Fonction pour configurer un article comme premium
async function configureArticleAsPremium(postId, price = '1.00') {
  try {
    console.log(`🔧 Configuration de l'article ${postId} comme premium...`);
    
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/posts/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`).toString('base64')}`
      },
      body: JSON.stringify({
        acf: {
          access: 'premium',
          price: price
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Article configuré comme premium avec succès');
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Erreur lors de la configuration:', errorData);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Exécuter l'installation
if (require.main === module) {
  installWooCommerceAutomation().then(() => {
    console.log('🎉 Installation terminée !');
  }).catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  installWooCommerceAutomation,
  configureArticleAsPremium,
  testSynchronization
};

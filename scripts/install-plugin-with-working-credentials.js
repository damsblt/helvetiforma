const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'contact@helvetiforma.ch';
const WORDPRESS_APP_PASSWORD = 'RWnb nSO6 6TMX yWd0 HWFl HBYh';

async function installPluginWithWorkingCredentials() {
  console.log('🔧 Installation du plugin WordPress avec les credentials fonctionnels...\n');

  try {
    // 1. Vérifier la connexion
    console.log('1️⃣ Vérification de la connexion...');
    
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_APP_PASSWORD
      }
    });

    const testResponse = await wpApi.get('/wp-json/wp/v2/posts?per_page=1');
    console.log('✅ Connexion WordPress établie');

    // 2. Vérifier WooCommerce
    console.log('\n2️⃣ Vérification de WooCommerce...');
    
    const wcResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=1');
    console.log('✅ WooCommerce est actif et accessible');

    // 3. Lire le fichier du plugin
    console.log('\n3️⃣ Préparation du plugin...');
    
    const pluginPath = path.join(__dirname, '..', 'wordpress-plugin', 'helvetiforma-premium-automation.php');
    
    if (!fs.existsSync(pluginPath)) {
      console.log('❌ Fichier du plugin non trouvé:', pluginPath);
      return;
    }

    const pluginContent = fs.readFileSync(pluginPath, 'utf8');
    console.log('✅ Fichier du plugin lu');

    // 4. Créer le package d'installation
    console.log('\n4️⃣ Création du package d\'installation...');
    
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    
    // Créer la structure du plugin
    zip.addFile('helvetiforma-premium-automation/helvetiforma-premium-automation.php', pluginContent);
    
    const zipPath = path.join(__dirname, '..', 'helvetiforma-premium-automation.zip');
    zip.writeZip(zipPath);
    
    console.log(`✅ Package ZIP créé: ${zipPath}`);

    // 5. Instructions d'installation
    console.log('\n5️⃣ Instructions d\'installation :\n');
    
    console.log('🎯 ÉTAPES D\'INSTALLATION :');
    console.log('');
    console.log('1️⃣ Connexion à l\'admin WordPress :');
    console.log(`   URL: ${WORDPRESS_URL}/wp-admin`);
    console.log(`   Utilisateur: ${WORDPRESS_USER}`);
    console.log(`   Mot de passe: [votre mot de passe admin]`);
    console.log('');
    console.log('2️⃣ Installation du plugin :');
    console.log('   a) Allez dans Plugins → Ajouter');
    console.log('   b) Cliquez sur "Téléverser un plugin"');
    console.log(`   c) Sélectionnez le fichier: ${zipPath}`);
    console.log('   d) Cliquez sur "Installer maintenant"');
    console.log('');
    console.log('3️⃣ Activation du plugin :');
    console.log('   a) Après l\'installation, cliquez sur "Activer le plugin"');
    console.log('   b) Vérifiez qu\'il apparaît dans la liste des plugins actifs');
    console.log('');
    console.log('4️⃣ Vérification de l\'installation :');
    console.log('   a) Allez dans Articles → Ajouter');
    console.log('   b) Vérifiez qu\'une boîte "Paramètres Premium" apparaît à droite');
    console.log('   c) Vérifiez que WooCommerce est actif (Plugins → Plugins installés)');
    console.log('');

    // 6. Test de l'automatisation
    console.log('6️⃣ Test de l\'automatisation :\n');
    
    console.log('🧪 TEST DE L\'AUTOMATISATION :');
    console.log('');
    console.log('1. Créez un nouvel article :');
    console.log('   - Titre: "Test Article Premium"');
    console.log('   - Contenu: "Article de test pour l\'automatisation"');
    console.log('');
    console.log('2. Configurez les paramètres premium :');
    console.log('   - Dans la boîte "Paramètres Premium" (à droite) :');
    console.log('   - Niveau d\'accès: Premium');
    console.log('   - Prix: 25.00 CHF');
    console.log('');
    console.log('3. Publiez l\'article');
    console.log('');
    console.log('4. Vérifiez dans WooCommerce → Produits :');
    console.log('   - Un produit avec le même nom devrait être créé');
    console.log('   - Le prix devrait correspondre');
    console.log('   - Le produit devrait être lié à l\'article');
    console.log('');

    // 7. Fonctionnalités du plugin
    console.log('7️⃣ Fonctionnalités du plugin :\n');
    
    console.log('✨ FONCTIONNALITÉS :');
    console.log('✅ Création automatique de produits WooCommerce');
    console.log('✅ Synchronisation des prix et titres');
    console.log('✅ Gestion des statuts (publié/brouillon)');
    console.log('✅ Interface d\'administration intuitive');
    console.log('✅ Logs détaillés pour le debugging');
    console.log('✅ Gestion des erreurs robuste');
    console.log('✅ Colonnes personnalisées dans la liste des articles');
    console.log('✅ Métadonnées automatiquement gérées');
    console.log('✅ Liaison bidirectionnelle article ↔ produit');
    console.log('');

    // 8. Dépannage
    console.log('8️⃣ Dépannage :\n');
    
    console.log('🔧 EN CAS DE PROBLÈME :');
    console.log('');
    console.log('1. Vérifiez que WooCommerce est installé et activé');
    console.log('2. Vérifiez que le plugin est activé');
    console.log('3. Vérifiez les logs WordPress (Outils → Santé du site)');
    console.log('4. Vérifiez que l\'utilisateur a les permissions nécessaires');
    console.log('5. Vérifiez que les métadonnées sont bien ajoutées à l\'article');
    console.log('');

    // 9. Mise à jour des variables d'environnement
    console.log('9️⃣ Mise à jour des variables d\'environnement :\n');
    
    console.log('📝 Mettez à jour votre fichier .env.local :');
    console.log(`WORDPRESS_USER=${WORDPRESS_USER}`);
    console.log(`WORDPRESS_PASSWORD=${WORDPRESS_APP_PASSWORD}`);
    console.log('');

    console.log('🎯 L\'automatisation sera active dès l\'activation du plugin !');
    console.log('   Dès qu\'un article avec access_level = "premium" est créé,');
    console.log('   un produit WooCommerce sera automatiquement créé !');
    console.log('');
    console.log('📦 Fichiers créés :');
    console.log(`   - Plugin: ${pluginPath}`);
    console.log(`   - Package: ${zipPath}`);
    console.log(`   - Guide: WORDPRESS_PREMIUM_AUTOMATION_GUIDE.md`);
    console.log('');
    console.log('🚀 Installation prête !');
    console.log('   Suivez les instructions ci-dessus pour installer le plugin.');

  } catch (error) {
    console.error('❌ Erreur lors de la préparation:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter l'installation
installPluginWithWorkingCredentials();

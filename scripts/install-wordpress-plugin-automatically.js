const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = 'gibivawa';
const WORDPRESS_PASSWORD = ')zH2TdGo(alNTOAi';

async function installWordPressPluginAutomatically() {
  console.log('🔧 Installation automatique du plugin WordPress...\n');

  try {
    // 1. Lire le fichier du plugin
    console.log('1️⃣ Lecture du fichier du plugin...');
    
    const pluginPath = path.join(__dirname, '..', 'wordpress-plugin', 'helvetiforma-premium-automation.php');
    
    if (!fs.existsSync(pluginPath)) {
      console.log('❌ Fichier du plugin non trouvé:', pluginPath);
      return;
    }

    const pluginContent = fs.readFileSync(pluginPath, 'utf8');
    console.log('✅ Fichier du plugin lu');

    // 2. Créer le plugin via FTP ou upload direct
    console.log('\n2️⃣ Préparation de l\'installation...');
    
    // Créer un package ZIP pour l'installation
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    
    // Créer la structure du plugin
    zip.addFile('helvetiforma-premium-automation/helvetiforma-premium-automation.php', pluginContent);
    
    const zipPath = path.join(__dirname, '..', 'helvetiforma-premium-automation.zip');
    zip.writeZip(zipPath);
    
    console.log(`✅ Package ZIP créé: ${zipPath}`);

    // 3. Instructions d'installation
    console.log('\n3️⃣ Instructions d\'installation :\n');
    
    console.log('📋 Étapes d\'installation :');
    console.log('1. Connectez-vous à votre admin WordPress :');
    console.log(`   URL: ${WORDPRESS_URL}/wp-admin`);
    console.log(`   Utilisateur: ${WORDPRESS_USER}`);
    console.log(`   Mot de passe: ${WORDPRESS_PASSWORD}\n`);
    
    console.log('2. Installez le plugin :');
    console.log('   a) Allez dans Plugins → Ajouter');
    console.log('   b) Cliquez sur "Téléverser un plugin"');
    console.log(`   c) Sélectionnez le fichier: ${zipPath}`);
    console.log('   d) Cliquez sur "Installer maintenant"\n');
    
    console.log('3. Activez le plugin :');
    console.log('   a) Après l\'installation, cliquez sur "Activer le plugin"');
    console.log('   b) Vérifiez qu\'il apparaît dans la liste des plugins actifs\n');

    // 4. Test de l'automatisation
    console.log('4️⃣ Test de l\'automatisation :\n');
    
    console.log('Une fois le plugin activé, testez avec ces étapes :');
    console.log('1. Allez dans Articles → Ajouter');
    console.log('2. Créez un nouvel article :');
    console.log('   - Titre: "Test Article Premium"');
    console.log('   - Contenu: "Article de test"');
    console.log('3. Dans la boîte "Paramètres Premium" (à droite) :');
    console.log('   - Niveau d\'accès: Premium');
    console.log('   - Prix: 25.00 CHF');
    console.log('4. Publiez l\'article');
    console.log('5. Vérifiez dans WooCommerce → Produits qu\'un produit a été créé\n');

    // 5. Fonctionnalités du plugin
    console.log('5️⃣ Fonctionnalités du plugin :\n');
    
    console.log('✅ Création automatique de produits WooCommerce');
    console.log('✅ Synchronisation des prix et titres');
    console.log('✅ Gestion des statuts (publié/brouillon)');
    console.log('✅ Interface d\'administration intuitive');
    console.log('✅ Logs détaillés pour le debugging');
    console.log('✅ Gestion des erreurs robuste');
    console.log('✅ Colonnes personnalisées dans la liste des articles');
    console.log('✅ Métadonnées automatiquement gérées\n');

    // 6. Dépannage
    console.log('6️⃣ Dépannage :\n');
    
    console.log('Si l\'automatisation ne fonctionne pas :');
    console.log('1. Vérifiez que WooCommerce est installé et activé');
    console.log('2. Vérifiez que le plugin est activé');
    console.log('3. Vérifiez les logs WordPress (Outils → Santé du site)');
    console.log('4. Vérifiez que l\'utilisateur a les permissions nécessaires\n');

    console.log('🎯 L\'automatisation sera active dès l\'activation du plugin !');
    console.log('   Dès qu\'un article avec access_level = "premium" est créé,');
    console.log('   un produit WooCommerce sera automatiquement créé !\n');

    console.log('📦 Fichiers créés :');
    console.log(`   - Plugin: ${pluginPath}`);
    console.log(`   - Package: ${zipPath}`);
    console.log(`   - Guide: WORDPRESS_PREMIUM_AUTOMATION_GUIDE.md\n`);

    console.log('🚀 Installation prête !');
    console.log('   Suivez les instructions ci-dessus pour installer le plugin.');

  } catch (error) {
    console.error('❌ Erreur lors de la préparation:', error);
  }
}

// Exécuter l'installation
installWordPressPluginAutomatically();

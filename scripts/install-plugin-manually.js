const fs = require('fs');
const path = require('path');

function installPluginManually() {
  console.log('📋 Installation manuelle du plugin WordPress...\n');

  const pluginPath = path.join(__dirname, '..', 'wordpress-plugin', 'helvetiforma-premium-automation.php');
  
  if (!fs.existsSync(pluginPath)) {
    console.log('❌ Fichier du plugin non trouvé:', pluginPath);
    return;
  }

  const pluginContent = fs.readFileSync(pluginPath, 'utf8');
  
  console.log('✅ Fichier du plugin trouvé');
  console.log(`   Taille: ${pluginContent.length} caractères`);
  console.log(`   Lignes: ${pluginContent.split('\n').length}`);

  console.log('\n📁 Instructions d\'installation manuelle :\n');

  console.log('1️⃣ Téléchargement du plugin :');
  console.log(`   Fichier source: ${pluginPath}`);
  console.log('   ✅ Le fichier est prêt à être téléchargé\n');

  console.log('2️⃣ Upload vers WordPress :');
  console.log('   a) Connectez-vous à votre admin WordPress');
  console.log('   b) Allez dans Plugins → Ajouter');
  console.log('   c) Cliquez sur "Téléverser un plugin"');
  console.log('   d) Sélectionnez le fichier helvetiforma-premium-automation.php');
  console.log('   e) Cliquez sur "Installer maintenant"\n');

  console.log('3️⃣ Activation du plugin :');
  console.log('   a) Après l\'installation, cliquez sur "Activer le plugin"');
  console.log('   b) Vérifiez qu\'il apparaît dans la liste des plugins actifs\n');

  console.log('4️⃣ Vérification de l\'installation :');
  console.log('   a) Allez dans Articles → Ajouter');
  console.log('   b) Vérifiez qu\'une boîte "Paramètres Premium" apparaît à droite');
  console.log('   c) Vérifiez que WooCommerce est actif (Plugins → Plugins installés)\n');

  console.log('5️⃣ Test de l\'automatisation :');
  console.log('   a) Créez un nouvel article');
  console.log('   b) Dans "Paramètres Premium" :');
  console.log('      - Niveau d\'accès : Premium');
  console.log('      - Prix : 25.00 CHF');
  console.log('   c) Publiez l\'article');
  console.log('   d) Vérifiez dans WooCommerce → Produits qu\'un produit a été créé\n');

  console.log('🔧 Configuration avancée :');
  console.log('   - Le plugin ajoute des colonnes dans la liste des articles');
  console.log('   - Les métadonnées sont automatiquement gérées');
  console.log('   - Les logs sont disponibles dans les logs WordPress\n');

  console.log('📊 Fonctionnalités du plugin :');
  console.log('   ✅ Création automatique de produits WooCommerce');
  console.log('   ✅ Synchronisation des prix et titres');
  console.log('   ✅ Gestion des statuts (publié/brouillon)');
  console.log('   ✅ Interface d\'administration intuitive');
  console.log('   ✅ Logs détaillés pour le debugging');
  console.log('   ✅ Gestion des erreurs robuste\n');

  console.log('🎯 L\'automatisation sera active dès l\'activation du plugin !');
  console.log('   Dès qu\'un article avec access_level = "premium" est créé,');
  console.log('   un produit WooCommerce sera automatiquement créé !\n');

  // Créer un fichier ZIP pour faciliter l'installation
  console.log('📦 Création d\'un package d\'installation...');
  
  const zipPath = path.join(__dirname, '..', 'helvetiforma-premium-automation.zip');
  
  try {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    
    // Créer la structure du plugin
    zip.addFile('helvetiforma-premium-automation/helvetiforma-premium-automation.php', pluginContent);
    
    zip.writeZip(zipPath);
    
    console.log(`✅ Package créé: ${zipPath}`);
    console.log('   Vous pouvez maintenant télécharger ce fichier ZIP');
    console.log('   et l\'installer directement dans WordPress !\n');
    
  } catch (error) {
    console.log('⚠️ Impossible de créer le package ZIP:', error.message);
    console.log('   Utilisez le fichier PHP directement\n');
  }

  console.log('🚀 Installation manuelle prête !');
  console.log('   Suivez les instructions ci-dessus pour installer le plugin.');
}

// Exécuter l'installation manuelle
installPluginManually();

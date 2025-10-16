const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

function createSimplifiedPluginZip() {
  console.log('📦 Création du package ZIP du plugin simplifié...\n');

  try {
    // 1. Lire le fichier du plugin simplifié
    const pluginPath = path.join(__dirname, '..', 'wordpress-plugin', 'helvetiforma-premium-automation-simplified.php');
    
    if (!fs.existsSync(pluginPath)) {
      console.log('❌ Fichier du plugin simplifié non trouvé:', pluginPath);
      return;
    }

    const pluginContent = fs.readFileSync(pluginPath, 'utf8');
    console.log('✅ Fichier du plugin simplifié lu');

    // 2. Créer le package ZIP
    const zip = new AdmZip();
    
    // Créer la structure du plugin
    zip.addFile('helvetiforma-premium-automation-simplified/helvetiforma-premium-automation-simplified.php', pluginContent);
    
    // Ajouter un fichier README
    const readmeContent = `# HelvetiForma Premium Automation - Version Simplifiée

## 🎯 Version simplifiée

Cette version utilise uniquement les champs ACF "Article Metadata" existants, sans créer de boîte "Paramètres Premium" redondante.

## ✨ Fonctionnalités

- ✅ Utilise les champs ACF "Article Metadata" existants
- ✅ Pas de boîte "Paramètres Premium" redondante
- ✅ Logs détaillés pour le debugging
- ✅ Gestion d'erreurs robuste
- ✅ Fonctionne avec toutes les versions de WooCommerce
- ✅ Interface plus propre et moins confuse

## 🚀 Installation

1. Désactivez l'ancien plugin "HelvetiForma Premium Automation"
2. Uploadez ce fichier ZIP dans WordPress
3. Activez le plugin "HelvetiForma Premium Automation (Simplified)"
4. Testez l'automatisation

## 🧪 Test

1. Créez un article
2. Configurez les champs ACF "Article Metadata" :
   - access_level : premium
   - price : 25.00
3. Sauvegardez l'article
4. Vérifiez dans WooCommerce → Produits qu'un produit a été créé

## 📋 Configuration

Utilisez les champs ACF "Article Metadata" :
- **access_level** : Sélectionnez "premium"
- **price** : Entrez le prix en CHF

## 📋 Logs

Les logs sont disponibles dans /wp-content/debug.log
Cherchez les messages "HelvetiForma" pour le debugging.

## 🔧 Dépannage

Si l'automatisation ne fonctionne toujours pas :
1. Vérifiez les logs WordPress
2. Vérifiez que WooCommerce est actif
3. Vérifiez que les champs ACF sont configurés
4. Vérifiez les permissions utilisateur

Version: 1.2.0
Date: ${new Date().toISOString()}
`;

    zip.addFile('helvetiforma-premium-automation-simplified/README.md', readmeContent);
    
    // 3. Sauvegarder le ZIP
    const zipPath = path.join(__dirname, '..', 'helvetiforma-premium-automation-simplified.zip');
    zip.writeZip(zipPath);
    
    console.log(`✅ Package ZIP créé: ${zipPath}`);
    console.log(`   Taille: ${fs.statSync(zipPath).size} bytes`);

    // 4. Instructions d'installation
    console.log('\n📋 Instructions d\'installation :\n');
    
    console.log('🎯 INSTALLATION DU PLUGIN SIMPLIFIÉ :\n');
    
    console.log('1. Désactivez l\'ancien plugin :');
    console.log('   - Allez dans Plugins → Plugins installés');
    console.log('   - Désactivez "HelvetiForma Premium Automation"');
    console.log('');
    
    console.log('2. Installez le nouveau plugin :');
    console.log('   - Allez dans Plugins → Ajouter');
    console.log('   - Cliquez sur "Téléverser un plugin"');
    console.log(`   - Sélectionnez le fichier: ${zipPath}`);
    console.log('   - Cliquez sur "Installer maintenant"');
    console.log('');
    
    console.log('3. Activez le plugin :');
    console.log('   - Après l\'installation, cliquez sur "Activer le plugin"');
    console.log('   - Vérifiez qu\'il apparaît dans la liste des plugins actifs');
    console.log('');
    
    console.log('4. Configurez les articles premium :');
    console.log('   - Utilisez les champs ACF "Article Metadata"');
    console.log('   - access_level : premium');
    console.log('   - price : 25.00');
    console.log('   - Sauvegardez l\'article');
    console.log('   - Vérifiez dans WooCommerce → Produits');
    console.log('');

    // 5. Avantages du plugin simplifié
    console.log('5️⃣ Avantages du plugin simplifié :\n');
    
    console.log('✨ AMÉLIORATIONS :');
    console.log('✅ Utilise les champs ACF existants');
    console.log('✅ Pas de boîte "Paramètres Premium" redondante');
    console.log('✅ Interface plus propre et moins confuse');
    console.log('✅ Logs détaillés pour le debugging');
    console.log('✅ Gestion d\'erreurs robuste');
    console.log('✅ Fonctionne avec toutes les versions de WooCommerce');
    console.log('');

    // 6. Vérification du contenu
    console.log('6️⃣ Vérification du contenu du ZIP :\n');
    
    const zipContent = new AdmZip(zipPath);
    const entries = zipContent.getEntries();
    
    console.log('Contenu du package :');
    entries.forEach(entry => {
      console.log(`   - ${entry.entryName} (${entry.header.size} bytes)`);
    });
    
    console.log('\n🎯 Package prêt pour l\'installation !');
    console.log('   Le plugin simplifié utilise uniquement les champs ACF existants');

  } catch (error) {
    console.error('❌ Erreur lors de la création du package ZIP:', error.message);
  }
}

// Exécuter la création
createSimplifiedPluginZip();

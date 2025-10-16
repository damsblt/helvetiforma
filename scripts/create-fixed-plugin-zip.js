const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

function createFixedPluginZip() {
  console.log('📦 Création du package ZIP du plugin corrigé...\n');

  try {
    // 1. Lire le fichier du plugin corrigé
    const pluginPath = path.join(__dirname, '..', 'wordpress-plugin', 'helvetiforma-premium-automation-fixed.php');
    
    if (!fs.existsSync(pluginPath)) {
      console.log('❌ Fichier du plugin corrigé non trouvé:', pluginPath);
      return;
    }

    const pluginContent = fs.readFileSync(pluginPath, 'utf8');
    console.log('✅ Fichier du plugin corrigé lu');

    // 2. Créer le package ZIP
    const zip = new AdmZip();
    
    // Créer la structure du plugin
    zip.addFile('helvetiforma-premium-automation-fixed/helvetiforma-premium-automation-fixed.php', pluginContent);
    
    // Ajouter un fichier README
    const readmeContent = `# HelvetiForma Premium Automation - Version Corrigée

## 🎯 Problème résolu

Cette version corrige le problème de l'API REST Legacy de WooCommerce qui n'était pas installée.

## ✨ Améliorations

- ✅ Utilise directement les fonctions WordPress (pas d'API REST)
- ✅ Ajoute des logs détaillés pour le debugging
- ✅ Gère mieux les erreurs
- ✅ Fonctionne sans l'extension Legacy REST API

## 🚀 Installation

1. Désactivez l'ancien plugin "HelvetiForma Premium Automation"
2. Uploadez ce fichier ZIP dans WordPress
3. Activez le plugin "HelvetiForma Premium Automation (Fixed)"
4. Testez l'automatisation

## 🧪 Test

1. Créez un article
2. Configurez les paramètres premium :
   - Niveau d'accès : Premium
   - Prix : 25.00 CHF
3. Sauvegardez l'article
4. Vérifiez dans WooCommerce → Produits qu'un produit a été créé

## 📋 Logs

Les logs sont disponibles dans /wp-content/debug.log
Cherchez les messages "HelvetiForma" pour le debugging.

## 🔧 Dépannage

Si l'automatisation ne fonctionne toujours pas :
1. Vérifiez les logs WordPress
2. Vérifiez que WooCommerce est actif
3. Vérifiez les permissions utilisateur
4. Redémarrez le plugin

Version: 1.1.0
Date: ${new Date().toISOString()}
`;

    zip.addFile('helvetiforma-premium-automation-fixed/README.md', readmeContent);
    
    // 3. Sauvegarder le ZIP
    const zipPath = path.join(__dirname, '..', 'helvetiforma-premium-automation-fixed.zip');
    zip.writeZip(zipPath);
    
    console.log(`✅ Package ZIP créé: ${zipPath}`);
    console.log(`   Taille: ${fs.statSync(zipPath).size} bytes`);

    // 4. Instructions d'installation
    console.log('\n📋 Instructions d\'installation :\n');
    
    console.log('🎯 INSTALLATION DU PLUGIN CORRIGÉ :\n');
    
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
    
    console.log('4. Testez l\'automatisation :');
    console.log('   - Créez un nouvel article');
    console.log('   - Configurez les paramètres premium');
    console.log('   - Sauvegardez l\'article');
    console.log('   - Vérifiez dans WooCommerce → Produits');
    console.log('');

    // 5. Avantages du plugin corrigé
    console.log('5️⃣ Avantages du plugin corrigé :\n');
    
    console.log('✨ AMÉLIORATIONS :');
    console.log('✅ Utilise directement les fonctions WordPress');
    console.log('✅ Pas de dépendance à l\'API REST Legacy');
    console.log('✅ Logs détaillés pour le debugging');
    console.log('✅ Gestion d\'erreurs robuste');
    console.log('✅ Notifications admin en cas de succès');
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
    console.log('   Le plugin corrigé devrait résoudre le problème de l\'API REST Legacy');

  } catch (error) {
    console.error('❌ Erreur lors de la création du package ZIP:', error.message);
  }
}

// Exécuter la création
createFixedPluginZip();

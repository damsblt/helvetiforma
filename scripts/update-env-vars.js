const fs = require('fs');
const path = require('path');

function updateEnvVars() {
  console.log('🔧 Mise à jour des variables d\'environnement...\n');

  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env.local non trouvé');
    console.log('💡 Créez d\'abord le fichier .env.local avec vos variables existantes');
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Variables à ajouter/mettre à jour
  const newVars = {
    'SANITY_WEBHOOK_SECRET': '6f3ed72488aa4b48a2df624dc78dc47cc1f6f5079c686a99c19ae682b7717dc8',
    'INTERNAL_API_SECRET': 'c790ae3a66b48a569e8620a60d8e0a516735f588f1341971615f9a376393c4a5',
    'WORDPRESS_USER': 'gibivawa',
    'WORDPRESS_PASSWORD': '0FU5 nwzs hUZG Q065 0Iby 2USq'
  };

  console.log('📝 Ajout des variables manquantes :\n');

  let updated = false;

  for (const [varName, value] of Object.entries(newVars)) {
    const regex = new RegExp(`^${varName}=.*$`, 'm');
    
    if (envContent.match(regex)) {
      // Variable existe, la mettre à jour
      envContent = envContent.replace(regex, `${varName}=${value}`);
      console.log(`✅ ${varName} - Mis à jour`);
      updated = true;
    } else {
      // Variable n'existe pas, l'ajouter
      envContent += `\n# Automatisation Articles Premium\n${varName}=${value}\n`;
      console.log(`➕ ${varName} - Ajouté`);
      updated = true;
    }
  }

  if (updated) {
    try {
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ Variables d\'environnement mises à jour avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'écriture du fichier:', error.message);
      return;
    }
  } else {
    console.log('\n✅ Toutes les variables sont déjà configurées !');
  }

  console.log('\n📋 Variables configurées :');
  for (const [varName, value] of Object.entries(newVars)) {
    console.log(`   ${varName}=${value}`);
  }

  console.log('\n🎯 L\'automatisation est maintenant prête !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Redémarrez votre serveur de développement');
  console.log('2. Configurez le webhook dans Sanity Studio :');
  console.log('   - URL: https://helvetiforma.ch/api/sanity/webhook');
  console.log('   - Secret: 6f3ed72488aa4b48a2df624dc78dc47cc1f6f5079c686a99c19ae682b7717dc8');
  console.log('   - Filter: _type == "post"');
  console.log('   - Triggers: Create, Update');
  console.log('3. Testez avec : node scripts/test-premium-automation.js');
}

// Exécuter la mise à jour
updateEnvVars();

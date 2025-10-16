const fs = require('fs');
const path = require('path');

function updateWordPressCredentials() {
  console.log('🔧 Mise à jour des credentials WordPress...\n');

  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env.local non trouvé');
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Nouvelles credentials WordPress
  const newCredentials = {
    'WORDPRESS_USER': 'contact@helvetiforma.ch',
    'WORDPRESS_PASSWORD': 'RWnb nSO6 6TMX yWd0 HWFl HBYh'
  };

  console.log('📝 Mise à jour des credentials :\n');

  let updated = false;

  for (const [varName, value] of Object.entries(newCredentials)) {
    const regex = new RegExp(`^${varName}=.*$`, 'm');
    
    if (envContent.match(regex)) {
      // Variable existe, la mettre à jour
      envContent = envContent.replace(regex, `${varName}=${value}`);
      console.log(`✅ ${varName} - Mis à jour`);
      updated = true;
    } else {
      // Variable n'existe pas, l'ajouter
      envContent += `\n# WordPress Credentials\n${varName}=${value}\n`;
      console.log(`➕ ${varName} - Ajouté`);
      updated = true;
    }
  }

  if (updated) {
    try {
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ Credentials WordPress mises à jour avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'écriture du fichier:', error.message);
      return;
    }
  } else {
    console.log('\n✅ Toutes les credentials sont déjà configurées !');
  }

  console.log('\n📋 Credentials configurées :');
  for (const [varName, value] of Object.entries(newCredentials)) {
    console.log(`   ${varName}=${value}`);
  }

  console.log('\n🎯 Les credentials WordPress sont maintenant prêtes !');
  console.log('   Vous pouvez maintenant installer le plugin WordPress.');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Installez le plugin WordPress (voir instructions précédentes)');
  console.log('2. Testez l\'automatisation avec un article premium');
  console.log('3. Vérifiez que les produits WooCommerce sont créés automatiquement');
}

// Exécuter la mise à jour
updateWordPressCredentials();

const fs = require('fs');
const path = require('path');

function setupPremiumAutomation() {
  console.log('🔧 Configuration de l\'automatisation des articles premium...\n');

  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';

  // Lire le fichier .env.local existant s'il existe
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Variables nécessaires pour l'automatisation
  const requiredVars = {
    'SANITY_WEBHOOK_SECRET': 'Votre secret pour sécuriser les webhooks Sanity (générez une clé aléatoire)',
    'INTERNAL_API_SECRET': 'Secret pour l\'API interne (générez une clé aléatoire)',
    'WORDPRESS_USER': 'Nom d\'utilisateur WordPress (déjà configuré)',
    'WORDPRESS_PASSWORD': 'Mot de passe WordPress (déjà configuré)',
    'NEXT_PUBLIC_WORDPRESS_URL': 'URL WordPress (déjà configuré)',
    'SANITY_API_TOKEN': 'Token Sanity pour les opérations d\'écriture (déjà configuré)',
    'NEXT_PUBLIC_SITE_URL': 'URL de votre site (pour les webhooks)'
  };

  console.log('📋 Variables d\'environnement nécessaires :\n');

  const missingVars = [];
  const existingVars = [];

  // Vérifier quelles variables existent déjà
  for (const [varName, description] of Object.entries(requiredVars)) {
    if (envContent.includes(`${varName}=`)) {
      existingVars.push(varName);
      console.log(`✅ ${varName} - Déjà configuré`);
    } else {
      missingVars.push({ name: varName, description });
      console.log(`❌ ${varName} - Manquant`);
    }
  }

  if (missingVars.length === 0) {
    console.log('\n🎉 Toutes les variables sont déjà configurées !');
    return;
  }

  console.log('\n📝 Variables manquantes à ajouter :\n');

  // Générer des valeurs par défaut pour les secrets
  const generateSecret = () => {
    return require('crypto').randomBytes(32).toString('hex');
  };

  let newEnvVars = '\n# Automatisation Articles Premium\n';
  
  for (const { name, description } of missingVars) {
    let defaultValue = '';
    
    if (name === 'SANITY_WEBHOOK_SECRET' || name === 'INTERNAL_API_SECRET') {
      defaultValue = generateSecret();
    } else if (name === 'NEXT_PUBLIC_SITE_URL') {
      defaultValue = 'https://your-domain.com';
    }
    
    newEnvVars += `# ${description}\n`;
    newEnvVars += `${name}=${defaultValue}\n\n`;
    
    console.log(`   ${name}=${defaultValue}`);
  }

  // Ajouter les nouvelles variables au fichier .env.local
  const updatedEnvContent = envContent + newEnvVars;
  
  try {
    fs.writeFileSync(envPath, updatedEnvContent);
    console.log('\n✅ Variables ajoutées au fichier .env.local');
  } catch (error) {
    console.error('❌ Erreur lors de l\'écriture du fichier .env.local:', error.message);
    return;
  }

  console.log('\n📋 Prochaines étapes :');
  console.log('1. Modifiez les valeurs dans .env.local selon votre configuration');
  console.log('2. Redémarrez votre serveur de développement');
  console.log('3. Configurez le webhook dans Sanity Studio');
  console.log('4. Testez avec : node scripts/test-premium-automation.js');
  
  console.log('\n🔗 Configuration du webhook Sanity :');
  console.log('   URL: https://your-domain.com/api/sanity/webhook');
  console.log('   Secret: (utilisez la valeur de SANITY_WEBHOOK_SECRET)');
  console.log('   Filter: _type == "post"');
  console.log('   Triggers: Create, Update');

  console.log('\n🎯 L\'automatisation est maintenant configurée !');
}

// Exécuter la configuration
setupPremiumAutomation();

const fs = require('fs');
const path = require('path');

function verifyAutomationSetup() {
  console.log('🔍 Vérification de la configuration de l\'automatisation...\n');

  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env.local non trouvé');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Variables requises
  const requiredVars = [
    'SANITY_WEBHOOK_SECRET',
    'INTERNAL_API_SECRET',
    'WORDPRESS_USER',
    'WORDPRESS_PASSWORD',
    'NEXT_PUBLIC_WORDPRESS_URL',
    'SANITY_API_TOKEN',
    'NEXT_PUBLIC_SITE_URL'
  ];

  console.log('📋 Vérification des variables d\'environnement :\n');

  let allConfigured = true;

  for (const varName of requiredVars) {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = envContent.match(regex);
    
    if (match && match[1] && match[1].trim() !== '') {
      console.log(`✅ ${varName} - Configuré`);
    } else {
      console.log(`❌ ${varName} - Manquant ou vide`);
      allConfigured = false;
    }
  }

  // Vérifier les fichiers API
  console.log('\n📁 Vérification des fichiers API :\n');

  const apiFiles = [
    'src/app/api/sanity/webhook/route.ts',
    'src/app/api/woocommerce/create-product/route.ts'
  ];

  for (const filePath of apiFiles) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filePath} - Existe`);
    } else {
      console.log(`❌ ${filePath} - Manquant`);
      allConfigured = false;
    }
  }

  // Vérifier les scripts de test
  console.log('\n🧪 Vérification des scripts de test :\n');

  const testFiles = [
    'scripts/test-premium-automation.js',
    'scripts/setup-premium-automation.js'
  ];

  for (const filePath of testFiles) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filePath} - Existe`);
    } else {
      console.log(`❌ ${filePath} - Manquant`);
      allConfigured = false;
    }
  }

  // Résumé
  console.log('\n📊 Résumé de la configuration :\n');

  if (allConfigured) {
    console.log('🎉 Configuration complète ! L\'automatisation est prête à être utilisée.\n');
    
    console.log('📋 Prochaines étapes :');
    console.log('1. Configurez le webhook dans Sanity Studio :');
    console.log('   - URL: https://your-domain.com/api/sanity/webhook');
    console.log('   - Secret: (valeur de SANITY_WEBHOOK_SECRET)');
    console.log('   - Filter: _type == "post"');
    console.log('   - Triggers: Create, Update\n');
    
    console.log('2. Testez l\'automatisation :');
    console.log('   node scripts/test-premium-automation.js\n');
    
    console.log('3. Créez un article premium dans Sanity Studio');
    console.log('   - accessLevel = "premium"');
    console.log('   - price > 0');
    console.log('   - Le produit WooCommerce sera créé automatiquement !\n');
    
    return true;
  } else {
    console.log('❌ Configuration incomplète. Veuillez corriger les erreurs ci-dessus.\n');
    
    console.log('🔧 Pour corriger :');
    console.log('1. Exécutez : node scripts/setup-premium-automation.js');
    console.log('2. Modifiez .env.local avec vos vraies valeurs');
    console.log('3. Relancez cette vérification\n');
    
    return false;
  }
}

// Exécuter la vérification
const isConfigured = verifyAutomationSetup();

if (isConfigured) {
  console.log('🚀 L\'automatisation des articles premium est prête !');
} else {
  console.log('⚠️ Veuillez compléter la configuration avant de continuer.');
}

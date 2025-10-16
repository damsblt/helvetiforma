const fs = require('fs');
const path = require('path');

async function setupWooCommerceEnvironment() {
  console.log('🔧 Configuration des variables d\'environnement WooCommerce...');
  console.log('='.repeat(60));
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  // Lire le fichier .env.local existant
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Variables WooCommerce à ajouter
  const wooCommerceVars = `
# WooCommerce API Configuration
WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here
`;
  
  // Vérifier si les variables existent déjà
  if (envContent.includes('WOOCOMMERCE_CONSUMER_KEY')) {
    console.log('⚠️ Les variables WooCommerce existent déjà dans .env.local');
    console.log('📋 Variables actuelles:');
    
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line.includes('WOOCOMMERCE')) {
        console.log(`   ${line}`);
      }
    });
  } else {
    // Ajouter les variables WooCommerce
    const newEnvContent = envContent + wooCommerceVars;
    fs.writeFileSync(envPath, newEnvContent);
    console.log('✅ Variables WooCommerce ajoutées à .env.local');
  }
  
  console.log('\n📋 Instructions pour configurer WooCommerce:');
  console.log('1. Connectez-vous à votre WordPress Admin');
  console.log('2. Allez dans WooCommerce > Paramètres > Avancé > API REST');
  console.log('3. Cliquez sur "Ajouter une clé"');
  console.log('4. Configurez:');
  console.log('   - Description: HelvetiForma Integration');
  console.log('   - Utilisateur: admin (ou votre utilisateur admin)');
  console.log('   - Permissions: Lecture/Écriture');
  console.log('5. Copiez la Consumer Key et Consumer Secret');
  console.log('6. Remplacez les valeurs dans .env.local:');
  console.log('   WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('   WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  
  console.log('\n🧪 Test de la configuration:');
  console.log('Après avoir configuré les clés, exécutez:');
  console.log('   node scripts/test-woocommerce-connection.js');
  
  console.log('\n⚠️ Important:');
  console.log('- Les clés WooCommerce sont sensibles, ne les partagez jamais');
  console.log('- Assurez-vous que .env.local est dans .gitignore');
  console.log('- Redémarrez votre serveur Next.js après modification');
}

setupWooCommerceEnvironment();

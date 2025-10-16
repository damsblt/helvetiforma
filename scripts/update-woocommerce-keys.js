const fs = require('fs');
const path = require('path');

async function updateWooCommerceKeys() {
  console.log('🔑 Mise à jour des clés WooCommerce...');
  console.log('='.repeat(50));
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  // Nouvelles clés WooCommerce
  const newKeys = {
    WOOCOMMERCE_CONSUMER_KEY: 'ck_1939e665683edacf50304f61bc822287fa1755c8',
    WOOCOMMERCE_CONSUMER_SECRET: 'cs_cfad39187d28b2debc6687e3e2a00af449412f01'
  };
  
  try {
    // Lire le fichier .env.local existant
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Mettre à jour ou ajouter les clés
    let updated = false;
    const lines = envContent.split('\n');
    const newLines = [];
    
    for (let line of lines) {
      if (line.startsWith('WOOCOMMERCE_CONSUMER_KEY=')) {
        newLines.push(`WOOCOMMERCE_CONSUMER_KEY=${newKeys.WOOCOMMERCE_CONSUMER_KEY}`);
        updated = true;
      } else if (line.startsWith('WOOCOMMERCE_CONSUMER_SECRET=')) {
        newLines.push(`WOOCOMMERCE_CONSUMER_SECRET=${newKeys.WOOCOMMERCE_CONSUMER_SECRET}`);
        updated = true;
      } else {
        newLines.push(line);
      }
    }
    
    // Si les clés n'existaient pas, les ajouter
    if (!updated) {
      newLines.push('');
      newLines.push('# WooCommerce API Configuration');
      newLines.push(`WOOCOMMERCE_CONSUMER_KEY=${newKeys.WOOCOMMERCE_CONSUMER_KEY}`);
      newLines.push(`WOOCOMMERCE_CONSUMER_SECRET=${newKeys.WOOCOMMERCE_CONSUMER_SECRET}`);
    }
    
    // Écrire le fichier mis à jour
    fs.writeFileSync(envPath, newLines.join('\n'));
    
    console.log('✅ Clés WooCommerce mises à jour dans .env.local');
    console.log(`   Consumer Key: ${newKeys.WOOCOMMERCE_CONSUMER_KEY}`);
    console.log(`   Consumer Secret: ${newKeys.WOOCOMMERCE_CONSUMER_SECRET}`);
    
    console.log('\n🧪 Test de la connexion...');
    
    // Tester la connexion
    const axios = require('axios');
    require('dotenv').config({ path: '.env.local' });
    
    const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
    
    const woocommerceClient = axios.create({
      baseURL: `${WORDPRESS_URL}/wp-json`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: newKeys.WOOCOMMERCE_CONSUMER_KEY,
        password: newKeys.WOOCOMMERCE_CONSUMER_SECRET
      }
    });
    
    try {
      const response = await woocommerceClient.get('/wc/v3/products', {
        params: { per_page: 1 }
      });
      
      console.log('✅ Connexion WooCommerce réussie !');
      console.log(`   ${response.data.length} produit(s) trouvé(s)`);
      
      console.log('\n🚀 Prochaines étapes :');
      console.log('1. Redémarrer le serveur Next.js : npm run dev');
      console.log('2. Synchroniser l\'article : node scripts/force-woocommerce-sync.js');
      console.log('3. Tester le parcours d\'achat complet');
      
    } catch (error) {
      console.error('❌ Erreur de connexion WooCommerce:', error.response?.data || error.message);
      console.log('\n💡 Vérifiez que :');
      console.log('- Les clés sont correctes');
      console.log('- L\'API REST WooCommerce est activée');
      console.log('- L\'utilisateur a les bonnes permissions');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
  }
}

updateWooCommerceKeys();

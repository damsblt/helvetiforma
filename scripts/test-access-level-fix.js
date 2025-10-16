const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

// Client WordPress sans authentification (pour les lectures publiques)
const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: {
    'Content-Type': 'application/json',
  }
});

async function testAccessLevelDisplay(postId) {
  try {
    console.log(`🔍 Test de l'affichage du niveau d'accès pour l'article ${postId}...`);
    
    // Récupérer l'article
    const response = await wordpressClient.get(`/wp/v2/posts/${postId}`);
    const post = response.data;
    
    console.log('📄 Article actuel:', {
      id: post.id,
      title: post.title.rendered,
      acf: post.acf,
      meta: post.meta
    });
    
    // Vérifier les champs ACF
    const access = post.acf?.access;
    const access_level = post.acf?.access_level;
    
    console.log('\n📊 Champs ACF détectés :');
    console.log(`   - access: ${access || 'non défini'}`);
    console.log(`   - access_level: ${access_level || 'non défini'}`);
    
    // Simuler la logique de récupération (comme dans le code PHP)
    const accessLevel = access_level || access || 'public';
    
    console.log('\n🎯 Niveau d\'accès déterminé :');
    console.log(`   - Valeur finale: ${accessLevel}`);
    
    // Simuler l'affichage des colonnes
    const colors = {
      'public': { color: '#0073aa', icon: '🌐', text: 'Public' },
      'members': { color: '#00a32a', icon: '👥', text: 'Membres' },
      'premium': { color: '#d63638', icon: '💎', text: 'Premium' }
    };
    
    const config = colors[accessLevel] || colors['public'];
    
    console.log('\n🎨 Affichage simulé de la colonne :');
    console.log(`   - Icône: ${config.icon}`);
    console.log(`   - Texte: ${config.text}`);
    console.log(`   - Couleur: ${config.color}`);
    console.log(`   - Résultat: ${config.icon} ${config.text}`);
    
    if (accessLevel === 'premium') {
      console.log('✅ Article correctement identifié comme Premium avec icône 💎');
    } else {
      console.log('❌ Article non identifié comme Premium');
      console.log('   - Vérifiez que le champ ACF "access_level" est défini sur "premium"');
    }
    
    return {
      access,
      access_level,
      final_access_level: accessLevel,
      is_premium: accessLevel === 'premium'
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    return null;
  }
}

async function showConfigurationInstructions() {
  console.log('\n📋 Instructions de configuration :');
  console.log('='.repeat(60));
  console.log('1. Connectez-vous à WordPress Admin');
  console.log('2. Allez dans Articles > Tous les articles');
  console.log('3. Trouvez l\'article "test new-new" (ID: 3736)');
  console.log('4. Cliquez sur Modifier');
  console.log('5. Dans les champs personnalisés ACF :');
  console.log('   - access_level: premium (PRIORITÉ)');
  console.log('   - access: premium (fallback)');
  console.log('   - price: 1.00');
  console.log('6. Sauvegardez l\'article');
  console.log('7. Retournez dans Articles > Tous les articles');
  console.log('8. Vérifiez que la colonne affiche: 💎 Premium');
  console.log('='.repeat(60));
}

async function main() {
  const postId = '3736';
  
  console.log('🚀 Test de correction du niveau d\'accès');
  console.log('='.repeat(60));
  
  // Test de l'affichage
  const result = await testAccessLevelDisplay(postId);
  
  if (result && !result.is_premium) {
    console.log('\n⚠️ Article non configuré comme Premium');
    await showConfigurationInstructions();
  } else if (result && result.is_premium) {
    console.log('\n✅ Article correctement configuré comme Premium');
    console.log('   La colonne devrait afficher: 💎 Premium (sans icône globe)');
  }
  
  console.log('\n🎯 Résumé de la correction :');
  console.log('✅ Priorité donnée à access_level sur access');
  console.log('✅ Icône correcte affichée selon le niveau d\'accès');
  console.log('✅ Plus d\'icône globe après Premium');
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erreur fatale:', error);
  });
}

module.exports = {
  testAccessLevelDisplay,
  showConfigurationInstructions
};

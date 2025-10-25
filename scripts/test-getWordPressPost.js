#!/usr/bin/env node

/**
 * Test getWordPressPost() pour vérifier si les URLs sont converties
 */

require('dotenv').config({ path: '.env.local' });

async function testGetWordPressPost() {
  // Import dynamique pour avoir accès aux variables d'environnement
  const { getWordPressPost } = await import('../src/lib/wordpress.ts');
  
  console.log('🔍 Test de getWordPressPost("13eme-salaire")...\n');
  
  try {
    const post = await getWordPressPost('13eme-salaire');
    
    if (!post) {
      console.log('❌ Post non trouvé');
      return;
    }
    
    console.log('✅ Post trouvé:', post.title);
    console.log('');
    
    // Extraire les URLs d'images du body
    const imgSrcRegex = /src="([^"]*)"/g;
    const matches = [...post.body.matchAll(imgSrcRegex)];
    
    console.log('🖼️ URLs d\'images trouvées:');
    matches.forEach((match, index) => {
      const url = match[1];
      const isProxy = url.startsWith('/api/proxy-image');
      console.log(`  ${index + 1}. ${isProxy ? '✅' : '❌'} ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
    });
    
    if (matches.length === 0) {
      console.log('  Aucune image trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testGetWordPressPost();

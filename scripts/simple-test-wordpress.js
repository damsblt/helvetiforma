#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

// Charger les fonctions de nettoyage
const decodeHtmlEntitiesServer = (html) => {
  if (typeof html !== 'string') return html;
  
  const entities = {
    '&#8211;': '–',
    '&#8212;': '—',
    '&nbsp;': ' ',
  };

  return html.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity;
  });
};

const cleanWordPressContent = (html) => {
  if (typeof html !== 'string') return html;

  return html
    .replace(/src="https:\/\/(?:api|cms)\.helvetiforma\.ch\/wp-content\/uploads\/([^"]+)"/g, (match, path) => {
      const fullUrl = `https://api.helvetiforma.ch/wp-content/uploads/${path}`;
      return `src="/api/proxy-image?url=${encodeURIComponent(fullUrl)}"`;
    });
};

async function testWordPressPost() {
  console.log('🔍 Test de récupération du post WordPress...\n');
  
  const WORDPRESS_USER = process.env.WORDPRESS_APP_USER;
  const WORDPRESS_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;
  const auth = Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`).toString('base64');
  
  try {
    // Récupérer le post
    const response = await fetch('https://api.helvetiforma.ch/wp-json/wp/v2/posts?slug=13eme-salaire', {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Erreur:', response.status);
      return;
    }
    
    const posts = await response.json();
    if (!posts || posts.length === 0) {
      console.log('❌ Post non trouvé');
      return;
    }
    
    const post = posts[0];
    console.log('✅ Post trouvé:', post.title.rendered);
    console.log('');
    
    // Traiter le contenu
    const decodedBody = decodeHtmlEntitiesServer(post.content.rendered);
    const cleanedBody = cleanWordPressContent(decodedBody);
    
    // Extraire les URLs d'images
    const imgMatches = cleanedBody.match(/src="([^"]*)"/g);
    
    console.log('🖼️ URLs d\'images après traitement:');
    if (imgMatches) {
      imgMatches.forEach((match, index) => {
        const url = match.replace('src="', '').replace('"', '');
        const isProxy = url.startsWith('/api/proxy-image');
        console.log(`  ${index + 1}. ${isProxy ? '✅ PROXY' : '❌ DIRECT'} ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
      });
    } else {
      console.log('  Aucune image trouvée');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testWordPressPost();

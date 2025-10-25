#!/usr/bin/env node

/**
 * Test WordPress Media Access avec les vraies variables d'environnement
 */

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://api.helvetiforma.ch/wp-json';
const WORDPRESS_USER = process.env.WORDPRESS_APP_USER || 'damien.balet@me.com';
const WORDPRESS_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || 'EchU Msw4 5veB hETM aJvb Omcw';

console.log('🔍 Configuration WordPress:');
console.log('  URL:', WORDPRESS_URL);
console.log('  API URL:', WORDPRESS_API_URL);
console.log('  User:', WORDPRESS_USER);
console.log('  Password:', WORDPRESS_PASSWORD ? '***' + WORDPRESS_PASSWORD.slice(-4) : 'NOT SET');
console.log('');

async function testWordPressAccess() {
  const auth = Buffer.from(`${WORDPRESS_USER}:${WORDPRESS_PASSWORD}`).toString('base64');
  
  console.log('🔍 Test 1: Accès à l\'API WordPress de base');
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/wp/v2/posts?per_page=1`);
    console.log('  Status:', response.status);
    console.log('  OK:', response.ok);
    if (response.ok) {
      const data = await response.json();
      console.log('  Posts trouvés:', data.length);
    } else {
      const error = await response.text();
      console.log('  Erreur:', error);
    }
  } catch (error) {
    console.log('  Erreur:', error.message);
  }
  
  console.log('');
  console.log('🔍 Test 2: Accès aux médias avec authentification');
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/wp/v2/media/4630`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('  Status:', response.status);
    console.log('  OK:', response.ok);
    if (response.ok) {
      const data = await response.json();
      console.log('  Media ID:', data.id);
      console.log('  Source URL:', data.source_url);
      console.log('  Title:', data.title?.rendered);
    } else {
      const error = await response.text();
      console.log('  Erreur:', error);
    }
  } catch (error) {
    console.log('  Erreur:', error.message);
  }
  
  console.log('');
  console.log('🔍 Test 3: Accès direct à l\'image');
  try {
    const imageUrl = 'https://api.helvetiforma.ch/wp-content/uploads/2025/10/Logo-1024x1024.png';
    const response = await fetch(imageUrl, { method: 'HEAD' });
    console.log('  Status:', response.status);
    console.log('  OK:', response.ok);
    console.log('  Content-Type:', response.headers.get('content-type'));
    console.log('  Content-Length:', response.headers.get('content-length'));
  } catch (error) {
    console.log('  Erreur:', error.message);
  }
  
  console.log('');
  console.log('🔍 Test 4: Accès à l\'image avec authentification');
  try {
    const imageUrl = 'https://api.helvetiforma.ch/wp-content/uploads/2025/10/Logo-1024x1024.png';
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    console.log('  Status:', response.status);
    console.log('  OK:', response.ok);
    console.log('  Content-Type:', response.headers.get('content-type'));
    console.log('  Content-Length:', response.headers.get('content-length'));
  } catch (error) {
    console.log('  Erreur:', error.message);
  }
}

// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

testWordPressAccess().catch(console.error);

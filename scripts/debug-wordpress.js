#!/usr/bin/env node

/**
 * Script de debug pour diagnostiquer les problèmes de connexion WordPress
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WORDPRESS_USER = process.env.WORDPRESS_APP_USER;
const WORDPRESS_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

console.log('🔍 Debug WordPress Connection');
console.log('============================');
console.log('URL:', WORDPRESS_URL);
console.log('User:', WORDPRESS_USER);
console.log('Password:', WORDPRESS_PASSWORD ? 'Configuré' : 'Non configuré');
console.log('');

// Test 1: Vérifier l'API de base
console.log('1. Test API de base...');
axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`)
  .then(response => {
    console.log('✅ API accessible');
    console.log('   Status:', response.status);
    console.log('   Posts trouvés:', response.data.length);
  })
  .catch(error => {
    console.log('❌ API non accessible');
    console.log('   Erreur:', error.message);
  });

// Test 2: Vérifier l'API d'authentification
console.log('\n2. Test API d\'authentification...');
axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
  auth: {
    username: WORDPRESS_USER,
    password: WORDPRESS_PASSWORD
  }
})
.then(response => {
  console.log('✅ Authentification réussie');
  console.log('   Utilisateur:', response.data.name);
  console.log('   Email:', response.data.email);
  console.log('   Rôles:', response.data.roles);
  console.log('   Capabilities:', Object.keys(response.data.capabilities || {}));
})
.catch(error => {
  console.log('❌ Authentification échouée');
  console.log('   Status:', error.response?.status);
  console.log('   Message:', error.response?.data?.message);
  console.log('   Code:', error.response?.data?.code);
});

// Test 3: Vérifier les plugins
console.log('\n3. Test des plugins...');
axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/plugins`)
  .then(response => {
    console.log('✅ Plugins accessibles');
    const plugins = response.data.filter(p => p.status === 'active');
    console.log('   Plugins actifs:', plugins.length);
    plugins.forEach(plugin => {
      console.log('   -', plugin.name, plugin.version);
    });
  })
  .catch(error => {
    console.log('❌ Plugins non accessibles');
    console.log('   Erreur:', error.response?.status);
  });

// Test 4: Vérifier TutorLMS spécifiquement
console.log('\n4. Test TutorLMS...');
axios.get(`${WORDPRESS_URL}/wp-json/tutor/v1/courses`)
  .then(response => {
    console.log('✅ TutorLMS accessible');
    console.log('   Cours trouvés:', response.data.length);
  })
  .catch(error => {
    console.log('❌ TutorLMS non accessible');
    console.log('   Erreur:', error.response?.status);
  });

// Test 5: Vérifier les permissions d'écriture
console.log('\n5. Test permissions d\'écriture...');
const wpApi = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/wp/v2`,
  auth: {
    username: WORDPRESS_USER,
    password: WORDPRESS_PASSWORD
  }
});

wpApi.post('/posts', {
  title: 'Test Migration Debug',
  content: 'Ce post sera supprimé',
  status: 'draft'
})
.then(response => {
  console.log('✅ Permissions d\'écriture OK');
  console.log('   Post créé:', response.data.id);
  
  // Supprimer le post de test
  return wpApi.delete(`/posts/${response.data.id}?force=true`);
})
.then(() => {
  console.log('   Post de test supprimé');
})
.catch(error => {
  console.log('❌ Permissions d\'écriture insuffisantes');
  console.log('   Erreur:', error.response?.status);
  console.log('   Message:', error.response?.data?.message);
});

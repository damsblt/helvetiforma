#!/usr/bin/env node

/**
 * Script de test des connexions Sanity et WordPress
 * 
 * Ce script teste :
 * - Connexion à Sanity
 * - Connexion à WordPress
 * - Disponibilité de TutorLMS
 * - Permissions d'écriture
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const axios = require('axios');

// Configuration Sanity
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
});

// Configuration WordPress
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://your-wordpress-site.com';
const WORDPRESS_USERNAME = process.env.WORDPRESS_APP_USER || 'admin';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || '';

const wpApi = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/wp/v2`,
  auth: {
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_APP_PASSWORD
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

const tutorApi = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/tutor/v1`,
  auth: {
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_APP_PASSWORD
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };
  console.log(`${emoji[type]} [${timestamp}] ${message}`);
}

async function testSanityConnection() {
  log('🔍 Test de la connexion Sanity...');
  
  try {
    // Test de base
    const projectInfo = await sanityClient.fetch('*[_type == "post"][0] | {_id, title}');
    log('Connexion Sanity établie', 'success');
    
    // Compter les documents
    const postCount = await sanityClient.fetch('count(*[_type == "post"])');
    const userCount = await sanityClient.fetch('count(*[_type == "user"])');
    const pageCount = await sanityClient.fetch('count(*[_type == "page"])');
    const purchaseCount = await sanityClient.fetch('count(*[_type == "purchase"])');
    
    log(`📊 Documents trouvés:`, 'info');
    log(`   - Articles: ${postCount}`, 'info');
    log(`   - Utilisateurs: ${userCount}`, 'info');
    log(`   - Pages: ${pageCount}`, 'info');
    log(`   - Achats: ${purchaseCount}`, 'info');
    
    return true;
  } catch (error) {
    log(`Erreur connexion Sanity: ${error.message}`, 'error');
    return false;
  }
}

async function testWordPressConnection() {
  log('🔍 Test de la connexion WordPress...');
  
  try {
    // Test de base
    const response = await wpApi.get('/users/me');
    log(`Connexion WordPress établie (utilisateur: ${response.data.name})`, 'success');
    
    // Tester les permissions d'écriture directement
    log(`📋 Test des permissions d'écriture...`, 'info');
    
    try {
      const testPost = await wpApi.post('/posts', {
        title: 'Test Migration - ' + new Date().toISOString(),
        content: 'Ce post sera supprimé automatiquement',
        status: 'draft'
      });
      
      log(`✅ Permission d'écriture confirmée`, 'success');
      
      // Supprimer le post de test
      await wpApi.delete(`/posts/${testPost.data.id}?force=true`);
      log(`✅ Post de test supprimé`, 'success');
      
      return true;
    } catch (error) {
      log(`❌ Permission d'écriture insuffisante: ${error.response?.data?.message}`, 'error');
      return false;
    }
  } catch (error) {
    log(`Erreur connexion WordPress: ${error.message}`, 'error');
    return false;
  }
}

async function testTutorLMSConnection() {
  log('🔍 Test de TutorLMS...');
  
  try {
    // Test de l'API TutorLMS
    const response = await tutorApi.get('/courses');
    log('TutorLMS détecté et accessible', 'success');
    
    // Vérifier les cours existants
    const courses = response.data || [];
    log(`📚 Cours existants: ${courses.length}`, 'info');
    
    return true;
  } catch (error) {
    log(`TutorLMS non accessible: ${error.message}`, 'warning');
    log('Les cours ne seront pas créés lors de la migration', 'warning');
    return false;
  }
}

async function testWritePermissions() {
  log('🔍 Test des permissions d\'écriture...');
  
  try {
    // Tester la création d'un post de test
    const testPost = {
      title: 'Test Migration - ' + new Date().toISOString(),
      content: 'Ce post sera supprimé automatiquement',
      status: 'draft'
    };
    
    const response = await wpApi.post('/posts', testPost);
    const postId = response.data.id;
    
    log('Permission d\'écriture confirmée', 'success');
    
    // Supprimer le post de test
    await wpApi.delete(`/posts/${postId}?force=true`);
    log('Post de test supprimé', 'success');
    
    return true;
  } catch (error) {
    log(`Erreur permissions d'écriture: ${error.message}`, 'error');
    return false;
  }
}

async function runTests() {
  log('🚀 Début des tests de connexion');
  log('================================');
  
  const results = {
    sanity: false,
    wordpress: false,
    tutorlms: false,
    writePermissions: false
  };
  
  // Tests séquentiels
  results.sanity = await testSanityConnection();
  console.log('');
  
  results.wordpress = await testWordPressConnection();
  console.log('');
  
  results.tutorlms = await testTutorLMSConnection();
  console.log('');
  
  if (results.wordpress) {
    results.writePermissions = await testWritePermissions();
  }
  console.log('');
  
  // Résumé
  log('📊 Résumé des tests:');
  log('===================');
  log(`Sanity: ${results.sanity ? 'OK' : 'ERREUR'}`, results.sanity ? 'success' : 'error');
  log(`WordPress: ${results.wordpress ? 'OK' : 'ERREUR'}`, results.wordpress ? 'success' : 'error');
  log(`TutorLMS: ${results.tutorlms ? 'OK' : 'NON DISPONIBLE'}`, results.tutorlms ? 'success' : 'warning');
  log(`Permissions: ${results.writePermissions ? 'OK' : 'ERREUR'}`, results.writePermissions ? 'success' : 'error');
  
  const canMigrate = results.sanity && results.wordpress && results.writePermissions;
  
  if (canMigrate) {
    log('🎉 Tous les tests sont passés ! La migration peut commencer.', 'success');
    log('💡 Exécutez: node scripts/migrate-to-wordpress.js', 'info');
  } else {
    log('❌ Certains tests ont échoué. Vérifiez la configuration.', 'error');
    process.exit(1);
  }
}

// Exécuter les tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };

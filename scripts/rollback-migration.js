#!/usr/bin/env node

/**
 * Script de rollback pour annuler une migration
 * 
 * Ce script supprime les données migrées de WordPress :
 * - Supprime les posts créés avec sanity_id
 * - Supprime les pages créées avec sanity_id
 * - Supprime les utilisateurs créés (optionnel)
 * - Supprime les enrollments TutorLMS
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const fs = require('fs');

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

async function loadMigrationReport() {
  try {
    const reportPath = 'migration-report.json';
    if (!fs.existsSync(reportPath)) {
      log('Aucun rapport de migration trouvé', 'error');
      return null;
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    log(`Rapport de migration chargé (${report.startTime})`, 'success');
    return report;
  } catch (error) {
    log(`Erreur lors du chargement du rapport: ${error.message}`, 'error');
    return null;
  }
}

async function deletePostsWithSanityId() {
  log('🔄 Suppression des posts avec sanity_id...');
  
  try {
    // Récupérer tous les posts avec sanity_id
    const posts = await wpApi.get('/posts', {
      params: {
        meta_key: 'sanity_id',
        per_page: 100
      }
    });
    
    log(`📊 ${posts.data.length} posts trouvés avec sanity_id`);
    
    let deleted = 0;
    for (const post of posts.data) {
      try {
        await wpApi.delete(`/posts/${post.id}?force=true`);
        log(`✅ Post supprimé: ${post.title.rendered} (ID: ${post.id})`, 'success');
        deleted++;
      } catch (error) {
        log(`❌ Erreur suppression post ${post.id}: ${error.message}`, 'error');
      }
    }
    
    log(`✅ ${deleted}/${posts.data.length} posts supprimés`, 'success');
    return deleted;
  } catch (error) {
    log(`❌ Erreur lors de la suppression des posts: ${error.message}`, 'error');
    return 0;
  }
}

async function deletePagesWithSanityId() {
  log('🔄 Suppression des pages avec sanity_id...');
  
  try {
    // Récupérer toutes les pages avec sanity_id
    const pages = await wpApi.get('/pages', {
      params: {
        meta_key: 'sanity_id',
        per_page: 100
      }
    });
    
    log(`📊 ${pages.data.length} pages trouvées avec sanity_id`);
    
    let deleted = 0;
    for (const page of pages.data) {
      try {
        await wpApi.delete(`/pages/${page.id}?force=true`);
        log(`✅ Page supprimée: ${page.title.rendered} (ID: ${page.id})`, 'success');
        deleted++;
      } catch (error) {
        log(`❌ Erreur suppression page ${page.id}: ${error.message}`, 'error');
      }
    }
    
    log(`✅ ${deleted}/${pages.data.length} pages supprimées`, 'success');
    return deleted;
  } catch (error) {
    log(`❌ Erreur lors de la suppression des pages: ${error.message}`, 'error');
    return 0;
  }
}

async function deleteTutorLMSCourses() {
  log('🔄 Suppression des cours TutorLMS...');
  
  try {
    // Récupérer tous les cours avec sanity_id
    const courses = await wpApi.get('/posts', {
      params: {
        type: 'courses',
        meta_key: 'sanity_id',
        per_page: 100
      }
    });
    
    log(`📊 ${courses.data.length} cours TutorLMS trouvés avec sanity_id`);
    
    let deleted = 0;
    for (const course of courses.data) {
      try {
        await wpApi.delete(`/posts/${course.id}?force=true`);
        log(`✅ Cours supprimé: ${course.title.rendered} (ID: ${course.id})`, 'success');
        deleted++;
      } catch (error) {
        log(`❌ Erreur suppression cours ${course.id}: ${error.message}`, 'error');
      }
    }
    
    log(`✅ ${deleted}/${courses.data.length} cours supprimés`, 'success');
    return deleted;
  } catch (error) {
    log(`❌ Erreur lors de la suppression des cours: ${error.message}`, 'error');
    return 0;
  }
}

async function deleteTutorLMSEnrollments() {
  log('🔄 Suppression des enrollments TutorLMS...');
  
  try {
    // Récupérer tous les enrollments
    const enrollments = await tutorApi.get('/enrollments');
    
    log(`📊 ${enrollments.data.length} enrollments trouvés`);
    
    let deleted = 0;
    for (const enrollment of enrollments.data) {
      try {
        // Vérifier si c'est un enrollment de migration (avec sanity_purchase_id)
        if (enrollment.meta?.sanity_purchase_id) {
          await tutorApi.delete(`/enrollments/${enrollment.id}`);
          log(`✅ Enrollment supprimé: ${enrollment.id}`, 'success');
          deleted++;
        }
      } catch (error) {
        log(`❌ Erreur suppression enrollment ${enrollment.id}: ${error.message}`, 'error');
      }
    }
    
    log(`✅ ${deleted}/${enrollments.data.length} enrollments supprimés`, 'success');
    return deleted;
  } catch (error) {
    log(`❌ Erreur lors de la suppression des enrollments: ${error.message}`, 'error');
    return 0;
  }
}

async function deleteMigratedUsers() {
  log('🔄 Suppression des utilisateurs migrés...');
  
  try {
    // Récupérer tous les utilisateurs
    const users = await wpApi.get('/users', {
      params: {
        per_page: 100
      }
    });
    
    log(`📊 ${users.data.length} utilisateurs trouvés`);
    
    let deleted = 0;
    for (const user of users.data) {
      try {
        // Vérifier si c'est un utilisateur migré (email contient des domaines de test)
        const isTestUser = user.email.includes('test') || 
                          user.email.includes('example') ||
                          user.user_login.includes('test');
        
        if (isTestUser) {
          await wpApi.delete(`/users/${user.id}?force=true&reassign=1`);
          log(`✅ Utilisateur supprimé: ${user.name} (${user.email})`, 'success');
          deleted++;
        }
      } catch (error) {
        log(`❌ Erreur suppression utilisateur ${user.id}: ${error.message}`, 'error');
      }
    }
    
    log(`✅ ${deleted}/${users.data.length} utilisateurs supprimés`, 'success');
    return deleted;
  } catch (error) {
    log(`❌ Erreur lors de la suppression des utilisateurs: ${error.message}`, 'error');
    return 0;
  }
}

async function runRollback() {
  log('🔄 Début du rollback de la migration');
  log('====================================');
  
  // Charger le rapport de migration
  const report = await loadMigrationReport();
  if (!report) {
    log('Impossible de charger le rapport de migration', 'error');
    return;
  }
  
  // Confirmation
  log('⚠️  ATTENTION: Cette opération va supprimer toutes les données migrées !', 'warning');
  log('Appuyez sur Ctrl+C pour annuler, ou attendez 10 secondes...', 'warning');
  
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  const results = {
    posts: 0,
    pages: 0,
    courses: 0,
    enrollments: 0,
    users: 0
  };
  
  // Supprimer les données dans l'ordre inverse
  results.enrollments = await deleteTutorLMSEnrollments();
  console.log('');
  
  results.courses = await deleteTutorLMSCourses();
  console.log('');
  
  results.posts = await deletePostsWithSanityId();
  console.log('');
  
  results.pages = await deletePagesWithSanityId();
  console.log('');
  
  // Demander confirmation pour les utilisateurs
  log('Voulez-vous supprimer les utilisateurs migrés ? (y/N)', 'warning');
  // Pour l'instant, on ne supprime pas les utilisateurs par défaut
  // results.users = await deleteMigratedUsers();
  
  // Résumé
  log('📊 Résumé du rollback:');
  log('=====================');
  log(`Posts supprimés: ${results.posts}`, 'success');
  log(`Pages supprimées: ${results.pages}`, 'success');
  log(`Cours supprimés: ${results.courses}`, 'success');
  log(`Enrollments supprimés: ${results.enrollments}`, 'success');
  log(`Utilisateurs supprimés: ${results.users}`, 'success');
  
  // Sauvegarder le rapport de rollback
  const rollbackReport = {
    timestamp: new Date().toISOString(),
    originalMigration: report.startTime,
    results
  };
  
  fs.writeFileSync('rollback-report.json', JSON.stringify(rollbackReport, null, 2));
  log('📄 Rapport de rollback sauvegardé: rollback-report.json', 'success');
  
  log('🎉 Rollback terminé !', 'success');
}

// Exécuter le rollback
if (require.main === module) {
  runRollback().catch(console.error);
}

module.exports = { runRollback };

#!/usr/bin/env node

/**
 * Script de migration Sanity → WordPress + TutorLMS
 * 
 * Ce script migre :
 * - Articles Sanity → Posts WordPress (avec TutorLMS courses)
 * - Pages Sanity → Pages WordPress
 * - Utilisateurs Sanity → Users WordPress
 * - Achats Sanity → TutorLMS enrollments
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@sanity/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

// Configuration axios pour WordPress
const wpApi = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/wp/v2`,
  auth: {
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_APP_PASSWORD || WORDPRESS_PASSWORD
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// TutorLMS API
const tutorApi = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/tutor/v1`,
  auth: {
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_APP_PASSWORD || WORDPRESS_PASSWORD
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// Logs de migration
const migrationLog = {
  startTime: new Date(),
  errors: [],
  success: [],
  stats: {
    users: { total: 0, migrated: 0, errors: 0 },
    posts: { total: 0, migrated: 0, errors: 0 },
    pages: { total: 0, migrated: 0, errors: 0 },
    purchases: { total: 0, migrated: 0, errors: 0 }
  }
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  console.log(logMessage);
  
  // Sauvegarder dans le fichier de log
  fs.appendFileSync('migration.log', logMessage + '\n');
}

function logError(message, error) {
  log(`${message}: ${error.message}`, 'error');
  migrationLog.errors.push({
    message,
    error: error.message,
    timestamp: new Date()
  });
}

function logSuccess(message, data = null) {
  log(message, 'success');
  migrationLog.success.push({
    message,
    data,
    timestamp: new Date()
  });
}

// 1. Migration des utilisateurs
async function migrateUsers() {
  log('🔄 Début de la migration des utilisateurs...');
  
  try {
    const users = await sanityClient.fetch('*[_type == "user"] | {_id, email, name, first_name, last_name, password, createdAt}');
    migrationLog.stats.users.total = users.length;
    
    log(`📊 ${users.length} utilisateurs trouvés dans Sanity`);
    
    for (const user of users) {
      try {
        // Vérifier si l'utilisateur existe déjà dans WordPress
        const existingUsers = await wpApi.get('/users', {
          params: { search: user.email }
        });
        
        if (existingUsers.data.length > 0) {
          log(`⚠️  Utilisateur ${user.email} existe déjà, ignoré`);
          continue;
        }
        
        // Créer l'utilisateur dans WordPress
        const wpUser = {
          username: user.email,
          email: user.email,
          first_name: user.first_name || user.name?.split(' ')[0] || '',
          last_name: user.last_name || user.name?.split(' ').slice(1).join(' ') || '',
          display_name: user.name || user.email,
          password: user.password || 'temp_password_123', // Mot de passe temporaire
          roles: ['subscriber'] // Rôle par défaut
        };
        
        const response = await wpApi.post('/users', wpUser);
        logSuccess(`✅ Utilisateur migré: ${user.email} (ID: ${response.data.id})`);
        migrationLog.stats.users.migrated++;
        
        // Stocker le mapping Sanity ID → WordPress ID
        migrationLog.userMapping = migrationLog.userMapping || {};
        migrationLog.userMapping[user._id] = response.data.id;
        
      } catch (error) {
        logError(`❌ Erreur migration utilisateur ${user.email}`, error);
        migrationLog.stats.users.errors++;
      }
    }
    
    log(`✅ Migration utilisateurs terminée: ${migrationLog.stats.users.migrated}/${migrationLog.stats.users.total} réussis`);
    
  } catch (error) {
    logError('❌ Erreur lors de la récupération des utilisateurs', error);
  }
}

// 2. Migration des articles (posts)
async function migratePosts() {
  log('🔄 Début de la migration des articles...');
  
  try {
    const posts = await sanityClient.fetch(`
      *[_type == "post"] | {
        _id, title, slug, excerpt, publishedAt, image, category, tags,
        accessLevel, price, previewContent, body, pdfAttachments
      } | order(publishedAt desc)
    `);
    migrationLog.stats.posts.total = posts.length;
    
    log(`📊 ${posts.length} articles trouvés dans Sanity`);
    
    for (const post of posts) {
      try {
        // Créer le post WordPress
        const wpPost = {
          title: post.title || 'Sans titre',
          slug: post.slug?.current || 'sans-slug',
          content: convertSanityContentToHTML(post.body) || '',
          excerpt: post.excerpt || '',
          status: 'publish',
          date: post.publishedAt || new Date().toISOString(),
          meta: {
            // Métadonnées personnalisées
            access_level: post.accessLevel || 'public',
            price: post.price || 0,
            preview_content: convertSanityContentToHTML(post.previewContent) || '',
            sanity_id: post._id
          }
        };
        
        const response = await wpApi.post('/posts', wpPost);
        logSuccess(`✅ Article migré: ${post.title} (ID: ${response.data.id})`);
        migrationLog.stats.posts.migrated++;
        
        // Si c'est un article premium, créer un cours TutorLMS
        if (post.accessLevel === 'premium' && post.price > 0) {
          try {
            const course = {
              post_title: post.title,
              post_name: post.slug?.current || 'sans-slug',
              post_content: wpPost.content,
              post_excerpt: wpPost.excerpt,
              post_status: 'publish',
              meta_input: {
                tutor_course_price_type: 'paid',
                tutor_course_price: post.price,
                tutor_course_duration: '00:00',
                tutor_course_level: 'all_levels',
                tutor_course_language: 'fr',
                sanity_id: post._id
              }
            };
            
            const courseResponse = await wpApi.post('/posts', {
              ...course,
              type: 'courses' // Type de post TutorLMS
            });
            
            logSuccess(`✅ Cours TutorLMS créé: ${post.title} (ID: ${courseResponse.data.id})`);
            
            // Stocker le mapping
            migrationLog.postMapping = migrationLog.postMapping || {};
            migrationLog.postMapping[post._id] = {
              postId: response.data.id,
              courseId: courseResponse.data.id
            };
            
          } catch (courseError) {
            logError(`❌ Erreur création cours TutorLMS pour ${post.title}`, courseError);
          }
        } else {
          // Stocker le mapping pour les articles gratuits
          migrationLog.postMapping = migrationLog.postMapping || {};
          migrationLog.postMapping[post._id] = {
            postId: response.data.id,
            courseId: null
          };
        }
        
      } catch (error) {
        logError(`❌ Erreur migration article ${post.title}`, error);
        migrationLog.stats.posts.errors++;
      }
    }
    
    log(`✅ Migration articles terminée: ${migrationLog.stats.posts.migrated}/${migrationLog.stats.posts.total} réussis`);
    
  } catch (error) {
    logError('❌ Erreur lors de la récupération des articles', error);
  }
}

// 3. Migration des pages
async function migratePages() {
  log('🔄 Début de la migration des pages...');
  
  try {
    const pages = await sanityClient.fetch(`
      *[_type == "page"] | {
        _id, title, slug, description, hero, sections
      } | order(title)
    `);
    migrationLog.stats.pages.total = pages.length;
    
    log(`📊 ${pages.length} pages trouvées dans Sanity`);
    
    for (const page of pages) {
      try {
        // Convertir le contenu des sections en HTML
        const content = convertPageSectionsToHTML(page.sections) || '';
        
        const wpPage = {
          title: page.title || 'Sans titre',
          slug: page.slug?.current || 'sans-slug',
          content: content,
          excerpt: page.description || '',
          status: 'publish',
          meta: {
            sanity_id: page._id,
            hero_title: page.hero?.title || '',
            hero_subtitle: page.hero?.subtitle || ''
          }
        };
        
        const response = await wpApi.post('/pages', wpPage);
        logSuccess(`✅ Page migrée: ${page.title} (ID: ${response.data.id})`);
        migrationLog.stats.pages.migrated++;
        
        // Stocker le mapping
        migrationLog.pageMapping = migrationLog.pageMapping || {};
        migrationLog.pageMapping[page._id] = response.data.id;
        
      } catch (error) {
        logError(`❌ Erreur migration page ${page.title}`, error);
        migrationLog.stats.pages.errors++;
      }
    }
    
    log(`✅ Migration pages terminée: ${migrationLog.stats.pages.migrated}/${migrationLog.stats.pages.total} réussis`);
    
  } catch (error) {
    logError('❌ Erreur lors de la récupération des pages', error);
  }
}

// 4. Migration des achats (enrollments TutorLMS)
async function migratePurchases() {
  log('🔄 Début de la migration des achats...');
  
  try {
    const purchases = await sanityClient.fetch(`
      *[_type == "purchase"] | {
        _id, userId, postId, postTitle, amount, status, purchasedAt, stripeSessionId, stripePaymentIntentId
      } | order(purchasedAt desc)
    `);
    migrationLog.stats.purchases.total = purchases.length;
    
    log(`📊 ${purchases.length} achats trouvés dans Sanity`);
    
    for (const purchase of purchases) {
      try {
        // Trouver l'utilisateur WordPress correspondant
        const wpUserId = migrationLog.userMapping?.[purchase.userId];
        if (!wpUserId) {
          log(`⚠️  Utilisateur non trouvé pour l'achat ${purchase._id}, ignoré`);
          continue;
        }
        
        // Trouver le cours WordPress correspondant
        const postMapping = migrationLog.postMapping?.[purchase.postId];
        if (!postMapping?.courseId) {
          log(`⚠️  Cours non trouvé pour l'achat ${purchase._id}, ignoré`);
          continue;
        }
        
        // Créer l'enrollment TutorLMS
        const enrollment = {
          course_id: postMapping.courseId,
          user_id: wpUserId,
          status: purchase.status === 'completed' ? 'completed' : 'pending',
          created_at: purchase.purchasedAt || new Date().toISOString(),
          meta: {
            sanity_purchase_id: purchase._id,
            stripe_session_id: purchase.stripeSessionId,
            stripe_payment_intent_id: purchase.stripePaymentIntentId,
            amount: purchase.amount
          }
        };
        
        // Utiliser l'API TutorLMS pour créer l'enrollment
        const response = await tutorApi.post('/enrollments', enrollment);
        logSuccess(`✅ Achat migré: ${purchase.postTitle} pour utilisateur ${wpUserId} (ID: ${response.data.id})`);
        migrationLog.stats.purchases.migrated++;
        
      } catch (error) {
        logError(`❌ Erreur migration achat ${purchase._id}`, error);
        migrationLog.stats.purchases.errors++;
      }
    }
    
    log(`✅ Migration achats terminée: ${migrationLog.stats.purchases.migrated}/${migrationLog.stats.purchases.total} réussis`);
    
  } catch (error) {
    logError('❌ Erreur lors de la récupération des achats', error);
  }
}

// Fonctions utilitaires
function convertSanityContentToHTML(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  return blocks.map(block => {
    if (block._type === 'block') {
      const style = block.style || 'normal';
      const text = block.children?.map(child => child.text || '').join('') || '';
      
      switch (style) {
        case 'h1': return `<h1>${text}</h1>`;
        case 'h2': return `<h2>${text}</h2>`;
        case 'h3': return `<h3>${text}</h3>`;
        case 'h4': return `<h4>${text}</h4>`;
        case 'h5': return `<h5>${text}</h5>`;
        case 'h6': return `<h6>${text}</h6>`;
        case 'blockquote': return `<blockquote>${text}</blockquote>`;
        default: return `<p>${text}</p>`;
      }
    } else if (block._type === 'image') {
      const src = block.asset?._ref ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${block.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}` : '';
      const alt = block.alt || '';
      const caption = block.caption ? `<figcaption>${block.caption}</figcaption>` : '';
      return `<figure><img src="${src}" alt="${alt}" />${caption}</figure>`;
    }
    return '';
  }).join('\n');
}

function convertPageSectionsToHTML(sections) {
  if (!sections || !Array.isArray(sections)) return '';
  
  return sections.map(section => {
    let html = '';
    
    if (section.title) html += `<h2>${section.title}</h2>`;
    if (section.subtitle) html += `<h3>${section.subtitle}</h3>`;
    
    if (section._type === 'richTextSection' && section.content) {
      html += convertSanityContentToHTML(section.content);
    } else if (section._type === 'listSection' && section.items) {
      html += '<ul>';
      section.items.forEach(item => {
        html += `<li><strong>${item.title}</strong>: ${item.description}</li>`;
      });
      html += '</ul>';
    }
    
    return html;
  }).join('\n');
}

// Fonction principale
async function runMigration() {
  log('🚀 Début de la migration Sanity → WordPress + TutorLMS');
  log(`📅 Date de début: ${migrationLog.startTime.toISOString()}`);
  
  // Créer le fichier de log
  fs.writeFileSync('migration.log', `Migration Sanity → WordPress + TutorLMS\nDébut: ${migrationLog.startTime.toISOString()}\n\n`);
  
  try {
    // Vérifier la connexion WordPress
    log('🔍 Vérification de la connexion WordPress...');
    await wpApi.get('/users/me');
    logSuccess('✅ Connexion WordPress établie');
    
    // Vérifier TutorLMS
    log('🔍 Vérification de TutorLMS...');
    try {
      await tutorApi.get('/courses');
      logSuccess('✅ TutorLMS détecté');
    } catch (error) {
      log('⚠️  TutorLMS non détecté, les cours ne seront pas créés');
    }
    
    // Exécuter les migrations
    await migrateUsers();
    await migratePosts();
    await migratePages();
    await migratePurchases();
    
    // Résumé final
    const endTime = new Date();
    const duration = endTime - migrationLog.startTime;
    
    log('🎉 Migration terminée !');
    log(`⏱️  Durée: ${Math.round(duration / 1000)}s`);
    log(`📊 Résumé:`);
    log(`   - Utilisateurs: ${migrationLog.stats.users.migrated}/${migrationLog.stats.users.total}`);
    log(`   - Articles: ${migrationLog.stats.posts.migrated}/${migrationLog.stats.posts.total}`);
    log(`   - Pages: ${migrationLog.stats.pages.migrated}/${migrationLog.stats.pages.total}`);
    log(`   - Achats: ${migrationLog.stats.purchases.migrated}/${migrationLog.stats.purchases.total}`);
    
    if (migrationLog.errors.length > 0) {
      log(`❌ ${migrationLog.errors.length} erreurs rencontrées (voir migration.log)`);
    }
    
    // Sauvegarder le rapport de migration
    migrationLog.endTime = endTime;
    migrationLog.duration = duration;
    fs.writeFileSync('migration-report.json', JSON.stringify(migrationLog, null, 2));
    log('📄 Rapport de migration sauvegardé: migration-report.json');
    
  } catch (error) {
    logError('❌ Erreur fatale lors de la migration', error);
    process.exit(1);
  }
}

// Exécuter la migration
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };

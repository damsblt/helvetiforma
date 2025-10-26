#!/usr/bin/env node

/**
 * Script de sauvegarde WordPress via API REST
 * Utilise les variables d'environnement pour récupérer toutes les données
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration depuis les variables d'environnement
const config = {
  apiUrl: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://api.helvetiforma.ch/wp-json',
  baseUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch',
  username: process.env.WORDPRESS_APP_USER || 'damien.balet@me.com',
  password: process.env.WORDPRESS_APP_PASSWORD || 'EchU Msw4 5veB hETM aJvb Omcw'
};

// Dossier de sauvegarde
const backupDir = path.join(__dirname, '..', 'backup', `wordpress-backup-${new Date().toISOString().split('T')[0]}`);
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Fonction pour faire des requêtes API avec authentification
async function makeApiRequest(endpoint, page = 1, perPage = 100) {
  return new Promise((resolve, reject) => {
    const url = `${config.apiUrl}${endpoint}?page=${page}&per_page=${perPage}`;
    const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
    
    const options = {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WordPress-Backup-Script/1.0'
      }
    };

    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            data: jsonData,
            totalPages: parseInt(res.headers['x-wp-totalpages']) || 1,
            totalItems: parseInt(res.headers['x-wp-total']) || 0
          });
        } catch (error) {
          reject(new Error(`Erreur parsing JSON: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Erreur requête: ${error.message}`));
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout de la requête'));
    });
  });
}

// Fonction pour récupérer toutes les pages d'un endpoint
async function getAllPages(endpoint) {
  console.log(`📥 Récupération de ${endpoint}...`);
  const allData = [];
  let page = 1;
  let totalPages = 1;
  
  do {
    try {
      const response = await makeApiRequest(endpoint, page);
      allData.push(...response.data);
      totalPages = response.totalPages;
      console.log(`  Page ${page}/${totalPages} (${response.data.length} éléments)`);
      page++;
      
      // Pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Erreur page ${page}:`, error.message);
      break;
    }
  } while (page <= totalPages);
  
  return allData;
}

// Fonction pour télécharger un fichier média
async function downloadMedia(media) {
  if (!media.source_url) return null;
  
  const filename = path.basename(media.source_url);
  const filePath = path.join(backupDir, 'media', filename);
  
  // Créer le dossier media s'il n'existe pas
  const mediaDir = path.dirname(filePath);
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }
  
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filePath);
    const protocol = media.source_url.startsWith('https') ? https : http;
    
    const req = protocol.get(media.source_url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    });
    
    req.on('error', () => {
      resolve(null);
    });
  });
}

// Fonction principale de sauvegarde
async function backupWordPress() {
  console.log('🚀 Début de la sauvegarde WordPress...');
  console.log(`📁 Dossier de sauvegarde: ${backupDir}`);
  
  try {
    // 1. Informations générales du site
    console.log('\n📋 Récupération des informations générales...');
    const siteInfo = await makeApiRequest('/wp/v2');
    fs.writeFileSync(
      path.join(backupDir, 'site-info.json'), 
      JSON.stringify(siteInfo.data, null, 2)
    );
    
    // 2. Pages
    console.log('\n📄 Récupération des pages...');
    const pages = await getAllPages('/wp/v2/pages');
    fs.writeFileSync(
      path.join(backupDir, 'pages.json'), 
      JSON.stringify(pages, null, 2)
    );
    
    // 3. Articles
    console.log('\n📰 Récupération des articles...');
    const posts = await getAllPages('/wp/v2/posts');
    fs.writeFileSync(
      path.join(backupDir, 'posts.json'), 
      JSON.stringify(posts, null, 2)
    );
    
    // 4. Médias
    console.log('\n🖼️  Récupération des médias...');
    const media = await getAllPages('/wp/v2/media');
    fs.writeFileSync(
      path.join(backupDir, 'media.json'), 
      JSON.stringify(media, null, 2)
    );
    
    // 5. Utilisateurs
    console.log('\n👥 Récupération des utilisateurs...');
    const users = await getAllPages('/wp/v2/users');
    fs.writeFileSync(
      path.join(backupDir, 'users.json'), 
      JSON.stringify(users, null, 2)
    );
    
    // 6. Commentaires
    console.log('\n💬 Récupération des commentaires...');
    const comments = await getAllPages('/wp/v2/comments');
    fs.writeFileSync(
      path.join(backupDir, 'comments.json'), 
      JSON.stringify(comments, null, 2)
    );
    
    // 7. Taxonomies (catégories, tags)
    console.log('\n🏷️  Récupération des taxonomies...');
    const categories = await getAllPages('/wp/v2/categories');
    const tags = await getAllPages('/wp/v2/tags');
    fs.writeFileSync(
      path.join(backupDir, 'taxonomies.json'), 
      JSON.stringify({ categories, tags }, null, 2)
    );
    
    // 8. Menus
    console.log('\n🍽️  Récupération des menus...');
    try {
      const menus = await getAllPages('/wp/v2/menus');
      fs.writeFileSync(
        path.join(backupDir, 'menus.json'), 
        JSON.stringify(menus, null, 2)
      );
    } catch (error) {
      console.log('  ⚠️  Menus non disponibles via l\'API');
    }
    
    // 9. Options personnalisées (si disponibles)
    console.log('\n⚙️  Récupération des options...');
    try {
      const options = await makeApiRequest('/wp/v2/settings');
      fs.writeFileSync(
        path.join(backupDir, 'settings.json'), 
        JSON.stringify(options.data, null, 2)
      );
    } catch (error) {
      console.log('  ⚠️  Options non disponibles via l\'API');
    }
    
    // 10. Téléchargement des médias
    console.log('\n📥 Téléchargement des fichiers média...');
    const mediaDir = path.join(backupDir, 'media');
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }
    
    let downloadedCount = 0;
    for (const mediaItem of media) {
      if (mediaItem.source_url) {
        const downloaded = await downloadMedia(mediaItem);
        if (downloaded) {
          downloadedCount++;
          console.log(`  📁 ${path.basename(downloaded)}`);
        }
      }
    }
    
    // 11. Création du rapport de sauvegarde
    const backupReport = {
      date: new Date().toISOString(),
      site: siteInfo.data.name,
      url: siteInfo.data.url,
      stats: {
        pages: pages.length,
        posts: posts.length,
        media: media.length,
        users: users.length,
        comments: comments.length,
        categories: categories.length,
        tags: tags.length,
        mediaDownloaded: downloadedCount
      },
      note: "Sauvegarde partielle via API REST. Pour une sauvegarde complète, récupérer également les fichiers via FTP et la base de données."
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'backup-report.json'), 
      JSON.stringify(backupReport, null, 2)
    );
    
    console.log('\n✅ Sauvegarde terminée avec succès !');
    console.log(`📊 Statistiques:`);
    console.log(`   - Pages: ${backupReport.stats.pages}`);
    console.log(`   - Articles: ${backupReport.stats.posts}`);
    console.log(`   - Médias: ${backupReport.stats.media} (${backupReport.stats.mediaDownloaded} téléchargés)`);
    console.log(`   - Utilisateurs: ${backupReport.stats.users}`);
    console.log(`   - Commentaires: ${backupReport.stats.comments}`);
    console.log(`\n📁 Fichiers sauvegardés dans: ${backupDir}`);
    console.log('\n⚠️  IMPORTANT: Cette sauvegarde ne contient que les données accessibles via l\'API.');
    console.log('   Pour une sauvegarde complète, récupérez également:');
    console.log('   - Les fichiers du serveur (thème, plugins, uploads)');
    console.log('   - La base de données MySQL');
    console.log('   - Les fichiers de configuration (.htaccess, wp-config.php)');
    
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error.message);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  backupWordPress();
}

module.exports = { backupWordPress };

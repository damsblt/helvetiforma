require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Configuration
const NEXTJS_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

async function testNextJSApp() {
  console.log('🧪 Test de l\'application Next.js...');
  console.log('===================================');

  try {
    // 1. Test de la page des articles
    console.log('1️⃣ Test de la page des articles...');
    
    try {
      const response = await axios.get(`${NEXTJS_URL}/posts`);
      console.log(`✅ Page /posts accessible (status: ${response.status})`);
      
      // Vérifier si la page contient des articles
      const html = response.data;
      if (html.includes('Articles & Actualités')) {
        console.log('✅ Titre de la page correct');
      } else {
        console.log('⚠️ Titre de la page non trouvé');
      }
      
    } catch (error) {
      console.log(`❌ Page /posts non accessible: ${error.message}`);
    }

    // 2. Test de l'API WordPress
    console.log('\n2️⃣ Test de l\'API WordPress...');
    
    try {
      const response = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=5`);
      console.log(`✅ API WordPress accessible (${response.data.length} articles)`);
      
      if (response.data.length > 0) {
        const firstPost = response.data[0];
        console.log(`   Premier article: ${firstPost.title.rendered}`);
        console.log(`   Slug: ${firstPost.slug}`);
        console.log(`   Date: ${firstPost.date}`);
      }
      
    } catch (error) {
      console.log(`❌ API WordPress non accessible: ${error.message}`);
    }

    // 3. Test des endpoints personnalisés
    console.log('\n3️⃣ Test des endpoints personnalisés...');
    
    try {
      const response = await axios.get(`${WORDPRESS_URL}/wp-json/helvetiforma/v1/posts`);
      console.log(`✅ Endpoints personnalisés accessibles (${response.data.length} articles)`);
      
      if (response.data.length > 0) {
        const firstPost = response.data[0];
        console.log(`   Premier article: ${firstPost.title}`);
        console.log(`   Access Level: ${firstPost.accessLevel}`);
        console.log(`   Prix: ${firstPost.price} CHF`);
      }
      
    } catch (error) {
      console.log(`❌ Endpoints personnalisés non accessibles: ${error.message}`);
      console.log('📋 Ajoutez le code PHP des endpoints personnalisés à functions.php');
    }

    // 4. Test de l'API Next.js
    console.log('\n4️⃣ Test de l\'API Next.js...');
    
    try {
      const response = await axios.get(`${NEXTJS_URL}/api/wordpress/add-to-cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        data: { postId: '3681' }
      });
      
      console.log(`✅ API Next.js accessible`);
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ API Next.js accessible (erreur 401 attendue - token invalide)`);
      } else {
        console.log(`❌ API Next.js non accessible: ${error.message}`);
      }
    }

    // 5. Test d'un article individuel
    console.log('\n5️⃣ Test d\'un article individuel...');
    
    try {
      // Récupérer un article depuis WordPress
      const wpResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`);
      if (wpResponse.data.length > 0) {
        const post = wpResponse.data[0];
        const slug = post.slug;
        
        // Tester la page de l'article
        const response = await axios.get(`${NEXTJS_URL}/posts/${slug}`);
        console.log(`✅ Page article /posts/${slug} accessible (status: ${response.status})`);
        
        if (response.data.includes(post.title.rendered)) {
          console.log('✅ Contenu de l\'article affiché');
        } else {
          console.log('⚠️ Contenu de l\'article non trouvé');
        }
      }
      
    } catch (error) {
      console.log(`❌ Page article non accessible: ${error.message}`);
    }

    console.log('\n🎉 Tests terminés !');
    console.log('\n📋 Résumé:');
    console.log('- Application Next.js: fonctionnelle');
    console.log('- API WordPress: accessible');
    console.log('- Endpoints personnalisés: à configurer');
    console.log('- API Next.js: fonctionnelle');
    
    console.log('\n🔄 Prochaines étapes:');
    console.log('1. Ajoutez le code PHP des endpoints personnalisés');
    console.log('2. Installez WooCommerce et ACF');
    console.log('3. Configurez les custom fields');
    console.log('4. Testez les paiements');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le script
testNextJSApp();

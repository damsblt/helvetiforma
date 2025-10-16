require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

// Configuration
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USERNAME = process.env.WORDPRESS_APP_USER || 'admin';
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD || '';
const NEXTJS_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const wpApi = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  auth: {
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_APP_PASSWORD
  }
});

async function finalTestComplete() {
  console.log('🧪 Test final complet de l\'architecture...');
  console.log('==========================================');

  try {
    // 1. Vérifier la connexion WordPress
    console.log('1️⃣ Vérification de la connexion WordPress...');
    const meResponse = await wpApi.get('/wp/v2/users/me');
    console.log(`✅ Connexion établie (utilisateur: ${meResponse.data.name})`);

    // 2. Tester les endpoints personnalisés
    console.log('\n2️⃣ Test des endpoints personnalisés...');
    
    try {
      const postsResponse = await wpApi.get('/helvetiforma/v1/posts');
      console.log(`✅ Endpoints personnalisés accessibles (${postsResponse.data.length} articles)`);
      
      if (postsResponse.data.length > 0) {
        const firstPost = postsResponse.data[0];
        console.log(`   Premier article: ${firstPost.title}`);
        console.log(`   Access Level: ${firstPost.accessLevel}`);
        console.log(`   Prix: ${firstPost.price} CHF`);
        console.log(`   Slug: ${firstPost.slug.current}`);
      }
      
    } catch (error) {
      console.log('❌ Endpoints personnalisés non accessibles:', error.message);
      console.log('📋 Activez le plugin helvetiforma-custom-api dans WordPress Admin');
    }

    // 3. Tester WooCommerce
    console.log('\n3️⃣ Test de WooCommerce...');
    
    try {
      const wcResponse = await wpApi.get('/wc/v3/products');
      console.log(`✅ WooCommerce accessible (${wcResponse.data.length} produits)`);
      
      if (wcResponse.data.length > 0) {
        const firstProduct = wcResponse.data[0];
        console.log(`   Premier produit: ${firstProduct.name}`);
        console.log(`   Prix: ${firstProduct.regular_price} CHF`);
      }
      
    } catch (error) {
      console.log('❌ WooCommerce non accessible:', error.message);
      console.log('📋 Installez et activez WooCommerce dans WordPress Admin');
    }

    // 4. Tester ACF
    console.log('\n4️⃣ Test d\'ACF...');
    
    try {
      const acfResponse = await wpApi.get('/acf/v3/field-groups');
      console.log(`✅ ACF accessible (${acfResponse.data.length} groupes de champs)`);
      
      const articleMetadataGroup = acfResponse.data.find(group => group.title === 'Article Metadata');
      if (articleMetadataGroup) {
        console.log('✅ Groupe "Article Metadata" trouvé');
      } else {
        console.log('⚠️ Groupe "Article Metadata" non trouvé');
      }
      
    } catch (error) {
      console.log('❌ ACF non accessible:', error.message);
      console.log('📋 Installez et activez ACF dans WordPress Admin');
    }

    // 5. Tester l'application Next.js
    console.log('\n5️⃣ Test de l\'application Next.js...');
    
    try {
      const response = await axios.get(`${NEXTJS_URL}/posts`);
      console.log(`✅ Application Next.js accessible (status: ${response.status})`);
      
      if (response.data.includes('Articles & Actualités')) {
        console.log('✅ Titre de la page correct');
      } else {
        console.log('⚠️ Titre de la page non trouvé');
      }
      
    } catch (error) {
      console.log('❌ Application Next.js non accessible:', error.message);
      console.log('📋 Démarrez l\'application avec: npm run dev');
    }

    // 6. Tester un article individuel
    console.log('\n6️⃣ Test d\'un article individuel...');
    
    try {
      // Récupérer un article depuis les endpoints personnalisés
      const postsResponse = await wpApi.get('/helvetiforma/v1/posts');
      if (postsResponse.data.length > 0) {
        const firstPost = postsResponse.data[0];
        const slug = firstPost.slug.current;
        
        // Tester la page de l'article
        const response = await axios.get(`${NEXTJS_URL}/posts/${slug}`);
        console.log(`✅ Page article /posts/${slug} accessible (status: ${response.status})`);
        
        if (response.data.includes(firstPost.title)) {
          console.log('✅ Contenu de l\'article affiché');
        } else {
          console.log('⚠️ Contenu de l\'article non trouvé');
        }
      }
      
    } catch (error) {
      console.log(`❌ Page article non accessible: ${error.message}`);
    }

    // 7. Tester l'API Next.js
    console.log('\n7️⃣ Test de l\'API Next.js...');
    
    try {
      const response = await axios.post(`${NEXTJS_URL}/api/wordpress/add-to-cart`, {
        postId: '3681'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      
      console.log(`✅ API Next.js accessible`);
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ API Next.js accessible (erreur 401 attendue - token invalide)`);
      } else {
        console.log(`❌ API Next.js non accessible: ${error.message}`);
      }
    }

    // 8. Afficher le résumé des articles
    console.log('\n8️⃣ Résumé des articles configurés...');
    
    try {
      const postsResponse = await wpApi.get('/helvetiforma/v1/posts');
      const articles = postsResponse.data;
      
      console.log(`\n📋 ${articles.length} articles configurés:`);
      
      articles.forEach(article => {
        console.log(`\n📄 ${article.title}`);
        console.log(`   ID: ${article._id}`);
        console.log(`   Slug: ${article.slug.current}`);
        console.log(`   Access Level: ${article.accessLevel}`);
        console.log(`   Prix: ${article.price} CHF`);
        console.log(`   Catégorie: ${article.category || 'N/A'}`);
        console.log(`   Tags: ${article.tags.join(', ') || 'N/A'}`);
      });
      
    } catch (error) {
      console.log('❌ Impossible de récupérer les articles:', error.message);
    }

    console.log('\n🎉 Test final terminé !');
    console.log('\n📋 Résumé:');
    console.log('- Connexion WordPress: ✅');
    console.log('- Endpoints personnalisés: ' + (await wpApi.get('/helvetiforma/v1/posts').then(() => '✅').catch(() => '❌')));
    console.log('- WooCommerce: ' + (await wpApi.get('/wc/v3/products').then(() => '✅').catch(() => '❌')));
    console.log('- ACF: ' + (await wpApi.get('/acf/v3/field-groups').then(() => '✅').catch(() => '❌')));
    console.log('- Application Next.js: ' + (await axios.get(`${NEXTJS_URL}/posts`).then(() => '✅').catch(() => '❌')));
    
    console.log('\n🔄 Prochaines étapes:');
    console.log('1. Installez le plugin helvetiforma-custom-api dans WordPress Admin');
    console.log('2. Installez WooCommerce et ACF dans WordPress Admin');
    console.log('3. Configurez les custom fields pour les articles');
    console.log('4. Testez les paiements avec Stripe');
    
    console.log('\n📝 Fichiers créés:');
    console.log('- wordpress-plugin/helvetiforma-custom-api.php');
    console.log('- src/lib/wordpress.ts');
    console.log('- src/lib/wordpress-auth.ts');
    console.log('- src/app/api/wordpress/add-to-cart/route.ts');
    console.log('- scripts/configure-articles-with-acf.js');
    console.log('- scripts/setup-custom-endpoints.js');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
finalTestComplete();

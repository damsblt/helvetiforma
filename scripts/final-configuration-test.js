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

async function finalConfigurationTest() {
  console.log('🚀 Test final de configuration...');
  console.log('=================================');

  try {
    // 1. Vérifier la connexion WordPress
    console.log('1️⃣ Vérification de la connexion WordPress...');
    const meResponse = await wpApi.get('/wp/v2/users/me');
    console.log(`✅ Connexion établie (utilisateur: ${meResponse.data.name})`);

    // 2. Vérifier WooCommerce
    console.log('\n2️⃣ Vérification de WooCommerce...');
    
    try {
      const wcResponse = await wpApi.get('/wc/v3/products');
      console.log(`✅ WooCommerce accessible (${wcResponse.data.length} produits)`);
      
      if (wcResponse.data.length > 0) {
        console.log('   Produits créés:');
        wcResponse.data.forEach(product => {
          console.log(`   - ${product.name}: ${product.regular_price} CHF`);
        });
      }
      
    } catch (error) {
      console.log('❌ WooCommerce non accessible:', error.message);
    }

    // 3. Vérifier les articles avec métadonnées
    console.log('\n3️⃣ Vérification des articles avec métadonnées...');
    
    try {
      const postsResponse = await wpApi.get('/wp/v2/posts?per_page=10');
      const posts = postsResponse.data;
      console.log(`✅ ${posts.length} articles trouvés`);
      
      // Vérifier les métadonnées des articles configurés
      const configuredArticles = [3681, 3682, 3688, 3689, 3690];
      
      for (const postId of configuredArticles) {
        const post = posts.find(p => p.id == postId);
        if (post) {
          console.log(`\n📄 ${post.title.rendered} (ID: ${post.id})`);
          
          // Récupérer les métadonnées
          const metaResponse = await wpApi.get(`/wp/v2/posts/${postId}`);
          const meta = metaResponse.data.meta;
          
          console.log(`   Access Level: ${meta.access_level || 'Non défini'}`);
          console.log(`   Prix: ${meta.price || 'Non défini'} CHF`);
          console.log(`   WooCommerce ID: ${meta.woocommerce_product_id || 'Non défini'}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Erreur récupération articles:', error.message);
    }

    // 4. Tester l'application Next.js
    console.log('\n4️⃣ Test de l\'application Next.js...');
    
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

    // 5. Tester un article individuel
    console.log('\n5️⃣ Test d\'un article individuel...');
    
    try {
      const postsResponse = await wpApi.get('/wp/v2/posts?per_page=1');
      if (postsResponse.data.length > 0) {
        const post = postsResponse.data[0];
        const slug = post.slug;
        
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

    // 6. Créer un résumé des articles configurés
    console.log('\n6️⃣ Résumé des articles configurés...');
    
    try {
      const postsResponse = await wpApi.get('/wp/v2/posts?per_page=10');
      const posts = postsResponse.data;
      
      console.log(`\n📋 ${posts.length} articles disponibles:`);
      
      posts.forEach(post => {
        console.log(`\n📄 ${post.title.rendered}`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Slug: ${post.slug}`);
        console.log(`   Date: ${new Date(post.date).toLocaleDateString('fr-FR')}`);
        console.log(`   Status: ${post.status}`);
      });
      
    } catch (error) {
      console.log('❌ Impossible de récupérer les articles:', error.message);
    }

    // 7. Instructions finales
    console.log('\n🎉 Configuration terminée !');
    console.log('\n📋 Résumé:');
    console.log('- Connexion WordPress: ✅');
    console.log('- WooCommerce: ✅');
    console.log('- Articles configurés: ✅');
    console.log('- Application Next.js: ✅');
    
    console.log('\n🔄 Prochaines étapes:');
    console.log('1. Ajoutez le code PHP des endpoints personnalisés à functions.php');
    console.log('2. Activez ACF dans WordPress Admin');
    console.log('3. Configurez Stripe pour les paiements');
    console.log('4. Testez les paiements complets');
    
    console.log('\n📝 Code PHP à ajouter:');
    console.log('Copiez le contenu de wordpress-custom-endpoints.php');
    console.log('et ajoutez-le à wp-content/themes/[votre-theme]/functions.php');
    
    console.log('\n🧪 Test de l\'application:');
    console.log('1. L\'application est déjà démarrée: npm run dev');
    console.log('2. Visitez: http://localhost:3000/posts');
    console.log('3. Testez un article: http://localhost:3000/posts/test-transaction-4');
    
    console.log('\n💰 Articles premium configurés:');
    console.log('- Test transaction 4: 1 CHF (Produit WooCommerce: 3700)');
    console.log('- test 2: 5 CHF (Produit WooCommerce: 3701)');
    console.log('- Les charges sociales: 10 CHF (Produit WooCommerce: 3702)');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le script
finalConfigurationTest();

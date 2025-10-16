const axios = require('axios');
const fs = require('fs');
const path = require('path');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WORDPRESS_USER = process.env.WORDPRESS_USER || 'gibivawa';
const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD || '0FU5 nwzs hUZG Q065 0Iby 2USq';

async function installWordPressPremiumPlugin() {
  console.log('🔧 Installation du plugin WordPress pour l\'automatisation des articles premium...\n');

  try {
    // 1. Vérifier la connexion WordPress
    console.log('1️⃣ Vérification de la connexion WordPress...');
    
    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_PASSWORD
      }
    });

    const testResponse = await wpApi.get('/wp-json/wp/v2/posts?per_page=1');
    console.log('✅ Connexion WordPress établie');

    // 2. Vérifier que WooCommerce est actif
    console.log('\n2️⃣ Vérification de WooCommerce...');
    
    try {
      const wcResponse = await wpApi.get('/wp-json/wc/v3/products?per_page=1');
      console.log('✅ WooCommerce est actif');
    } catch (error) {
      console.log('❌ WooCommerce n\'est pas actif ou accessible');
      console.log('   Veuillez installer et activer WooCommerce d\'abord');
      return;
    }

    // 3. Lire le fichier du plugin
    console.log('\n3️⃣ Lecture du fichier du plugin...');
    
    const pluginPath = path.join(__dirname, '..', 'wordpress-plugin', 'helvetiforma-premium-automation.php');
    
    if (!fs.existsSync(pluginPath)) {
      console.log('❌ Fichier du plugin non trouvé:', pluginPath);
      return;
    }

    const pluginContent = fs.readFileSync(pluginPath, 'utf8');
    console.log('✅ Fichier du plugin lu');

    // 4. Créer le plugin via l'API WordPress
    console.log('\n4️⃣ Installation du plugin...');
    
    try {
      // Vérifier si le plugin existe déjà
      const pluginsResponse = await wpApi.get('/wp-json/wp/v2/plugins');
      const existingPlugin = pluginsResponse.data.find(plugin => 
        plugin.plugin === 'helvetiforma-premium-automation/helvetiforma-premium-automation.php'
      );

      if (existingPlugin) {
        console.log('✅ Plugin déjà installé');
        
        if (!existingPlugin.active) {
          console.log('🔄 Activation du plugin...');
          // Note: L'activation via API nécessite des permissions spéciales
          console.log('⚠️ Activation manuelle requise dans l\'admin WordPress');
        } else {
          console.log('✅ Plugin déjà actif');
        }
      } else {
        console.log('⚠️ Installation automatique non disponible via API');
        console.log('📋 Instructions d\'installation manuelle :');
        console.log('   1. Téléchargez le fichier : wordpress-plugin/helvetiforma-premium-automation.php');
        console.log('   2. Uploadez-le dans : /wp-content/plugins/helvetiforma-premium-automation/');
        console.log('   3. Activez le plugin dans l\'admin WordPress');
      }
    } catch (error) {
      console.log('⚠️ Installation automatique non disponible:', error.message);
      console.log('📋 Installation manuelle requise');
    }

    // 5. Créer des champs personnalisés pour les articles
    console.log('\n5️⃣ Configuration des champs personnalisés...');
    
    try {
      // Créer un article de test pour vérifier les champs
      const testPost = {
        title: 'Test Article Premium - ' + new Date().toISOString(),
        content: 'Article de test pour vérifier l\'automatisation',
        status: 'draft'
      };

      const postResponse = await wpApi.post('/wp-json/wp/v2/posts', testPost);
      const postId = postResponse.data.id;

      // Ajouter les métadonnées premium
      await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
        meta_key: 'access_level',
        meta_value: 'premium'
      });

      await wpApi.post(`/wp-json/wp/v2/posts/${postId}/meta`, {
        meta_key: 'price',
        meta_value: '29.90'
      });

      console.log('✅ Champs personnalisés configurés');
      console.log(`   Article de test créé (ID: ${postId})`);

      // Publier l'article pour déclencher l'automatisation
      console.log('\n6️⃣ Test de l\'automatisation...');
      
      await wpApi.post(`/wp-json/wp/v2/posts/${postId}`, {
        status: 'publish'
      });

      console.log('✅ Article publié, l\'automatisation devrait se déclencher');

      // Attendre un peu et vérifier si un produit a été créé
      console.log('\n7️⃣ Vérification de la création du produit...');
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      const productsResponse = await wpApi.get('/wp-json/wc/v3/products', {
        params: {
          search: testPost.title,
          per_page: 10
        }
      });

      const createdProduct = productsResponse.data.find(product => 
        product.meta_data?.some(meta => 
          meta.key === 'article_post_id' && meta.value == postId
        )
      );

      if (createdProduct) {
        console.log('🎉 SUCCÈS ! Produit WooCommerce créé automatiquement :');
        console.log(`   - ID: ${createdProduct.id}`);
        console.log(`   - Nom: ${createdProduct.name}`);
        console.log(`   - Prix: ${createdProduct.regular_price} CHF`);
        console.log(`   - Statut: ${createdProduct.status}`);
      } else {
        console.log('⚠️ Aucun produit créé automatiquement');
        console.log('   Vérifiez que le plugin est bien activé');
        console.log('   Vérifiez les logs WordPress pour les erreurs');
      }

      // Nettoyage
      console.log('\n8️⃣ Nettoyage...');
      await wpApi.delete(`/wp-json/wp/v2/posts/${postId}?force=true`);
      console.log('✅ Article de test supprimé');

    } catch (error) {
      console.log('❌ Erreur lors de la configuration:', error.message);
      if (error.response?.data) {
        console.log('Détails:', error.response.data);
      }
    }

    console.log('\n🎯 Installation terminée !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Activez le plugin dans l\'admin WordPress');
    console.log('2. Créez un article avec access_level = "premium" et price > 0');
    console.log('3. Le produit WooCommerce sera créé automatiquement !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'installation:', error);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter l'installation
installWordPressPremiumPlugin();

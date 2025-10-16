const axios = require('axios');

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your-project-id';
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testPremiumAutomation() {
  console.log('🧪 Test de l\'automatisation des articles premium...\n');

  if (!SANITY_TOKEN) {
    console.error('❌ SANITY_API_TOKEN manquant dans les variables d\'environnement');
    return;
  }

  try {
    // 1. Créer un article premium de test dans Sanity
    console.log('1️⃣ Création d\'un article premium de test...');
    
    const testArticle = {
      _type: 'post',
      title: `Test Automatisation Premium - ${new Date().toISOString()}`,
      slug: {
        _type: 'slug',
        current: `test-automatisation-premium-${Date.now()}`
      },
      accessLevel: 'premium',
      price: 29.90,
      excerpt: 'Article de test pour vérifier l\'automatisation WooCommerce',
      body: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Ceci est un article premium de test créé automatiquement pour vérifier que l\'intégration avec WooCommerce fonctionne correctement.'
            }
          ]
        }
      ],
      publishedAt: new Date().toISOString(),
      seo: {
        title: 'Test Automatisation Premium',
        description: 'Article de test pour l\'automatisation WooCommerce'
      }
    };

    const sanityClient = axios.create({
      baseURL: `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/${SANITY_DATASET}`,
      headers: {
        'Authorization': `Bearer ${SANITY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const createResponse = await sanityClient.post('', {
      mutations: [
        {
          create: testArticle
        }
      ]
    });

    const articleId = createResponse.data.results[0].id;
    console.log(`✅ Article créé avec l'ID: ${articleId}`);

    // 2. Attendre un peu pour que le webhook se déclenche
    console.log('\n2️⃣ Attente du traitement du webhook (5 secondes)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Vérifier que le produit WooCommerce a été créé
    console.log('\n3️⃣ Vérification de la création du produit WooCommerce...');
    
    const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
    const WORDPRESS_USER = process.env.WORDPRESS_USER || 'gibivawa';
    const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD || ')zH2TdGo(alNTOAi';

    const wpApi = axios.create({
      baseURL: WORDPRESS_URL,
      auth: {
        username: WORDPRESS_USER,
        password: WORDPRESS_PASSWORD
      }
    });

    // Chercher le produit créé
    const productsResponse = await wpApi.get('/wp-json/wc/v3/products', {
      params: {
        search: testArticle.title,
        per_page: 10
      }
    });

    const createdProduct = productsResponse.data.find(product => 
      product.meta_data?.some(meta => 
        meta.key === 'sanity_post_id' && meta.value === articleId
      )
    );

    if (createdProduct) {
      console.log('✅ Produit WooCommerce trouvé!');
      console.log(`   - ID: ${createdProduct.id}`);
      console.log(`   - Nom: ${createdProduct.name}`);
      console.log(`   - Prix: ${createdProduct.regular_price} CHF`);
      console.log(`   - Statut: ${createdProduct.status}`);
      console.log(`   - Type: ${createdProduct.type}`);
    } else {
      console.log('❌ Produit WooCommerce non trouvé');
      console.log('   Vérifiez les logs du webhook et de l\'API');
    }

    // 4. Test de l'API de création manuelle
    console.log('\n4️⃣ Test de l\'API de création manuelle...');
    
    try {
      const manualResponse = await axios.post(`${SITE_URL}/api/woocommerce/create-product`, {
        postId: articleId,
        title: testArticle.title,
        slug: testArticle.slug.current,
        price: testArticle.price,
        operation: 'test'
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET || 'default-secret'}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ API manuelle fonctionne:', manualResponse.data);
    } catch (error) {
      console.log('⚠️ Erreur API manuelle:', error.response?.data || error.message);
    }

    // 5. Nettoyage (optionnel)
    console.log('\n5️⃣ Nettoyage...');
    console.log('   Pour nettoyer, supprimez manuellement:');
    console.log(`   - Article Sanity: ${articleId}`);
    if (createdProduct) {
      console.log(`   - Produit WooCommerce: ${createdProduct.id}`);
    }

    console.log('\n🎉 Test terminé!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    if (error.response?.data) {
      console.error('Détails:', error.response.data);
    }
  }
}

// Exécuter le test
testPremiumAutomation();

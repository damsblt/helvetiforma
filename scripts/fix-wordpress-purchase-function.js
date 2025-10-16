const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';

const wordpressClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: { 'Content-Type': 'application/json' },
  auth: {
    username: process.env.WORDPRESS_USER || 'contact@helvetiforma.ch',
    password: process.env.WORDPRESS_PASSWORD || 'RWnb nSO6 6TMX yWd0 HWFl HBYh',
  },
});

const woocommerceClient = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json`,
  headers: { 'Content-Type': 'application/json' },
  auth: {
    username: process.env.WOOCOMMERCE_CONSUMER_KEY,
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET
  }
});

async function fixWordPressPurchaseFunction() {
  console.log('🔧 Correction de la fonction de vérification d\'achat...');
  console.log('='.repeat(60));
  
  const articleId = 3774;
  const userId = 193;
  
  try {
    // 1. Récupérer le produit WooCommerce
    console.log('🛒 Récupération du produit WooCommerce...');
    const productResponse = await woocommerceClient.get('/wc/v3/products', {
      params: { sku: `article-${articleId}`, per_page: 1 }
    });
    
    if (!productResponse.data || productResponse.data.length === 0) {
      console.log('❌ Produit WooCommerce non trouvé');
      return;
    }
    
    const product = productResponse.data[0];
    console.log('✅ Produit trouvé:', {
      id: product.id,
      name: product.name,
      sku: product.sku
    });
    
    // 2. Vérifier les commandes de l'utilisateur
    console.log('\n📦 Vérification des commandes de l\'utilisateur...');
    const ordersResponse = await woocommerceClient.get('/wc/v3/orders', {
      params: { customer: userId, per_page: 10 }
    });
    
    console.log(`   ${ordersResponse.data.length} commande(s) trouvée(s):`);
    let hasPurchased = false;
    
    ordersResponse.data.forEach((order, index) => {
      console.log(`   ${index + 1}. Commande ${order.id} - ${order.status} - ${order.total} CHF`);
      order.line_items.forEach(item => {
        console.log(`      - ${item.name} (Produit ID: ${item.product_id})`);
        if (item.product_id === product.id) {
          hasPurchased = true;
          console.log(`      ✅ L'utilisateur a acheté ce produit !`);
        }
      });
    });
    
    // 3. Tester la vérification d'achat actuelle
    console.log('\n🔐 Test de la vérification d\'achat actuelle...');
    const checkResponse = await wordpressClient.get('/helvetiforma/v1/check-purchase', {
      params: { postId: articleId.toString(), userId: userId.toString() }
    });
    console.log('   Réponse actuelle:', checkResponse.data);
    
    // 4. Afficher le code PHP corrigé
    console.log('\n💡 Code PHP corrigé pour la fonction check_user_purchase:');
    console.log('='.repeat(60));
    console.log(`
function check_user_purchase($request) {
  $user_id = get_current_user_id();
  $post_id = $request->get_param('postId');
  
  if (!$user_id) {
    return ['hasPurchased' => false, 'isAuthenticated' => false];
  }
  
  // Récupérer le SKU du produit WooCommerce lié à l'article
  $sku = "article-{$post_id}";
  
  // Chercher le produit WooCommerce par SKU
  $products = wc_get_products([
    'sku' => $sku,
    'limit' => 1
  ]);
  
  if (empty($products)) {
    return [
      'hasPurchased' => false,
      'isAuthenticated' => true,
      'debug' => 'Produit WooCommerce non trouvé'
    ];
  }
  
  $product = $products[0];
  $product_id = $product->get_id();
  
  // Vérifier si l'utilisateur a acheté ce produit
  $has_purchased = false;
  if (function_exists('wc_customer_bought_product')) {
    $has_purchased = wc_customer_bought_product('', $user_id, $product_id);
  }
  
  return [
    'hasPurchased' => $has_purchased,
    'isAuthenticated' => true,
    'debug' => [
      'post_id' => $post_id,
      'user_id' => $user_id,
      'product_id' => $product_id,
      'sku' => $sku
    ]
  ];
}
    `);
    
    console.log('\n📋 Instructions pour corriger WordPress:');
    console.log('1. Ouvrez le fichier functions.php de votre thème');
    console.log('2. Remplacez la fonction check_user_purchase par le code ci-dessus');
    console.log('3. Sauvegardez le fichier');
    console.log('4. Testez à nouveau la vérification d\'achat');
    
    console.log('\n🧪 Test manuel:');
    console.log(`   - Article ID: ${articleId}`);
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Product ID: ${product.id}`);
    console.log(`   - SKU: article-${articleId}`);
    console.log(`   - A acheté: ${hasPurchased ? 'OUI' : 'NON'}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

fixWordPressPurchaseFunction();

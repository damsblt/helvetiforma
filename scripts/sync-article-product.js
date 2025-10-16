#!/usr/bin/env node

/**
 * Manual Article-Product Sync Script
 * 
 * This script creates WooCommerce products for WordPress articles
 * Usage: node scripts/sync-article-product.js <postId> <title> <price>
 * Example: node scripts/sync-article-product.js 4559 "Test Article" 25
 */

const https = require('https');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

if (!WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
  console.error('❌ Missing WooCommerce credentials in environment variables');
  process.exit(1);
}

async function syncArticleProduct(postId, title, price) {
  const sku = `article-${postId}`;
  const auth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
  
  console.log(`🔄 Syncing article ${postId}: "${title}" (${price} CHF)`);
  
  // Check if product already exists
  const existingProducts = await makeRequest(`/wp-json/wc/v3/products?sku=${sku}`, 'GET');
  
  if (existingProducts.length > 0) {
    console.log(`📝 Product already exists, updating...`);
    const productId = existingProducts[0].id;
    
    const updateData = {
      name: title,
      regular_price: price.toString(),
      meta_data: [
        { key: '_post_id', value: postId.toString() },
        { key: '_helvetiforma_article', value: 'yes' }
      ]
    };
    
    const updatedProduct = await makeRequest(`/wp-json/wc/v3/products/${productId}`, 'PUT', updateData);
    console.log(`✅ Product updated: ID ${productId}, SKU: ${sku}`);
    return updatedProduct;
  } else {
    console.log(`➕ Creating new product...`);
    
    const createData = {
      name: title,
      type: 'simple',
      status: 'publish',
      featured: false,
      catalog_visibility: 'visible',
      description: `Premium article: ${title}`,
      short_description: `Access to premium content: ${title}`,
      sku: sku,
      regular_price: price.toString(),
      manage_stock: false,
      stock_status: 'instock',
      virtual: true,
      downloadable: false,
      meta_data: [
        { key: '_post_id', value: postId.toString() },
        { key: '_helvetiforma_article', value: 'yes' }
      ]
    };
    
    const newProduct = await makeRequest('/wp-json/wc/v3/products', 'POST', createData);
    console.log(`✅ Product created: ID ${newProduct.id}, SKU: ${sku}`);
    return newProduct;
  }
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(WORDPRESS_URL + path);
    const auth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${result.message || body}`));
          }
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node scripts/sync-article-product.js <postId> <title> <price>');
    console.log('Example: node scripts/sync-article-product.js 4559 "Test Article" 25');
    process.exit(1);
  }
  
  const [postId, title, price] = args;
  
  try {
    await syncArticleProduct(parseInt(postId), title, parseFloat(price));
    console.log('🎉 Sync completed successfully!');
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();

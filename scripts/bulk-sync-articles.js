#!/usr/bin/env node

/**
 * Bulk Article-Product Sync Script
 * 
 * This script syncs all WordPress articles with WooCommerce products
 * Usage: node scripts/bulk-sync-articles.js [--dry-run] [--force]
 */

const https = require('https');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const WORDPRESS_APP_USER = process.env.WORDPRESS_APP_USER;
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

if (!WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
  console.error('❌ Missing WooCommerce credentials in environment variables');
  process.exit(1);
}

if (!WORDPRESS_APP_USER || !WORDPRESS_APP_PASSWORD) {
  console.error('❌ Missing WordPress credentials in environment variables');
  process.exit(1);
}

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');

console.log(`🚀 Starting bulk sync${isDryRun ? ' (DRY RUN)' : ''}...`);

async function bulkSyncArticles() {
  try {
    // Fetch all published posts
    console.log('📥 Fetching WordPress posts...');
    const posts = await fetchWordPressPosts();
    
    if (!posts || posts.length === 0) {
      console.log('❌ No posts found');
      return;
    }

    console.log(`📊 Found ${posts.length} published posts`);

    let synced = 0;
    let skipped = 0;
    let errors = 0;
    const results = [];

    for (const post of posts) {
      try {
        // Get ACF data for this post
        const acfData = await fetchACFData(post.id);
        const accessLevel = acfData.access || acfData.access_level || 'public';
        const price = parseFloat(acfData.price) || 0;

        console.log(`\n📝 Processing post ${post.id}: "${post.title.rendered}"`);
        console.log(`   Access: ${accessLevel}, Price: ${price}`);

        // Only sync premium articles with valid price
        if (accessLevel === 'premium' && price > 0) {
          if (isDryRun) {
            console.log(`   🔍 [DRY RUN] Would sync as product: ${price} CHF`);
            results.push({
              postId: post.id,
              title: post.title.rendered,
              status: 'would_sync',
              accessLevel,
              price
            });
            synced++;
          } else {
            const result = await syncArticleProduct(post.id, post.title.rendered, post.content.rendered, price);
            console.log(`   ✅ Synced: Product ID ${result.id}, SKU: ${result.sku}`);
            results.push({
              postId: post.id,
              title: post.title.rendered,
              status: 'synced',
              productId: result.id,
              sku: result.sku,
              accessLevel,
              price
            });
            synced++;
          }
        } else {
          const reason = accessLevel !== 'premium' ? 'not_premium' : 'no_price';
          console.log(`   ⏭️ Skipped: ${reason}`);
          results.push({
            postId: post.id,
            title: post.title.rendered,
            status: 'skipped',
            reason,
            accessLevel,
            price
          });
          skipped++;
        }
      } catch (error) {
        console.error(`   ❌ Error processing post ${post.id}:`, error.message);
        results.push({
          postId: post.id,
          title: post.title.rendered,
          status: 'error',
          error: error.message
        });
        errors++;
      }
    }

    // Summary
    console.log('\n📊 Sync Summary:');
    console.log(`   ✅ Synced: ${synced}`);
    console.log(`   ⏭️ Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📝 Total: ${posts.length}`);

    // Save results to file
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sync-results-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${filename}`);

  } catch (error) {
    console.error('❌ Bulk sync failed:', error);
    process.exit(1);
  }
}

async function fetchWordPressPosts() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${WORDPRESS_APP_USER}:${WORDPRESS_APP_PASSWORD}`).toString('base64');
    
    const options = {
      hostname: new URL(WORDPRESS_URL).hostname,
      port: 443,
      path: '/wp-json/wp/v2/posts?per_page=100&status=publish',
      method: 'GET',
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
          const posts = JSON.parse(body);
          resolve(posts);
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function fetchACFData(postId) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${WORDPRESS_APP_USER}:${WORDPRESS_APP_PASSWORD}`).toString('base64');
    
    const options = {
      hostname: new URL(WORDPRESS_URL).hostname,
      port: 443,
      path: `/wp-json/wp/v2/posts/${postId}`,
      method: 'GET',
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
          const post = JSON.parse(body);
          // Try to get ACF data from meta or acf field
          const acfData = post.acf || {};
          resolve(acfData);
        } catch (error) {
          resolve({}); // Return empty object if ACF data not available
        }
      });
    });

    req.on('error', () => resolve({})); // Return empty object on error
    req.end();
  });
}

async function syncArticleProduct(postId, title, content, price) {
  const sku = `article-${postId}`;
  const auth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
  
  // Check if product already exists
  const existingProducts = await makeRequest(`/wp-json/wc/v3/products?sku=${sku}`, 'GET');
  
  if (existingProducts.length > 0) {
    // Update existing product
    const productId = existingProducts[0].id;
    const updateData = {
      name: title,
      description: content,
      regular_price: price.toString(),
      meta_data: [
        { key: '_post_id', value: postId.toString() },
        { key: '_helvetiforma_article', value: 'yes' }
      ]
    };
    
    return await makeRequest(`/wp-json/wc/v3/products/${productId}`, 'PUT', updateData);
  } else {
    // Create new product
    const createData = {
      name: title,
      type: 'simple',
      status: 'publish',
      featured: false,
      catalog_visibility: 'visible',
      description: content,
      short_description: content.substring(0, 200) + '...',
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
    
    return await makeRequest('/wp-json/wc/v3/products', 'POST', createData);
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

// Run the bulk sync
bulkSyncArticles();

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.helvetiforma.ch';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_1082d09580773bcad56caf213542171abbd8d076';

const baseUrl = `${WORDPRESS_URL}/wp-json/wc/v3`;
const auth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');

async function testWooCommerce() {
  try {
    console.log('Testing WooCommerce API...');
    console.log('Base URL:', baseUrl);
    console.log('Auth length:', auth.length);
    
    const response = await fetch(`${baseUrl}/products?per_page=5`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }

    const products = await response.json();
    console.log('Products found:', products.length);
    
    if (products.length > 0) {
      console.log('First product:', {
        id: products[0].id,
        name: products[0].name,
        meta_data: products[0].meta_data?.slice(0, 3)
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testWooCommerce();

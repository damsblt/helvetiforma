#!/usr/bin/env node

/**
 * Stripe for WooCommerce Configuration Script
 * Run this after installing the Stripe plugin manually
 */

const fetch = require('node-fetch');

const WORDPRESS_URL = 'https://api.helvetiforma.ch';
const WOOCOMMERCE_CONSUMER_KEY = 'ck_51c0c5e556a92972be092dda07cda8bc4975557b';
const WOOCOMMERCE_CONSUMER_SECRET = 'cs_1082d09580773bcad56caf213542171abbd8d076';

const auth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');

async function setupStripe() {
  try {
    console.log('🔍 Checking if Stripe plugin is installed...');
    
    // Check if Stripe gateway exists
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/payment_gateways`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    const gateways = await response.json();
    const stripeGateway = gateways.find(gateway => gateway.id === 'stripe');
    
    if (!stripeGateway) {
      console.log('❌ Stripe plugin not found. Please install "WooCommerce Stripe Gateway" plugin first.');
      console.log('📝 Steps:');
      console.log('1. Go to WordPress Admin → Plugins → Add New');
      console.log('2. Search for "WooCommerce Stripe Gateway"');
      console.log('3. Install and activate the plugin');
      console.log('4. Run this script again');
      return;
    }

    console.log('✅ Stripe plugin found!');
    console.log('🔧 Configuring Stripe gateway...');

    // Enable Stripe gateway
    const stripeConfig = {
      enabled: true,
      settings: {
        testmode: {
          value: 'yes' // Enable test mode for testing
        },
        test_publishable_key: {
          value: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE' // Replace with your test publishable key
        },
        test_secret_key: {
          value: 'sk_test_YOUR_SECRET_KEY_HERE' // Replace with your test secret key
        },
        publishable_key: {
          value: 'pk_live_YOUR_PUBLISHABLE_KEY_HERE' // Replace with your live publishable key
        },
        secret_key: {
          value: 'sk_live_YOUR_SECRET_KEY_HERE' // Replace with your live secret key
        },
        title: {
          value: 'Carte de crédit (Stripe)'
        },
        description: {
          value: 'Paiement sécurisé par carte de crédit via Stripe'
        }
      }
    };

    const updateResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/payment_gateways/stripe`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stripeConfig)
    });

    if (updateResponse.ok) {
      console.log('✅ Stripe gateway configured successfully!');
      console.log('📝 Next steps:');
      console.log('1. Get your Stripe API keys from https://dashboard.stripe.com/');
      console.log('2. Replace the placeholder keys in this script');
      console.log('3. Run the script again to update with real keys');
    } else {
      const error = await updateResponse.text();
      console.log('❌ Error configuring Stripe:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupStripe();

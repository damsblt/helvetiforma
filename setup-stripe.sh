#!/bin/bash

# Stripe for WooCommerce Configuration Script
# Run this after installing the Stripe plugin manually

WORDPRESS_URL="https://api.helvetiforma.ch"
WOOCOMMERCE_CONSUMER_KEY="ck_51c0c5e556a92972be092dda07cda8bc4975557b"
WOOCOMMERCE_CONSUMER_SECRET="cs_1082d09580773bcad56caf213542171abbd8d076"

echo "🔍 Checking if Stripe plugin is installed..."

# Check if Stripe gateway exists
response=$(curl -s "${WORDPRESS_URL}/wp-json/wc/v3/payment_gateways" \
  -H "Authorization: Basic $(echo -n "${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}" | base64)")

if echo "$response" | grep -q '"id":"stripe"'; then
  echo "✅ Stripe plugin found!"
  echo "🔧 Configuring Stripe gateway..."
  
  # Configure Stripe gateway
  curl -X PUT "${WORDPRESS_URL}/wp-json/wc/v3/payment_gateways/stripe" \
    -H "Authorization: Basic $(echo -n "${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}" | base64)" \
    -H "Content-Type: application/json" \
    -d '{
      "enabled": true,
      "settings": {
        "testmode": {
          "value": "yes"
        },
        "test_publishable_key": {
          "value": "pk_test_YOUR_PUBLISHABLE_KEY_HERE"
        },
        "test_secret_key": {
          "value": "sk_test_YOUR_SECRET_KEY_HERE"
        },
        "title": {
          "value": "Carte de crédit (Stripe)"
        },
        "description": {
          "value": "Paiement sécurisé par carte de crédit via Stripe"
        }
      }
    }'
  
  echo ""
  echo "✅ Stripe gateway configured!"
  echo "📝 Next steps:"
  echo "1. Get your Stripe API keys from https://dashboard.stripe.com/"
  echo "2. Update the keys in WooCommerce settings"
  echo "3. Test the payment flow"
else
  echo "❌ Stripe plugin not found."
  echo "📝 Please install 'WooCommerce Stripe Gateway' plugin first:"
  echo "1. Go to WordPress Admin → Plugins → Add New"
  echo "2. Search for 'WooCommerce Stripe Gateway'"
  echo "3. Install and activate the plugin"
  echo "4. Run this script again"
fi

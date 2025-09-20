#!/bin/bash

echo "Adding environment variables to Vercel..."

# WooCommerce API Credentials
echo "Adding WOOCOMMERCE_CONSUMER_KEY..."
echo "ck_51c0c5e556a92972be092dda07cda8bc4975557b" | vercel env add WOOCOMMERCE_CONSUMER_KEY production

echo "Adding WOOCOMMERCE_CONSUMER_SECRET..."
echo "cs_1082d09580773bcad56caf213542171abbd8d076" | vercel env add WOOCOMMERCE_CONSUMER_SECRET production

# WordPress Application Password
echo "Adding WORDPRESS_APP_PASSWORD..."
echo "your_wordpress_app_password_here" | vercel env add WORDPRESS_APP_PASSWORD production

# Tutor LMS Client ID
echo "Adding TUTOR_CLIENT_ID..."
echo "your_tutor_client_id_here" | vercel env add TUTOR_CLIENT_ID production

# Default Course ID
echo "Adding DEFAULT_COURSE_ID..."
echo "24" | vercel env add DEFAULT_COURSE_ID production

# Update TUTOR_API_URL for all environments
echo "Updating TUTOR_API_URL..."
echo "https://api.helvetiforma.ch" | vercel env add TUTOR_API_URL production

echo "Environment variables added successfully!"
echo "Run 'vercel env ls' to verify all variables are set."

#!/bin/bash

# Vercel Environment Variables Setup Script
# This script adds all required environment variables to Vercel
# IMPORTANT: Replace all placeholder values with actual credentials before running

echo "🚀 Setting up Vercel environment variables..."

# WordPress Configuration
echo "Adding WordPress configuration..."
vercel env add NEXT_PUBLIC_WORDPRESS_URL production <<< "https://api.helvetiforma.ch"
vercel env add TUTOR_API_URL production <<< "https://api.helvetiforma.ch"
vercel env add TUTOR_LICENSE_KEY production <<< "YOUR_TUTOR_LICENSE_KEY"
vercel env add TUTOR_CLIENT_ID production <<< "YOUR_TUTOR_CLIENT_ID"
vercel env add TUTOR_SECRET_KEY production <<< "YOUR_TUTOR_SECRET_KEY"
vercel env add WORDPRESS_APP_PASSWORD production <<< "YOUR_WORDPRESS_APP_PASSWORD"

# WooCommerce API Credentials (CRITICAL)
echo "Adding WooCommerce API credentials..."
vercel env add WOOCOMMERCE_CONSUMER_KEY production <<< "YOUR_WOOCOMMERCE_CONSUMER_KEY"
vercel env add WOOCOMMERCE_CONSUMER_SECRET production <<< "YOUR_WOOCOMMERCE_CONSUMER_SECRET"

# Site URLs (IMPORTANT - Fixes undefined URL issues)
echo "Adding site URLs..."
vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://helvetiforma.vercel.app"
vercel env add NEXT_PUBLIC_API_URL production <<< "https://helvetiforma.vercel.app"

# Supabase Configuration
echo "Adding Supabase configuration..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "YOUR_SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "YOUR_SUPABASE_ANON_KEY"

# Stripe API Credentials
echo "Adding Stripe configuration..."
vercel env add STRIPE_SECRET_KEY production <<< "YOUR_STRIPE_SECRET_KEY"
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production <<< "YOUR_STRIPE_PUBLISHABLE_KEY"

# Stripe Domain IDs
vercel env add STRIPE_MAIN_DOMAIN_ID production <<< "YOUR_STRIPE_MAIN_DOMAIN_ID"
vercel env add STRIPE_API_DOMAIN_ID production <<< "YOUR_STRIPE_API_DOMAIN_ID"

# Application Settings
echo "Adding application settings..."
vercel env add DEFAULT_COURSE_ID production <<< "YOUR_DEFAULT_COURSE_ID"
vercel env add NODE_ENV production <<< "production"
vercel env add REVALIDATE_SECRET production <<< "YOUR_REVALIDATE_SECRET"

echo "✅ All environment variables added successfully!"
echo "🔄 Redeploying application..."

# Redeploy the application
vercel --prod

echo "🎉 Deployment complete! Test your WooCommerce API endpoints:"
echo "   - https://helvetiforma.vercel.app/api/woocommerce/products"
echo "   - https://helvetiforma.vercel.app/api/woocommerce/course-products"

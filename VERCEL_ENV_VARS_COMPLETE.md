# Vercel Environment Variables - Complete Setup Guide

This guide contains all the environment variables needed for successful Vercel deployment with WooCommerce API integration.

## 🚀 Quick Setup

### 1. Go to Vercel Dashboard
- Visit [Vercel Dashboard](https://vercel.com/dashboard)
- Select your `helvetiforma` project
- Go to **Settings** → **Environment Variables**

### 2. Add These Variables (Production Environment)

```env
# WordPress Configuration
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
TUTOR_API_URL=https://api.helvetiforma.ch
TUTOR_LICENSE_KEY=EC00F-9DF58-E44EC-E68BC-1757919356
TUTOR_CLIENT_ID=key_41b07de3d8e6e2d21df756ed2dff73ad
TUTOR_SECRET_KEY=secret_c59d6489d2bb179380853bed081688c8d2a86b9e471f34ec44660359597f127f
WORDPRESS_APP_PASSWORD=L6Mr kZYj rqIc fMhE ex89 LMqP

# WooCommerce API Credentials (Use your actual keys from .env.local)
WOOCOMMERCE_CONSUMER_KEY=ck_your_woocommerce_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_woocommerce_consumer_secret_here

# Site URLs (IMPORTANT - Fixes undefined URL issues)
NEXT_PUBLIC_SITE_URL=https://helvetiforma.vercel.app
NEXT_PUBLIC_API_URL=https://helvetiforma.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qdylfeltqwvfhrnxjrek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_pFlvHkzbkx3Zg-Dc6R-l1g_XSdHaRgy

# Stripe API Credentials (Use your actual keys from .env.local)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Stripe Domain IDs (Use your actual domain IDs from .env.local)
STRIPE_MAIN_DOMAIN_ID=pmd_your_main_domain_id_here
STRIPE_API_DOMAIN_ID=pmd_your_api_domain_id_here

# Application Settings
DEFAULT_COURSE_ID=24
NODE_ENV=production

# Frontend Revalidation
REVALIDATE_SECRET=helvetiforma-revalidation-secret-2025
```

## 🔧 Environment-Specific Settings

### Production Environment
- Set all variables above
- Use production URLs
- Use live Stripe keys (when ready)

### Preview Environment
- Same as production but with preview URLs
- Use test Stripe keys

### Development Environment
- Use localhost URLs
- Use test Stripe keys

## 🎯 Key Fixes Applied

### 1. Fixed Undefined URL Issues
- Added `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL`
- Updated Next.js config with proper fallbacks
- Disabled static export mode for API routes

### 2. WooCommerce API Configuration
- Proper authentication headers
- CORS configuration in vercel.json
- Retry logic and error handling

### 3. Next.js Configuration
- Environment-aware URL fallbacks
- Proper API route support
- Optimized for Vercel deployment

## 🧪 Testing After Deployment

### 1. Test WooCommerce API Endpoints
```bash
# Test products endpoint
curl https://helvetiforma.vercel.app/api/woocommerce/products

# Test course products endpoint
curl https://helvetiforma.vercel.app/api/woocommerce/course-products

# Test individual product
curl https://helvetiforma.vercel.app/api/woocommerce/products/175
```

### 2. Expected Responses
- Status: 200
- Content-Type: application/json
- Success: true
- Data: Array of products

### 3. Check for Errors
- No undefined URLs in frontend
- No CORS errors
- No authentication failures
- Products display correctly

## 🚨 Troubleshooting

### If WooCommerce API Fails
1. Check environment variables are set correctly
2. Verify WordPress URL is accessible
3. Check WooCommerce API credentials
4. Look at Vercel function logs

### If Frontend Shows Undefined URLs
1. Verify `NEXT_PUBLIC_SITE_URL` is set
2. Check `NEXT_PUBLIC_API_URL` is set
3. Ensure no trailing slashes in URLs
4. Check Next.js config fallbacks

### If CORS Errors Occur
1. Check vercel.json CORS headers
2. Verify WordPress CORS configuration
3. Check API endpoint responses

## 📋 Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Next.js config updated for production
- [ ] Vercel.json CORS headers configured
- [ ] WooCommerce API credentials valid
- [ ] WordPress URL accessible
- [ ] Deploy to Vercel
- [ ] Test API endpoints
- [ ] Verify frontend functionality
- [ ] Check for undefined URLs
- [ ] Test product display

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check browser console for errors

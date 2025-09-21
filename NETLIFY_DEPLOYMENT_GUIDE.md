# Netlify Deployment Guide for Helvetiforma

This guide will help you deploy your Helvetiforma application to Netlify, which should resolve the WooCommerce API access issues you were experiencing with Vercel.

## Prerequisites

1. A Netlify account (free tier is sufficient)
2. Your project code in a Git repository (GitHub, GitLab, or Bitbucket)
3. All environment variables ready

## Step 1: Prepare Your Repository

1. **Commit all changes** to your Git repository:
   ```bash
   git add .
   git commit -m "Configure for Netlify deployment"
   git push origin main
   ```

2. **Install new dependencies** (if not already done):
   ```bash
   npm install
   ```

## Step 2: Deploy to Netlify

### Option A: Deploy from Git (Recommended)

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your `helvetiforma` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
   - **Node version**: `18` (in Environment variables)

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy your site:
   ```bash
   netlify deploy --prod
   ```

## Step 3: Configure Environment Variables

1. In your Netlify dashboard, go to **Site settings** > **Environment variables**
2. Add the following variables (copy from `netlify-env.example`):

### Required Environment Variables

```bash
# WordPress Configuration
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch

# Tutor LMS Pro Configuration
TUTOR_API_URL=https://api.helvetiforma.ch
TUTOR_LICENSE_KEY=your_tutor_license_key_here
TUTOR_CLIENT_ID=your_tutor_client_id_here
TUTOR_SECRET_KEY=your_tutor_secret_key_here

# WordPress Application Password
WORDPRESS_APP_PASSWORD=your_wordpress_app_password_here

# WooCommerce API Credentials
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe API Credentials
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Stripe Domain IDs
STRIPE_MAIN_DOMAIN_ID=pmd_1S99tXLajjczdCNE7TnUhyRK
STRIPE_API_DOMAIN_ID=pmd_1S99qFLajjczdCNEDSutOBaV

# Default Course ID
DEFAULT_COURSE_ID=24

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-netlify-app.netlify.app

# Frontend Revalidation
REVALIDATE_SECRET=your-revalidation-secret-key-here

# API Configuration
NEXT_PUBLIC_API_URL=https://api.informaniak.com
```

## Step 4: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Click "Add custom domain"
3. Enter your domain (e.g., `helvetiforma.ch`)
4. Follow the DNS configuration instructions
5. Update the `NEXT_PUBLIC_SITE_URL` environment variable with your custom domain

## Step 5: Test Your Deployment

1. **Check the build logs** in Netlify dashboard for any errors
2. **Test WooCommerce API access** by visiting your site and trying to:
   - View courses
   - Add items to cart
   - Process payments
3. **Test all major features**:
   - User registration
   - Course enrollment
   - Payment processing
   - Student dashboard

## Step 6: Monitor and Debug

### Build Logs
- Check **Deploys** tab in Netlify dashboard for build status
- Look for any errors in the build logs

### Function Logs
- If using Netlify Functions, check **Functions** tab for runtime logs

### Network Issues
- Use browser dev tools to check for CORS errors
- Verify API endpoints are accessible

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (should be 18)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Access Issues**
   - Verify environment variables are set correctly
   - Check CORS configuration in `netlify.toml`
   - Test API endpoints directly

3. **Static Export Issues**
   - Ensure `output: 'export'` is set in `next.config.ts`
   - Check for server-side code that needs to be moved to client-side

4. **WooCommerce API Issues**
   - Verify API credentials are correct
   - Check if your WordPress site allows CORS from Netlify domain
   - Test API endpoints with tools like Postman

### Debug Commands

```bash
# Test build locally
npm run build

# Check static export
ls -la out/

# Test environment variables
echo $NEXT_PUBLIC_API_URL
```

## Advantages of Netlify over Vercel

1. **Better CORS handling** for external APIs
2. **More flexible redirects** for API proxying
3. **Static site generation** with better performance
4. **Easier environment variable management**
5. **Better support for external API integrations**

## Next Steps

1. **Monitor performance** using Netlify Analytics
2. **Set up form handling** if needed (Netlify Forms)
3. **Configure CDN** for better global performance
4. **Set up automated deployments** from your Git repository

## Support

If you encounter issues:
1. Check Netlify's documentation: https://docs.netlify.com/
2. Review build logs in Netlify dashboard
3. Test API endpoints independently
4. Check browser console for client-side errors

---

**Note**: This configuration uses static site generation with API proxying to your external WordPress/WooCommerce API, which should resolve the CORS and API access issues you experienced with Vercel.

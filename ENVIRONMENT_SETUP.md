# 🔧 Environment Variables Setup

This guide shows you how to set up your environment variables for HelvetiForma v3.

## 📁 Required Files

Create these files in your project root:

### `.env.local` (for local development)
```bash
# ===========================================
# HelvetiForma v3 - Local Development
# ===========================================

# Microsoft OAuth & Teams Integration
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=your-microsoft-tenant-id
MICROSOFT_CALENDAR_USER=info@helvetiforma.ch

# NextAuth.js Configuration
AUTH_SECRET=your-auth-secret-here
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# WordPress/TutorLMS Integration (Optional - has fallback)
NEXT_PUBLIC_WORDPRESS_URL=https://cms.helvetiforma.ch
WORDPRESS_APP_USER=your-wordpress-app-user
WORDPRESS_APP_PASSWORD=your-wordpress-app-password

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `.env` (for production)
```bash
# ===========================================
# HelvetiForma v3 - Production
# ===========================================

# Microsoft OAuth & Teams Integration
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=your-microsoft-tenant-id
MICROSOFT_CALENDAR_USER=info@helvetiforma.ch

# NextAuth.js Configuration
AUTH_SECRET=your-auth-secret-here
AUTH_URL=https://helvetiforma.vercel.app
NEXTAUTH_URL=https://helvetiforma.vercel.app

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# WordPress/TutorLMS Integration (Optional - has fallback)
NEXT_PUBLIC_WORDPRESS_URL=https://cms.helvetiforma.ch
WORDPRESS_APP_USER=your-wordpress-app-user
WORDPRESS_APP_PASSWORD=your-wordpress-app-password

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://helvetiforma.vercel.app
```

## 🔐 Security Notes

### For Production Deployment:
1. **Generate a new AUTH_SECRET** for production:
   ```bash
   openssl rand -base64 32
   ```

2. **Update URLs** to match your production domain:
   - Replace `helvetiforma.vercel.app` with your actual domain
   - Update `AUTH_URL` and `NEXTAUTH_URL` accordingly

3. **Verify Microsoft App Registration**:
   - Ensure redirect URIs include your production domain
   - Check that all required permissions are granted

## 📋 Environment Variables Explained

### Required Variables:
- **MICROSOFT_CLIENT_ID**: Azure AD App Registration Client ID
- **MICROSOFT_CLIENT_SECRET**: Azure AD App Registration Client Secret
- **MICROSOFT_TENANT_ID**: Azure AD Tenant ID
- **MICROSOFT_CALENDAR_USER**: Microsoft account email for calendar access (default: damien@helvetiforma.onmicrosoft.com)
- **AUTH_SECRET**: NextAuth.js secret key (generate with openssl)
- **AUTH_URL**: Base URL for authentication (must match your domain)
- **NEXTAUTH_URL**: Public URL for NextAuth.js (must match your domain)
- **NEXT_PUBLIC_SANITY_PROJECT_ID**: Sanity CMS project ID
- **NEXT_PUBLIC_SANITY_DATASET**: Sanity CMS dataset name

### Optional Variables:
- **NEXT_PUBLIC_WORDPRESS_URL**: WordPress site URL (has fallback)
- **WORDPRESS_APP_USER**: WordPress application user
- **WORDPRESS_APP_PASSWORD**: WordPress application password
- **NEXT_PUBLIC_SITE_URL**: Site base URL for metadata

## 🚀 Vercel Deployment

For Vercel deployment, add these environment variables in your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from the production `.env` file above
4. Make sure to set the correct environment (Production, Preview, Development)

## ✅ Verification

After setting up environment variables:

1. **Local Development**:
   ```bash
   npm run dev
   ```
   - Check that the app starts without errors
   - Test Microsoft login at `/login`
   - Verify calendar loads at `/calendrier`

2. **Production Build**:
   ```bash
   npm run build
   ```
   - Ensure build completes successfully
   - No environment variable errors in build logs

## 🔧 Troubleshooting

### Common Issues:
1. **"Invalid client" error**: Check MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET
2. **"Invalid redirect URI"**: Update Azure AD app registration with correct URLs
3. **"AUTH_SECRET not set"**: Generate and set AUTH_SECRET
4. **Sanity content not loading**: Verify NEXT_PUBLIC_SANITY_PROJECT_ID

### Debug Mode:
Set `NODE_ENV=development` to enable debug logging in NextAuth.js.

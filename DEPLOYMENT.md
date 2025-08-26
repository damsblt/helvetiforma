# Next.js Frontend Deployment Guide - Vercel

## Prerequisites

- Vercel account (free tier available)
- GitHub repository with your frontend code
- Domain registered (informaniak.com)
- Backend API deployed and accessible

## Step 1: Vercel Account Setup

### 1.1 Create Vercel Account
1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up** with GitHub account
3. **Verify email** address
4. **Complete profile** setup

### 1.2 Install Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

## Step 2: Project Preparation

### 2.1 Environment Configuration
Update `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.informaniak.com',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://informaniak.com',
  },
  images: {
    domains: ['api.informaniak.com', 'localhost'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
```

### 2.2 Vercel Configuration
Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "functions": {
    "app/**/*.tsx": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.informaniak.com/api/$1"
    }
  ]
}
```

### 2.3 Update API Calls
Ensure all API calls use environment variables:
```typescript
// utils/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.informaniak.com';

export const fetchFormations = async () => {
  const response = await fetch(`${API_URL}/api/formations?populate=*`);
  return response.json();
};
```

## Step 3: Deployment Methods

### 3.1 Method 1: Vercel CLI (Recommended)

```bash
# Navigate to frontend directory
cd helvetiforma-frontend

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy? → Yes
# - Which scope? → Your account
# - Link to existing project? → No
# - Project name? → helvetiforma-frontend
# - Directory? → ./
# - Override settings? → No
```

### 3.2 Method 2: GitHub Integration

1. **Connect GitHub repository** in Vercel dashboard
2. **Import project** from GitHub
3. **Configure build settings**:
   - Framework Preset: Next.js
   - Root Directory: `helvetiforma-frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3.3 Method 3: Vercel Dashboard

1. **Go to Vercel dashboard**
2. **Click "New Project"**
3. **Import Git repository**
4. **Configure project settings**
5. **Deploy**

## Step 4: Environment Variables

### 4.1 Set Environment Variables in Vercel

Go to **Project Settings → Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://api.informaniak.com
NEXT_PUBLIC_SITE_URL=https://informaniak.com
```

### 4.2 Environment Variables by Environment

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.informaniak.com
NEXT_PUBLIC_SITE_URL=https://informaniak.com
```

**Preview (staging):**
```env
NEXT_PUBLIC_API_URL=https://api-staging.informaniak.com
NEXT_PUBLIC_SITE_URL=https://staging.informaniak.com
```

**Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 5: Custom Domain Configuration

### 5.1 Add Custom Domain

1. **Go to Vercel dashboard → Domains**
2. **Add domain**: `informaniak.com`
3. **Configure DNS records** as instructed by Vercel

### 5.2 DNS Configuration

**A Records:**
```
@ → 76.76.19.34 (Vercel IP)
```

**CNAME Records:**
```
www → informaniak.com
```

### 5.3 SSL Certificate

Vercel automatically provisions SSL certificates for custom domains.

## Step 6: Performance Optimization

### 6.1 Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/profile-picture.png"
  alt="Profile"
  width={200}
  height={200}
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 6.2 Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

### 6.3 Caching Strategy

```typescript
// Add caching headers
export async function generateStaticParams() {
  // Pre-generate static pages
  return [
    { slug: 'formations' },
    { slug: 'docs' },
    // ... other static pages
  ];
}

// Add revalidation
export const revalidate = 3600; // Revalidate every hour
```

## Step 7: Monitoring & Analytics

### 7.1 Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics
```

```typescript
// Add to _app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### 7.2 Google Analytics

```bash
# Install Google Analytics
npm install nextjs-google-analytics
```

```typescript
// Add to _app.tsx
import { GoogleAnalytics } from 'nextjs-google-analytics';

export default function App({ Component, pageProps }) {
  return (
    <>
      <GoogleAnalytics trackPageViews />
      <Component {...pageProps} />
    </>
  );
}
```

### 7.3 Error Tracking

```bash
# Install Sentry
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
});
```

## Step 8: Security Configuration

### 8.1 Content Security Policy

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
          }
        ]
      }
    ];
  }
};
```

### 8.2 Environment Variables Security

Never expose sensitive data in client-side code:
```typescript
// ❌ Don't do this
const API_KEY = process.env.API_KEY; // Exposed to client

// ✅ Do this
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // Only if needed on client
```

## Step 9: Testing & Quality Assurance

### 9.1 Pre-deployment Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build

# Start production server locally
npm start
```

### 9.2 Performance Testing

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse
lhci autorun
```

### 9.3 Cross-browser Testing

- Test on Chrome, Firefox, Safari, Edge
- Test on mobile devices
- Test responsive design

## Step 10: Continuous Deployment

### 10.1 Automatic Deployments

Vercel automatically deploys on:
- **Push to main branch** → Production
- **Pull requests** → Preview deployments
- **Manual deployment** → Via dashboard

### 10.2 Deployment Settings

Configure in Vercel dashboard:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 10.3 Branch Protection

1. **Enable branch protection** in GitHub
2. **Require status checks** to pass
3. **Require pull request reviews**
4. **Automatically delete head branches**

## Troubleshooting

### Common Issues:

1. **Build failures**:
   ```bash
   # Check build logs in Vercel dashboard
   # Verify all dependencies are installed
   # Check for TypeScript errors
   ```

2. **Environment variables not working**:
   ```bash
   # Verify variables are set in Vercel dashboard
   # Check variable names match code
   # Ensure variables are prefixed with NEXT_PUBLIC_
   ```

3. **API calls failing**:
   ```bash
   # Check CORS configuration on backend
   # Verify API URL is correct
   # Check network tab in browser dev tools
   ```

4. **Images not loading**:
   ```bash
   # Verify image domains in next.config.ts
   # Check image paths are correct
   # Ensure images are in public directory
   ```

### Useful Commands:

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# Rollback to previous deployment
vercel rollback

# List deployments
vercel ls
```

## Performance Checklist

- [ ] Images optimized with Next.js Image component
- [ ] Bundle size analyzed and optimized
- [ ] Static pages pre-generated where possible
- [ ] Caching headers configured
- [ ] CDN enabled for static assets
- [ ] Core Web Vitals optimized
- [ ] Lighthouse score > 90
- [ ] Mobile performance tested

## Security Checklist

- [ ] Environment variables secured
- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] Security headers enabled
- [ ] Dependencies updated regularly
- [ ] No sensitive data in client code
- [ ] Input validation implemented
- [ ] XSS protection enabled

## Monitoring Checklist

- [ ] Vercel Analytics enabled
- [ ] Google Analytics configured
- [ ] Error tracking set up
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Alert notifications enabled
- [ ] Log aggregation configured
- [ ] Backup strategy in place 
# Sanity CMS Setup

This directory contains the Sanity Studio configuration for Helvetiforma.

## Project Information
- **Project ID**: `xzzyyelh`
- **Dataset**: `production`
- **Studio URL**: https://www.sanity.io/manage/personal/project/xzzyyelh

## Getting Started

### 1. Run Studio Locally
```bash
npm run dev
```
This will start the Sanity Studio at `http://localhost:3333`

### 2. Deploy Studio to Sanity Hosting
```bash
npm run build
npx sanity deploy
```

### 3. Get API Token
1. Go to https://www.sanity.io/manage/personal/project/xzzyyelh/api/tokens
2. Create a new token with **Viewer** permissions (or **Editor** if you need write access)
3. Add the token to Vercel:
```bash
vercel env add SANITY_API_TOKEN production
```

## Content Schema

### Pages Collection
- **title**: Page title
- **slug**: URL slug
- **description**: Page description (SEO)
- **hero**: Hero section with title, subtitle, background image, and CTA
- **sections**: Flexible sections with:
  - Title and subtitle
  - Rich text content (Portable Text)
  - Configurable columns (1, 2, or 3)

## CORS Configuration

To allow your frontend to access the Sanity API, add your domains:
```bash
npx sanity cors add https://helvetiforma-v3.vercel.app --credentials
npx sanity cors add https://helvetiforma.vercel.app --credentials
npx sanity cors add http://localhost:3000 --credentials
```


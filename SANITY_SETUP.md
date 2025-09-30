# Sanity CMS - Quick Setup Guide

## ✅ What's Already Done:
1. ✅ Sanity Studio installed in `/sanity` directory
2. ✅ Schema created for Pages with flexible sections
3. ✅ Sanity client configured in `src/lib/sanity.ts`
4. ✅ Environment variables added to Vercel:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID=xzzyyelh`
   - `NEXT_PUBLIC_SANITY_DATASET=production`

## 🚀 Next Steps (Do These Manually):

### 1. Authenticate with Sanity
Open your browser and go to:
```
https://www.sanity.io/manage/personal/project/xzzyyelh
```
Log in with **Google** or **GitHub**.

### 2. Configure CORS (Important!)
Run these commands after logging into Sanity:
```bash
cd sanity
npx sanity login
npx sanity cors add https://helvetiforma-v3.vercel.app --credentials
npx sanity cors add https://helvetiforma.vercel.app --credentials
npx sanity cors add http://localhost:3000 --credentials
```

### 3. Start Sanity Studio Locally
```bash
cd sanity
npm run dev
```
Studio will open at: http://localhost:3333

### 4. Create Your First Page in Sanity
1. Go to http://localhost:3333
2. Create a new **Page** document
3. Set the slug to `home` for the homepage
4. Add hero section and flexible content sections
5. Publish!

### 5. (Optional) Get API Token for Write Access
If you need to write content programmatically:
1. Go to: https://www.sanity.io/manage/personal/project/xzzyyelh/api/tokens
2. Create token with **Editor** permissions
3. Add to Vercel:
```bash
vercel env add SANITY_API_TOKEN production
```

### 6. Deploy Sanity Studio (Optional)
If you want to host the Studio on Sanity's hosting:
```bash
cd sanity
npm run build
npx sanity deploy
```

## 📝 How It Works

### Frontend Fetches Data:
Your Next.js app (`helvetiforma-v3`) uses `src/lib/sanity.ts` to fetch content:
```typescript
import { getPageBySlug } from '@/lib/sanity'

const page = await getPageBySlug('home')
```

### Data Structure:
```typescript
{
  title: "Welcome to Helvetiforma",
  slug: "home",
  hero: {
    title: "Hero Title",
    subtitle: "Hero Subtitle",
    backgroundImage: { ... }
  },
  sections: [
    {
      title: "Section Title",
      content: [...], // Rich text
      columns: 2
    }
  ]
}
```

## 🎨 Why Sanity is Better:

1. **Mature & Stable**: Battle-tested by thousands of production sites
2. **No Database Setup**: Sanity hosts everything
3. **Real-time Collaboration**: Multiple editors can work simultaneously
4. **Powerful Queries**: GROQ query language (better than GraphQL for content)
5. **Great Developer Experience**: Best-in-class TypeScript support
6. **Free Tier**: Generous limits for small projects

## 🔗 Useful Links:
- **Sanity Management**: https://www.sanity.io/manage
- **Your Project**: https://www.sanity.io/manage/personal/project/xzzyyelh
- **Sanity Docs**: https://www.sanity.io/docs
- **GROQ Docs**: https://www.sanity.io/docs/groq


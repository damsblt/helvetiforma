# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Requirements

### 1. Environment Variables (CRITICAL)
Ensure these are set in your Vercel environment:

```bash
# WordPress API
NEXT_PUBLIC_WORDPRESS_API_URL=https://www.helvetiforma.ch/wp-json

# Supabase (REQUIRED for production)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development flag (MUST be false or removed for production)
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
```

### 2. Supabase Database Setup
- [ ] `sessions` table exists in Supabase
- [ ] Table has correct schema:
  ```sql
  id: int8 (primary key)
  date: timestamptz
  formation: int8
  duration: int4
  created_at: timestamptz
  updated_at: timestamptz
  ```

### 3. Code Verification
- [ ] No hardcoded `localhost:1337` URLs
- [ ] All API calls use relative paths (`/api/...`)
- [ ] Storage detection prioritizes Supabase in production
- [ ] Local storage fallback only works in development

## 🔒 Security Checklist

- [ ] Supabase RLS (Row Level Security) policies configured
- [ ] Environment variables are not exposed in client-side code
- [ ] API routes have proper error handling
- [ ] No sensitive data in console logs (production)

## 🧪 Testing Before Deployment

### Local Development
```bash
# Test with Supabase
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
npm run dev

# Test with local storage
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
npm run dev
```

### Production Simulation
```bash
# Build test
npm run build

# Start production server
npm start
```

## 🚨 Deployment Failures to Watch For

### 1. Supabase Connection Issues
- **Error**: "Supabase connection required for production"
- **Cause**: Missing or invalid Supabase credentials
- **Fix**: Verify environment variables in Vercel

### 2. Database Schema Issues
- **Error**: "relation 'sessions' does not exist"
- **Cause**: Missing database table
- **Fix**: Create sessions table in Supabase

### 3. Environment Variable Issues
- **Error**: "Cannot read property 'NEXT_PUBLIC_SUPABASE_URL'"
- **Cause**: Environment variables not loaded
- **Fix**: Check Vercel environment configuration

## 📋 Post-Deployment Verification

- [ ] Admin calendar loads without errors
- [ ] Sessions can be created/edited/deleted
- [ ] Formations display correctly
- [ ] Dashboard loads without "Failed to fetch" errors
- [ ] All admin functions work properly

## 🔧 Troubleshooting

### If Deployment Fails:
1. Check Vercel build logs for specific errors
2. Verify all environment variables are set
3. Ensure Supabase database is accessible
4. Check that `NEXT_PUBLIC_USE_LOCAL_STORAGE` is not set to `true`

### If App Works but Data Doesn't Persist:
1. Verify Supabase credentials are correct
2. Check Supabase database logs
3. Ensure sessions table exists and is accessible

## 📞 Emergency Contacts
- **Supabase Dashboard**: Check database status and logs
- **Vercel Dashboard**: Monitor deployment and environment variables
- **Application Logs**: Check browser console for client-side errors

---

**Remember**: Production deployment requires Supabase to be working. Local storage is development-only and will cause deployment failures if Supabase is not properly configured.
